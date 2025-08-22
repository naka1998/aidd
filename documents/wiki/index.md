# ECサイト開発者Wiki / E-commerce Developer Wiki

## 📋 目次 / Table of Contents

このWikiは、ECサイトWebアプリケーションの開発に参加する開発者向けの情報をまとめています。  
This Wiki contains information for developers participating in the development of the e-commerce web application.

---

## 🚀 はじめに / Getting Started

新しく参加される開発者は、以下の順序でドキュメントを読み進めることをお勧めします。  
New developers are recommended to read the documents in the following order:

1. **[開発環境セットアップ](setup-guide.md)** - 開発環境の構築手順
2. **[システムアーキテクチャ](architecture.md)** - システム全体の設計概要
3. **[技術スタック](tech-stack.md)** - 使用している技術の詳細

---

## 📚 開発ガイド / Development Guide

### 基本ガイドライン / Basic Guidelines
- **[コーディング規約](coding-standards.md)** - TypeScript/JavaScript規約とベストプラクティス
- **[Gitワークフロー](git-workflow.md)** - ブランチ戦略とコミット規約
- **[テスト戦略](testing-guide.md)** - テストの実行方法と戦略

### 技術詳細 / Technical Details
- **[DynamoDB運用ガイド](dynamodb-guide.md)** - データベース設計と運用のベストプラクティス
- **[認証システム](authentication.md)** - JWT認証とセキュリティの実装詳細

---

## 🛠️ 運用・デプロイ / Operations & Deployment

- **[デプロイメント](deployment.md)** - 本番環境へのデプロイ手順
- **[トラブルシューティング](troubleshooting.md)** - よくある問題と解決方法
- **[FAQ](faq.md)** - よくある質問と回答

---

## 📖 参考資料 / Reference Materials

### プロジェクトドキュメント / Project Documents
- **[テーブル設計書](../table-definition.txt)** - データベース設計の詳細
- **[API仕様書](../api-spec.txt)** - REST API の完全な仕様

### 外部リソース / External Resources
- [TypeScript 公式ドキュメント](https://www.typescriptlang.org/docs/)
- [DynamoDB 開発者ガイド](https://docs.aws.amazon.com/dynamodb/latest/developerguide/)
- [Dynamoose ドキュメント](https://dynamoosejs.com/)
- [Express.js ガイド](https://expressjs.com/ja/)

---

## 🔄 ドキュメント更新 / Document Updates

このWikiは開発の進行に合わせて継続的に更新されます。  
This Wiki is continuously updated as development progresses.

### 更新ルール / Update Rules
1. **情報の正確性**: 常に最新の実装に合わせて更新
2. **わかりやすさ**: 新規参加者でも理解できる説明
3. **実例重視**: 実際のコードサンプルを含める

### コントリビューション / Contributing
ドキュメントの改善提案や誤記の報告は、GitHubのIssueまたはPull Requestでお願いします。  
Please submit document improvement suggestions or error reports via GitHub Issues or Pull Requests.

---

## 📞 サポート / Support

### 質問・相談 / Questions & Consultation
- **技術的な質問**: [FAQ](faq.md)を確認後、チームSlackで相談
- **緊急事項**: プロジェクトリーダーに直接連絡
- **ドキュメント改善**: GitHubでIssue作成

### 連絡先 / Contact Information
- **プロジェクトリポジトリ**: [GitHub Repository](https://github.com/your-org/ecommerce-app)
- **チーム連絡**: team-ecommerce@example.com

---

## 📈 プロジェクト情報 / Project Information

### 現在のステータス / Current Status
- **バージョン**: v1.0.0
- **開発段階**: 機能実装完了、テスト段階
- **リリース予定**: 2024年2月予定

### 技術概要 / Technical Overview
- **言語**: TypeScript, JavaScript
- **フレームワーク**: Node.js, Express.js
- **データベース**: DynamoDB with Dynamoose ODM
- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **認証**: JWT Bearer Token

---

*最終更新: 2024年1月15日*  
*Last Updated: January 15, 2024*