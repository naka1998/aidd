# ECサイト Webアプリケーション

TypeScript、DynamoDB、Dynamoose ODMを使用したシンプルなECサイトのWebアプリケーションです。

## 技術スタック

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: DynamoDB (AWS) with Dynamoose ODM
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Authentication**: JWT

## 機能

- ユーザー登録・ログイン
- 商品一覧・詳細表示
- 商品のカテゴリー別フィルタリング
- ショッピングカート機能
- 注文処理
- 注文履歴表示
- 商品管理（作成・更新・削除）

## プロジェクト構成

```
/
├── src/
│   ├── models/           # Dynamooseモデル
│   ├── routes/           # APIルート
│   ├── middleware/       # ミドルウェア
│   ├── types/           # TypeScript型定義
│   ├── config/          # 設定ファイル
│   └── app.ts           # メインアプリケーション
├── public/              # 静的ファイル
├── views/               # HTMLテンプレート
└── dist/                # ビルド済みファイル
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の設定を行います：

```env
# Application Configuration
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# AWS DynamoDB設定（本番環境）
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB Local設定（開発環境）
DYNAMODB_ENDPOINT=http://localhost:8000
```

### 3. DynamoDB Local（開発環境）

開発環境では、DynamoDB Localを使用できます：

```bash
# DynamoDB Localをダウンロード・起動
# https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html

# またはDockerを使用
docker run -p 8000:8000 amazon/dynamodb-local
```

### 4. ビルド

```bash
npm run build
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

または、本番環境で：

```bash
npm start
```

## API エンドポイント

### ユーザー関連
- `POST /api/users/register` - ユーザー登録
- `POST /api/users/login` - ユーザーログイン

### 商品関連
- `GET /api/products` - 商品一覧取得
- `GET /api/products/:id` - 商品詳細取得
- `POST /api/products` - 商品作成
- `PUT /api/products/:id` - 商品更新
- `DELETE /api/products/:id` - 商品削除

### 注文関連
- `POST /api/orders` - 注文作成
- `GET /api/orders/user/:userId` - ユーザーの注文履歴取得
- `GET /api/orders/:id` - 注文詳細取得
- `PATCH /api/orders/:id/status` - 注文ステータス更新

## フロントエンド

- `http://localhost:3000/` - ホームページ
- `http://localhost:3000/products` - 商品一覧
- `http://localhost:3000/cart` - ショッピングカート

## データモデル

### User
- id: string (Primary Key)
- email: string (unique, with GSI)
- name: string
- password: string (hashed)
- createdAt: Date
- updatedAt: Date

### Product
- id: string (Primary Key)
- name: string
- description: string
- price: number
- stock: number
- category: string (with GSI)
- imageUrl?: string
- createdAt: Date
- updatedAt: Date

### Order
- id: string (Primary Key)
- userId: string (with GSI)
- items: OrderItem[]
- totalAmount: number
- status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
- createdAt: Date
- updatedAt: Date

## 開発者向け

### TypeScript型チェック
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## セキュリティ

- パスワードはbcryptでハッシュ化
- JWT認証によるAPIアクセス制御
- CORS設定
- Helmet.jsによるセキュリティヘッダー

## 注意事項

- このプロジェクトは学習・検証目的で作成されています
- 本番環境で使用する場合は、追加のセキュリティ対策が必要です
- DynamoDBの設定やAWSの認証情報は適切に管理してください