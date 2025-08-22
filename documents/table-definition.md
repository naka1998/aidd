# ECサイト テーブル設計書 / E-commerce Table Design Document

目次 / Table of Contents

```
1. 概要 / Overview
2. テーブル設計
2.1 User テーブル（ユーザー情報）
テーブル概要
テーブル構造
インデックス
サンプルデータ
2.2 Product テーブル（商品情報）
テーブル概要
テーブル構造
インデックス
カテゴリー値
サンプルデータ
2.3 Order テーブル（注文情報）
テーブル概要
テーブル構造
OrderItem サブオブジェクト構造
インデックス
ステータス値
サンプルデータ
3. データベース設計の考慮事項
3.1 DynamoDB特有の設計
3.2 セキュリティ考慮事項
3.3 パフォーマンス最適化
4. API使用例
ユーザー登録
商品検索
注文作成
5. 更新履歴
```

## 概要 / Overview

このドキュメントでは、TypeScript + DynamoDB + Dynamooseを使用したECサイトWebアプリケーションのデータベース設計について説明します。
This document describes the database design for an e-commerce web application using TypeScript + DynamoDB + Dynamoose.

---

## 1. User テーブル（ユーザー情報）

### テーブル概要 / Table Overview

ユーザーの基本情報を管理するテーブル
Table for managing basic user information

### テーブル構造 / Table Structure

| フィールド名<br>Field Name | データ型<br>Data Type | 制約<br>Constraints | 説明<br>Description |
|---------------------------|---------------------|-------------------|-------------------|
| id | String | Primary Key (Hash Key) | ユーザーの一意識別子（UUID）<br>Unique user identifier (UUID) |
| email | String | Required, GSI | メールアドレス（ログイン用）<br>Email address (for login) |
| name | String | Required | ユーザー名<br>User name |
| password | String | Required | ハッシュ化されたパスワード<br>Hashed password |
| createdAt | Date | Auto-generated | 作成日時<br>Creation timestamp |
| updatedAt | Date | Auto-generated | 更新日時<br>Update timestamp |

### インデックス / Indexes

- **EmailIndex (GSI)**: email フィールドでの検索を高速化
- **EmailIndex (GSI)**: Optimizes search by email field

### サンプルデータ / Sample Data

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "田中太郎",
  "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/9lYgWp2.W",
  "createdAt": "2024-01-15T09:30:00.000Z",
  "updatedAt": "2024-01-15T09:30:00.000Z"
}
```

---

## 2. Product テーブル（商品情報）

### テーブル概要 / Table Overview

商品の詳細情報を管理するテーブル
Table for managing detailed product information

### テーブル構造 / Table Structure

| フィールド名<br>Field Name | データ型<br>Data Type | 制約<br>Constraints | 説明<br>Description |
|---------------------------|---------------------|-------------------|-------------------|
| id | String | Primary Key (Hash Key) | 商品の一意識別子（UUID）<br>Unique product identifier (UUID) |
| name | String | Required | 商品名<br>Product name |
| description | String | Required | 商品説明<br>Product description |
| price | Number | Required, > 0 | 価格（円）<br>Price (JPY) |
| stock | Number | Required, >= 0 | 在庫数<br>Stock quantity |
| category | String | Required, GSI | カテゴリー<br>Category |
| imageUrl | String | Optional | 商品画像URL<br>Product image URL |
| createdAt | Date | Auto-generated | 作成日時<br>Creation timestamp |
| updatedAt | Date | Auto-generated | 更新日時<br>Update timestamp |

### インデックス / Indexes

- **CategoryIndex (GSI)**: category フィールドでの検索を高速化
- **CategoryIndex (GSI)**: Optimizes search by category field

### カテゴリー値 / Category Values

- electronics: 電子機器 / Electronics
- clothing: 衣類 / Clothing
- books: 書籍 / Books
- home: ホーム・ガーデン / Home & Garden
- sports: スポーツ・アウトドア / Sports & Outdoors

### サンプルデータ / Sample Data

```json
{
  "id": "prod-123e4567-e89b-12d3-a456-426614174001",
  "name": "ワイヤレスヘッドホン",
  "description": "高音質のワイヤレスヘッドホン。ノイズキャンセリング機能付き。",
  "price": 15000,
  "stock": 50,
  "category": "electronics",
  "imageUrl": "https://example.com/images/headphone.jpg",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

---

## 3. Order テーブル（注文情報）

### テーブル概要 / Table Overview

顧客の注文情報を管理するテーブル
Table for managing customer order information

### テーブル構造 / Table Structure

| フィールド名<br>Field Name | データ型<br>Data Type | 制約<br>Constraints | 説明<br>Description |
|---------------------------|---------------------|-------------------|-------------------|
| id | String | Primary Key (Hash Key) | 注文の一意識別子（UUID）<br>Unique order identifier (UUID) |
| userId | String | Required, GSI | 注文者のユーザーID<br>Customer user ID |
| items | Array<OrderItem> | Required | 注文商品リスト<br>List of ordered items |
| totalAmount | Number | Required, > 0 | 合計金額（円）<br>Total amount (JPY) |
| status | String | Required, Enum | 注文ステータス<br>Order status |
| createdAt | Date | Auto-generated | 作成日時<br>Creation timestamp |
| updatedAt | Date | Auto-generated | 更新日時<br>Update timestamp |

### OrderItem サブオブジェクト構造 / OrderItem Sub-object Structure

| フィールド名<br>Field Name | データ型<br>Data Type | 制約<br>Constraints | 説明<br>Description |
|---------------------------|---------------------|-------------------|-------------------|
| productId | String | Required | 商品ID<br>Product ID |
| quantity | Number | Required, > 0 | 注文数量<br>Order quantity |
| price | Number | Required, > 0 | 単価（注文時点）<br>Unit price (at order time) |
| name | String | Required | 商品名（注文時点）<br>Product name (at order time) |

### インデックス / Indexes

- **UserOrderIndex (GSI)**: userId フィールドでの検索を高速化（ユーザー別注文履歴）
- **UserOrderIndex (GSI)**: Optimizes search by userId field (user order history)

### ステータス値 / Status Values

- pending: 処理中 / Processing
- confirmed: 確認済み / Confirmed
- shipped: 発送済み / Shipped
- delivered: 配送完了 / Delivered

### サンプルデータ / Sample Data

```json
{
  "id": "order-123e4567-e89b-12d3-a456-426614174002",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "items": [
    {
      "productId": "prod-123e4567-e89b-12d3-a456-426614174001",
      "quantity": 2,
      "price": 15000,
      "name": "ワイヤレスヘッドホン"
    },
    {
      "productId": "prod-123e4567-e89b-12d3-a456-426614174003",
      "quantity": 1,
      "price": 8000,
      "name": "スマートフォンケース"
    }
  ],
  "totalAmount": 38000,
  "status": "confirmed",
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:30:00.000Z"
}
```

---

## データベース設計の考慮事項 / Database Design Considerations

### DynamoDB特有の設計 / DynamoDB-Specific Design

1. **パーティションキー（Hash Key）**: 各テーブルでUUIDを使用し、データを均等に分散
   **Partition Key (Hash Key)**: Using UUIDs in each table to distribute data evenly

2. **グローバルセカンダリインデックス（GSI）**: 頻繁に検索されるフィールドにGSIを設定
   **Global Secondary Index (GSI)**: GSIs are configured for frequently searched fields

3. **非正規化**: DynamoDBの特性を活かし、読み取り性能を優先した設計
   **Denormalization**: Design prioritizing read performance leveraging DynamoDB characteristics

### セキュリティ考慮事項 / Security Considerations

1. **パスワード**: bcryptによるハッシュ化で保存
   **Password**: Stored with bcrypt hashing

2. **JWT認証**: APIアクセス制御にJWTトークンを使用
   **JWT Authentication**: Using JWT tokens for API access control

3. **入力検証**: 全てのAPI入力に対して適切な検証を実施
   **Input Validation**: Proper validation for all API inputs

### パフォーマンス最適化 / Performance Optimization

1. **読み取り最適化**: 商品検索、ユーザー注文履歴取得を高速化
   **Read Optimization**: Optimized for product search and user order history retrieval

2. **書き込み最適化**: 注文処理時の在庫更新を効率化
   **Write Optimization**: Efficient stock updates during order processing

---

## API使用例 / API Usage Examples

### ユーザー登録 / User Registration

```http
POST /api/users/register
{
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "password": "securepassword123"
}
```

### 商品検索 / Product Search

```http
GET /api/products?category=electronics&limit=10
```

### 注文作成 / Order Creation

```http
POST /api/orders
Authorization: Bearer <jwt_token>
{
  "items": [
    {
      "productId": "prod-123...",
      "quantity": 2
    }
  ]
}
```

---

## 更新履歴 / Update History

- 2024-01-15: 初版作成 / Initial version created
- テーブル構造とAPI設計の完成 / Completed table structure and API design
