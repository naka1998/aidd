# システムアーキテクチャ概要

本プロジェクトは、TypeScriptとDynamoDBを使用したシンプルなE Commerceウェブアプリケーションです。

## 技術スタック

### バックエンド
- **Node.js** - サーバーサイドランタイム
- **Express.js** - ウェブアプリケーションフレームワーク
- **TypeScript** - 型安全なJavaScript
- **Dynamoose** - DynamoDB ODM（Object Document Mapper）

### データベース
- **Amazon DynamoDB** - NoSQLデータベース

### セキュリティ・認証
- **bcryptjs** - パスワードハッシュ化
- **jsonwebtoken** - JWT認証
- **helmet** - セキュリティヘッダー設定
- **cors** - Cross-Origin Resource Sharing対応

### フロントエンド
- **Vanilla JavaScript** - クライアントサイド実装
- **HTML/CSS** - ユーザーインターフェース

## アーキテクチャ構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (HTML/CSS/JS) │◄──►│   (Express.js)  │◄──►│   (DynamoDB)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
   ┌────▼────┐            ┌──────▼──────┐         ┌───────▼───────┐
   │ Views   │            │ API Routes  │         │ Data Models   │
   │ Pages   │            │ Controller  │         │ User/Product  │
   │         │            │ Middleware  │         │ Order         │
   └─────────┘            └─────────────┘         └───────────────┘
```

## ディレクトリ構造とレイヤー

### 1. プレゼンテーション層 (Presentation Layer)
**場所**: `views/`, `public/`

- **HTMLテンプレート** (`views/`)
  - `index.html` - ホームページ
  - `products.html` - 商品一覧
  - `cart.html` - ショッピングカート

- **静的ファイル** (`public/`)
  - `css/main.css` - スタイルシート
  - `js/` - クライアントサイドJavaScript
    - `auth.js` - 認証機能
    - `products.js` - 商品管理
    - `cart.js` - カート機能

### 2. アプリケーション層 (Application Layer)
**場所**: `src/routes/`, `src/middleware/`

- **APIルート** (`src/routes/`)
  - `users.ts` - ユーザー認証・管理
  - `products.ts` - 商品管理
  - `orders.ts` - 注文管理

- **ミドルウェア** (`src/middleware/`)
  - `validation.ts` - 入力値バリデーション

### 3. ドメイン層 (Domain Layer)
**場所**: `src/models/`, `src/types/`

- **データモデル** (`src/models/`)
  - `User.ts` - ユーザーエンティティ
  - `Product.ts` - 商品エンティティ
  - `Order.ts` - 注文エンティティ

- **型定義** (`src/types/`)
  - `index.ts` - TypeScript型定義

### 4. インフラストラクチャ層 (Infrastructure Layer)
**場所**: `src/config/`

- **データベース設定** (`src/config/database.ts`)
  - DynamoDB接続設定
  - 環境別設定（開発/本番）

## データフロー

```
1. HTTPリクエスト → Express.js
2. ミドルウェア処理 → セキュリティ・バリデーション
3. ルートハンドラー → ビジネスロジック実行
4. Dynamooseモデル → DynamoDBアクセス
5. JSONレスポンス → クライアント
```

## 主要機能

### ユーザー管理
- **登録**: メール・パスワード・名前での新規ユーザー作成
- **ログイン**: JWT認証によるセッション管理
- **パスワード**: bcryptによる安全なハッシュ化

### 商品管理
- 商品一覧表示
- 商品詳細情報
- 在庫管理

### 注文管理
- ショッピングカート機能
- 注文作成・履歴管理

## セキュリティ機能

### 認証・認可
- **JWT認証**: ステートレスな認証システム
- **パスワードハッシュ化**: bcryptによる安全な保存

### セキュリティ対策
- **Helmet**: HTTPヘッダーセキュリティ
- **CORS**: オリジン制限設定
- **入力値検証**: バリデーションミドルウェア

## スケーラビリティ考慮事項

### DynamoDB設計
- **パーティションキー**: 効率的なデータ分散
- **グローバルセカンダリインデックス**: 検索性能最適化
- **自動スケーリング**: トラフィック変動対応

### 開発・運用
- **TypeScript**: 型安全性による開発効率向上
- **環境変数**: 設定の外部化
- **ログ出力**: デバッグ・監視対応

## 次のステップ

詳細な実装については、以下のドキュメントを参照してください：

- [DynamoDB設計・運用ガイド](./dynamodb-guide.md)
- [API仕様書](./api-spec.md)
- [開発環境セットアップガイド](./setup-guide.md)