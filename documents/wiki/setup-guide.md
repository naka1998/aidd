# 開発環境セットアップガイド

本プロジェクトの開発環境を構築するための手順書です。

## 前提条件

以下のソフトウェアがインストールされている必要があります：

- **Node.js** (推奨バージョン: 18.x 以上)
- **npm** (Node.jsと一緒にインストールされます)
- **Git**
- **AWS CLI** (DynamoDB操作のため)

## 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd aidd
```

## 2. 依存関係のインストール

```bash
npm install
```

## 3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の設定を追加：

```env
# サーバー設定
PORT=3000
CORS_ORIGIN=http://localhost:3000

# AWS DynamoDB設定
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# 認証設定
JWT_SECRET=your_jwt_secret_key_here

# DynamoDB設定
DYNAMODB_TABLE_PREFIX=aidd_
```

## 4. TypeScriptコンパイル

```bash
npm run build
```

## 5. 開発サーバーの起動

### 開発モード（推奨）
```bash
npm run dev
```

### 本番モード
```bash
npm start
```

## 6. 動作確認

ブラウザで以下のURLにアクセス：

- **フロントエンド**: http://localhost:3000
- **API エンドポイント**: http://localhost:3000/api

## 7. 開発用コマンド

```bash
# TypeScriptの型チェック
npm run typecheck

# ESLintによるコード解析
npm run lint

# プロジェクトのビルド
npm run build
```

## ディレクトリ構成

```
aidd/
├── src/                    # TypeScriptソースコード
│   ├── app.ts             # エントリーポイント
│   ├── config/            # 設定ファイル
│   ├── middleware/        # Express ミドルウェア
│   ├── models/           # データモデル
│   ├── routes/           # APIルート定義
│   └── types/            # TypeScript型定義
├── public/               # 静的ファイル（CSS, JS, 画像）
├── views/                # HTMLテンプレート
├── documents/            # プロジェクト文書
├── dist/                 # コンパイル済みJavaScript
└── node_modules/         # 依存関係
```

## トラブルシューティング

### よくある問題

1. **ポート3000が使用中**
   - `.env`ファイルで `PORT=別のポート番号` を設定

2. **DynamoDB接続エラー**
   - AWS認証情報が正しく設定されているか確認
   - AWS CLIで `aws configure` を実行

3. **TypeScriptコンパイルエラー**
   - `npm run typecheck` で詳細な型エラーを確認
   - `node_modules`を削除後、`npm install` を実行

## 次のステップ

開発環境のセットアップが完了したら、以下のドキュメントを参照してください：

- [システムアーキテクチャ概要](./architecture.md)
- [DynamoDB設計・運用ガイド](./dynamodb-guide.md)
- [API仕様書](./api-spec.md)