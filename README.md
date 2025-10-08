# Shanghai Swap - 上海スワップゲーム

**クラスで一番人気の美少女と入れ替われるパズル～30分間の秘密～**

## 🎮 ゲーム概要

上海パズルをクリアすると、クラスで一番人気の美少女と30分間入れ替われる恋愛ノベル×パズルゲーム。

- **ジャンル**: 恋愛ノベル × 上海パズル
- **プラットフォーム**: Electron（Windows/Mac/Linux対応）
- **技術スタック**: React, JavaScript, HTML5, CSS3

## 🚀 開発状況

**Phase 1: MVP（プロトタイプ）- 完成**

✅ 実装済み機能:
- タイトル画面（仮素材）
- 会話システム（タイプライター効果、選択肢分岐）
- 上海パズル（3層・48枚、ヒント機能、タイマー）
- ご褒美シーン
- CSV完全管理（BOM付きUTF-8対応）
- 自動セーブシステム（LocalStorage、5秒間隔）

## 📦 セットアップ

### 必要な環境
- Node.js (v16以上推奨)
- npm or yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（Reactのみ）
npm start

# Electron開発モード（React + Electron）
npm run electron-dev
```

## 🎯 ゲームの流れ

1. **タイトル画面** → ゲーム開始
2. **会話シーン** → 愛莉との会話、選択肢で分岐
3. **上海パズル** → 48枚の牌を削除（制限時間10分）
4. **ご褒美シーン** → クリア報酬の画像・動画表示
5. **タイトルに戻る** → 次のキャラへ

## 📁 プロジェクト構造

```
Shanghai-swap/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── TitleScreen.jsx
│   │   ├── ConversationScene.jsx
│   │   ├── ShanghaiPuzzle.jsx
│   │   └── RewardScene.jsx
│   ├── utils/               # ユーティリティ
│   │   ├── csvLoader.js
│   │   ├── saveManager.js
│   │   └── shanghaiLogic.js
│   ├── styles/              # CSS
│   └── App.jsx
├── data/                    # CSVデータ（BOM付きUTF-8）
│   ├── characters.csv
│   ├── dialogues.csv
│   ├── choices.csv
│   └── scenes.csv
├── assets/                  # 画像・動画・音声
├── public/
├── electron.js              # Electronメインプロセス
└── package.json
```

## 🔧 主要機能

### CSV完全管理
- **BOM付きUTF-8**で日本語完全対応
- キャラクター、会話、選択肢、シーンをCSVで外部管理
- Excelから直接編集可能

### 上海パズル
- 3層構造、48枚の牌
- リアルタイム選択可能判定
- ヒント機能（残り5回）
- 制限時間10分
- 手詰まり時の自動シャッフル

### 自動セーブ
- LocalStorageで5秒間隔の自動保存
- プレイヤー名、進行状況、解放済みご褒美を記録

## 📝 今後の実装予定

**Phase 2: 装飾追加**
- [ ] 本番素材（立ち絵、背景、牌画像）
- [ ] BGM/効果音システム
- [ ] 高度なアニメーション

**Phase 3: コンテンツ拡充**
- [ ] 全キャラクター実装（愛莉、夏帆、美月）
- [ ] ギャラリー機能
- [ ] エンディング分岐（4種類）

**Phase 4: Electron化**
- [ ] インストーラー作成
- [ ] クロスプラットフォームビルド

## 📄 ライセンス

MIT License

## 🤝 開発

- Claude Code (claude.ai/code) で開発
- 詳細な仕様書: `shanghai_romance_spec.md`
