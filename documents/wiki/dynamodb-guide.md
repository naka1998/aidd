# DynamoDB設計・運用ガイド

本プロジェクトにおけるAmazon DynamoDBの設計方針、実装詳細、運用ノウハウをまとめたガイドです。

## 目次

1. [DynamoDBアーキテクチャ概要](#dynamodbアーキテクチャ概要)
2. [テーブル設計詳細](#テーブル設計詳細)
3. [Dynamoose実装パターン](#dynamoose実装パターン)
4. [パフォーマンス最適化](#パフォーマンス最適化)
5. [運用・監視](#運用監視)
6. [トラブルシューティング](#トラブルシューティング)

## DynamoDBアーキテクチャ概要

### 基本原則

本プロジェクトのDynamoDB設計は以下の原則に従います：

1. **単一テーブル設計の回避**: 複雑性を避け、各エンティティに専用テーブルを設計
2. **読み取り最適化**: E-commerceの特性上、読み取り性能を優先
3. **非正規化**: DynamoDBの特性を活かし、JOINを避けた設計
4. **スケーラビリティ**: パーティションキーによる効率的なデータ分散

### 全体構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    User Table   │    │  Product Table  │    │   Order Table   │
│                 │    │                 │    │                 │
│ PK: id (UUID)   │    │ PK: id (UUID)   │    │ PK: id (UUID)   │
│ GSI: email      │    │ GSI: category   │    │ GSI: userId     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## テーブル設計詳細

### 1. Userテーブル

#### 設計の考慮事項

- **パーティションキー**: UUID使用によるホットパーティション回避
- **グローバルセカンダリインデックス**: メールアドレスによる高速ログイン
- **セキュリティ**: パスワードはbcryptハッシュで保存

#### スキーマ実装

```typescript
const userSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,                    // パーティションキー
    default: () => uuidv4(),          // 自動UUID生成
  },
  email: {
    type: String,
    required: true,
    index: {
      name: 'EmailIndex',
      type: 'global',                 // GSI設定
    },
  },
  name: { type: String, required: true },
  password: { type: String, required: true },
}, {
  timestamps: true,                   // createdAt/updatedAt自動追加
});
```

#### クエリパターン

```typescript
// プライマリキーによる検索
const user = await User.get('user-uuid');

// GSIによるメール検索
const users = await User.query('email').eq('user@example.com').exec();
```

### 2. Productテーブル

#### 設計の考慮事項

- **カテゴリー検索**: GSIによる高速カテゴリフィルタリング
- **在庫管理**: 条件付き更新による同時実行制御
- **価格設定**: Number型による正確な計算

#### スキーマ実装

```typescript
const productSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    default: () => uuidv4(),
  },
  category: {
    type: String,
    required: true,
    index: {
      name: 'CategoryIndex',
      type: 'global',                 // カテゴリー検索用GSI
    },
  },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  // その他フィールド...
});
```

#### 在庫更新の実装例

```typescript
// 条件付き更新による在庫管理
const updateStock = async (productId: string, quantity: number) => {
  try {
    const product = await Product.update(
      { id: productId },
      { $ADD: { stock: -quantity } },
      {
        condition: 'stock >= :qty',    // 在庫不足時は更新を拒否
        conditionValues: { qty: quantity },
      }
    );
    return product;
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      throw new Error('在庫不足です');
    }
    throw error;
  }
};
```

### 3. Orderテーブル

#### 設計の考慮事項

- **ユーザー履歴**: GSIによる効率的な注文履歴取得
- **非正規化**: 注文時点の商品情報を保存
- **ステータス管理**: enumによる状態制御

#### スキーマ実装

```typescript
const orderItemSchema = new dynamoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },    // 注文時点の価格
  name: { type: String, required: true },     // 注文時点の商品名
});

const orderSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    default: () => uuidv4(),
  },
  userId: {
    type: String,
    required: true,
    index: {
      name: 'UserOrderIndex',
      type: 'global',                 // ユーザー注文履歴用GSI
    },
  },
  items: {
    type: Array,
    schema: [orderItemSchema],        // ネストしたオブジェクト配列
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'confirmed', 'shipped', 'delivered'],
  },
});
```

## Dynamoose実装パターン

### 1. 設定ファイルの構成

```typescript
// src/config/database.ts
import dynamoose from 'dynamoose';

const isDevelopment = process.env.NODE_ENV !== 'production';

// 開発環境：DynamoDB Local対応
if (isDevelopment && process.env.DYNAMODB_ENDPOINT) {
  dynamoose.aws.ddb.local(process.env.DYNAMODB_ENDPOINT);
}

// 本番環境：AWS DynamoDB設定
if (!isDevelopment || !process.env.DYNAMODB_ENDPOINT) {
  dynamoose.aws.ddb.set({
    region: process.env.AWS_REGION || 'ap-northeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
}
```

### 2. エラーハンドリングパターン

```typescript
// 共通エラーハンドリング
const handleDynamooseError = (error: any) => {
  switch (error.code) {
    case 'ConditionalCheckFailedException':
      return { status: 409, message: '条件チェックエラー' };
    case 'ResourceNotFoundException':
      return { status: 404, message: 'リソースが見つかりません' };
    case 'ValidationException':
      return { status: 400, message: '入力値が無効です' };
    default:
      return { status: 500, message: 'データベースエラー' };
  }
};
```

### 3. トランザクション処理

```typescript
// 注文処理のトランザクション例
const createOrderWithStockUpdate = async (orderData: any) => {
  const transactionItems = [];

  // 各商品の在庫確認・更新
  for (const item of orderData.items) {
    transactionItems.push({
      Update: {
        TableName: 'Product',
        Key: { id: item.productId },
        UpdateExpression: 'ADD stock :qty',
        ConditionExpression: 'stock >= :qty',
        ExpressionAttributeValues: {
          ':qty': -item.quantity,
        },
      },
    });
  }

  // 注文作成
  transactionItems.push({
    Put: {
      TableName: 'Order',
      Item: orderData,
    },
  });

  // トランザクション実行
  await dynamoose.transaction(transactionItems);
};
```

## パフォーマンス最適化

### 1. 読み取り最適化

#### バッチ読み取り

```typescript
// 複数商品の一括取得
const getProductsByIds = async (productIds: string[]) => {
  const products = await Product.batchGet(productIds);
  return products;
};
```

#### ページネーション

```typescript
// カテゴリー別商品一覧（ページング対応）
const getProductsByCategory = async (category: string, lastKey?: any, limit = 20) => {
  const query = Product.query('category').eq(category).limit(limit);
  
  if (lastKey) {
    query.startAt(lastKey);
  }
  
  const result = await query.exec();
  return {
    items: result,
    lastKey: result.lastKey,
  };
};
```

### 2. 書き込み最適化

#### バッチ書き込み

```typescript
// 複数商品の一括作成
const createMultipleProducts = async (products: any[]) => {
  await Product.batchPut(products);
};
```

### 3. インデックス設計の考慮事項

1. **GSI容量**: インデックスが適切にスケールするか確認
2. **射影属性**: 必要最小限の属性のみを射影
3. **クエリパターン**: 頻繁なクエリパターンに適したインデックス設計

## 運用・監視

### 1. 環境変数設定

```bash
# .env ファイル例
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# 開発環境用（DynamoDB Local）
DYNAMODB_ENDPOINT=http://localhost:8000
```

### 2. 容量監視

- **読み取り容量**: 商品検索の負荷監視
- **書き込み容量**: 注文処理の負荷監視
- **GSI容量**: カテゴリー検索、ユーザー履歴の負荷監視

### 3. コスト最適化

1. **オンデマンド vs プロビジョンド**: トラフィックパターンに応じた選択
2. **TTL活用**: 不要データの自動削除
3. **ストレージクラス**: アクセス頻度に応じた最適化

## トラブルシューティング

### よくある問題と解決策

#### 1. ホットパーティション

**問題**: 特定のパーティションキーに負荷が集中

**解決策**:
- UUIDの使用（現在の実装）
- パーティションキーの分散性確認

#### 2. GSIスロットリング

**問題**: GSIクエリでThrottlingExceptionが発生

**解決策**:
```typescript
// リトライ機能付きクエリ
const queryWithRetry = async (query: any, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await query.exec();
    } catch (error) {
      if (error.code === 'ProvisionedThroughputExceededException' && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
};
```

#### 3. 項目サイズ制限

**問題**: 400KB制限を超える項目

**解決策**:
- 大きなデータはS3に保存し、URLをDynamoDBに格納
- 項目の分割設計

### デバッグ手法

#### DynamoDB Local環境

```bash
# DynamoDB Local起動
docker run -p 8000:8000 amazon/dynamodb-local

# テーブル確認
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

#### ログ出力設定

```typescript
// Dynamooseデバッグログ有効化
dynamoose.logger().providers.add(console);
```

## まとめ

本プロジェクトのDynamoDB設計は、E-commerceアプリケーションの要件に最適化されています：

- **スケーラビリティ**: パーティションキー設計による効率的なデータ分散
- **パフォーマンス**: GSIによる高速検索
- **保守性**: Dynamooseによる型安全な実装
- **運用性**: 環境別設定による柔軟なデプロイメント

継続的な監視と最適化により、本番環境での安定運用を実現してください。