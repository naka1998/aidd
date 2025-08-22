# ECサイト API仕様書 / E-commerce API Specification

## 概要 / Overview

ECサイトWebアプリケーションのREST API仕様書です。
REST API specification for the e-commerce web application.

**Base URL**: `http://localhost:3000/api`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`

---

## 認証 / Authentication

### JWT認証について / About JWT Authentication

- ログイン後に取得したJWTトークンを使用
- Use JWT token obtained after login
- Header format: `Authorization: Bearer <token>`

---

## 1. ユーザー管理 API / User Management API

### 1.1 ユーザー登録 / User Registration

**エンドポイント / Endpoint**: `POST /api/users/register`  
**認証 / Auth**: 不要 / Not required

#### リクエスト / Request

```json
{
  "name": "string",        // 必須：ユーザー名 / Required: User name
  "email": "string",       // 必須：メールアドレス / Required: Email address
  "password": "string"     // 必須：パスワード（6文字以上）/ Required: Password (6+ chars)
}
```

#### レスポンス / Response

**成功時 (201 Created)**

```json
{
  "success": true,
  "message": "ユーザーが正常に登録されました",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "田中太郎"
  }
}
```

**エラー時 (400 Bad Request)**

```json
{
  "success": false,
  "error": "このメールアドレスは既に使用されています"
}
```

### 1.2 ユーザーログイン / User Login

**エンドポイント / Endpoint**: `POST /api/users/login`  
**認証 / Auth**: 不要 / Not required

#### リクエスト / Request

```json
{
  "email": "string",       // 必須：メールアドレス / Required: Email address
  "password": "string"     // 必須：パスワード / Required: Password
}
```

#### レスポンス / Response

**成功時 (200 OK)**

```json
{
  "success": true,
  "message": "ログインに成功しました",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "田中太郎"
    }
  }
}
```

**エラー時 (401 Unauthorized)**

```json
{
  "success": false,
  "error": "メールアドレスまたはパスワードが正しくありません"
}
```

---

## 2. 商品管理 API / Product Management API

### 2.1 商品一覧取得 / Get Products List

**エンドポイント / Endpoint**: `GET /api/products`  
**認証 / Auth**: 不要 / Not required

#### クエリパラメータ / Query Parameters

- `category` (optional): カテゴリーでフィルタ / Filter by category
- `limit` (optional): 取得件数 (default: 20) / Number of items (default: 20)
- `offset` (optional): オフセット (default: 0) / Offset (default: 0)

#### レスポンス / Response

**成功時 (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod-123e4567-e89b-12d3-a456-426614174001",
      "name": "ワイヤレスヘッドホン",
      "description": "高音質のワイヤレスヘッドホン。ノイズキャンセリング機能付き。",
      "price": 15000,
      "stock": 50,
      "category": "electronics",
      "imageUrl": "https://example.com/images/headphone.jpg",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### 2.2 商品詳細取得 / Get Product Details

**エンドポイント / Endpoint**: `GET /api/products/:id`  
**認証 / Auth**: 不要 / Not required

#### パスパラメータ / Path Parameters

- `id`: 商品ID / Product ID

#### レスポンス / Response

**成功時 (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "prod-123e4567-e89b-12d3-a456-426614174001",
    "name": "ワイヤレスヘッドホン",
    "description": "高音質のワイヤレスヘッドホン。ノイズキャンセリング機能付き。",
    "price": 15000,
    "stock": 50,
    "category": "electronics",
    "imageUrl": "https://example.com/images/headphone.jpg",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**エラー時 (404 Not Found)**

```json
{
  "success": false,
  "error": "商品が見つかりません"
}
```

### 2.3 商品作成 / Create Product

**エンドポイント / Endpoint**: `POST /api/products`  
**認証 / Auth**: 必要 / Required

#### リクエスト / Request

```json
{
  "name": "string",           // 必須：商品名 / Required: Product name
  "description": "string",    // 必須：商品説明 / Required: Product description
  "price": "number",          // 必須：価格 / Required: Price
  "stock": "number",          // 必須：在庫数 / Required: Stock quantity
  "category": "string",       // 必須：カテゴリー / Required: Category
  "imageUrl": "string"        // オプション：画像URL / Optional: Image URL
}
```

#### レスポンス / Response

**成功時 (201 Created)**

```json
{
  "success": true,
  "message": "商品が正常に作成されました",
  "data": {
    "id": "prod-123e4567-e89b-12d3-a456-426614174001",
    "name": "ワイヤレスヘッドホン",
    "description": "高音質のワイヤレスヘッドホン。ノイズキャンセリング機能付き。",
    "price": 15000,
    "stock": 50,
    "category": "electronics",
    "imageUrl": "https://example.com/images/headphone.jpg",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 2.4 商品更新 / Update Product

**エンドポイント / Endpoint**: `PUT /api/products/:id`  
**認証 / Auth**: 必要 / Required

#### パスパラメータ / Path Parameters

- `id`: 商品ID / Product ID

#### リクエスト / Request

```json
{
  "name": "string",           // 必須：商品名 / Required: Product name
  "description": "string",    // 必須：商品説明 / Required: Product description
  "price": "number",          // 必須：価格 / Required: Price
  "stock": "number",          // 必須：在庫数 / Required: Stock quantity
  "category": "string",       // 必須：カテゴリー / Required: Category
  "imageUrl": "string"        // オプション：画像URL / Optional: Image URL
}
```

### 2.5 商品削除 / Delete Product

**エンドポイント / Endpoint**: `DELETE /api/products/:id`  
**認証 / Auth**: 必要 / Required

#### パスパラメータ / Path Parameters

- `id`: 商品ID / Product ID

#### レスポンス / Response

**成功時 (200 OK)**

```json
{
  "success": true,
  "message": "商品が正常に削除されました"
}
```

---

## 3. 注文管理 API / Order Management API

### 3.1 注文作成 / Create Order

**エンドポイント / Endpoint**: `POST /api/orders`  
**認証 / Auth**: 必要 / Required

#### リクエスト / Request

```json
{
  "items": [                // 必須：注文商品リスト / Required: Order items list
    {
      "productId": "string", // 必須：商品ID / Required: Product ID
      "quantity": "number"   // 必須：数量 / Required: Quantity
    }
  ]
}
```

#### レスポンス / Response

**成功時 (201 Created)**

```json
{
  "success": true,
  "message": "注文が正常に作成されました",
  "data": {
    "id": "order-123e4567-e89b-12d3-a456-426614174002",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "items": [
      {
        "productId": "prod-123e4567-e89b-12d3-a456-426614174001",
        "quantity": 2,
        "price": 15000,
        "name": "ワイヤレスヘッドホン"
      }
    ],
    "totalAmount": 30000,
    "status": "pending",
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**エラー時 (400 Bad Request)**

```json
{
  "success": false,
  "error": "商品 \"ワイヤレスヘッドホン\" の在庫が不足しています"
}
```

### 3.2 ユーザー注文履歴取得 / Get User Order History

**エンドポイント / Endpoint**: `GET /api/orders/user/:userId`  
**認証 / Auth**: 必要 / Required

#### パスパラメータ / Path Parameters

- `userId`: ユーザーID / User ID

### 3.3 注文詳細取得 / Get Order Details

**エンドポイント / Endpoint**: `GET /api/orders/:id`  
**認証 / Auth**: 必要 / Required

#### パスパラメータ / Path Parameters

- `id`: 注文ID / Order ID

### 3.4 注文ステータス更新 / Update Order Status

**エンドポイント / Endpoint**: `PATCH /api/orders/:id/status`  
**認証 / Auth**: 必要 / Required

#### パスパラメータ / Path Parameters

- `id`: 注文ID / Order ID

#### リクエスト / Request

```json
{
  "status": "string"  // 必須：新しいステータス / Required: New status
}
```

**有効なステータス値 / Valid Status Values**:

- `pending`: 処理中 / Processing
- `confirmed`: 確認済み / Confirmed
- `shipped`: 発送済み / Shipped
- `delivered`: 配送完了 / Delivered

---

## 4. エラーレスポンス / Error Responses

### 4.1 認証エラー / Authentication Errors

**401 Unauthorized**

```json
{
  "success": false,
  "error": "アクセストークンが必要です"
}
```

**403 Forbidden**

```json
{
  "success": false,
  "error": "無効なトークンです"
}
```

### 4.2 バリデーションエラー / Validation Errors

**400 Bad Request**

```json
{
  "success": false,
  "error": "メール、名前、パスワードは必須です"
}
```

### 4.3 リソース未発見エラー / Resource Not Found Errors

**404 Not Found**

```json
{
  "success": false,
  "error": "商品が見つかりません"
}
```

### 4.4 サーバーエラー / Server Errors

**500 Internal Server Error**

```json
{
  "success": false,
  "error": "サーバー内部エラーが発生しました"
}
```

---

## 5. 商品カテゴリー一覧 / Product Categories

 < /dev/null |  カテゴリーコード | カテゴリー名 |
|-----------------|-------------|
| electronics | 電子機器 / Electronics |
| clothing | 衣類 / Clothing |
| books | 書籍 / Books |
| home | ホーム・ガーデン / Home & Garden |
| sports | スポーツ・アウトドア / Sports & Outdoors |

---

## 6. 使用例 / Usage Examples

### ユーザー登録からログインまで / User Registration to Login

```bash
# 1. ユーザー登録 / User Registration
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "password": "securepassword123"
  }'

# 2. ログイン / Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tanaka@example.com",
    "password": "securepassword123"
  }'
```

### 商品操作 / Product Operations

```bash
# 商品一覧取得 / Get Products List
curl -X GET "http://localhost:3000/api/products?category=electronics&limit=5"

# 商品作成 / Create Product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "新商品",
    "description": "商品説明",
    "price": 10000,
    "stock": 20,
    "category": "electronics"
  }'
```

### 注文操作 / Order Operations

```bash
# 注文作成 / Create Order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "prod-123...",
        "quantity": 2
      }
    ]
  }'
```

---

## 更新履歴 / Update History

- 2024-01-15: 初版作成 / Initial version created
- APIエンドポイントと仕様の完成 / Completed API endpoints and specifications
