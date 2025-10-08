# クラスで一番人気の美少女と入れ替われるパズル～30分間の秘密～ 完全仕様書 v1.0

## 📋 目次
1. [ゲーム概要](#1-ゲーム概要)
2. [必須4画面UI/UX設計](#2-必須4画面uiux設計)
3. [ゲームシステム](#3-ゲームシステム)
4. [キャラクター設定](#4-キャラクター設定)
5. [ストーリー・エンディング](#5-ストーリーエンディング)
6. [CSV完全管理システム](#6-csv完全管理システム)
7. [UI画像・動画仕様](#7-ui画像動画仕様)
8. [アニメーション仕様](#8-アニメーション仕様)
9. [段階的開発ロードマップ](#9-段階的開発ロードマップ)
10. [実装サンプルコード](#10-実装サンプルコード)
11. [想定プレイフロー](#11-想定プレイフロー)

---

## 1. ゲーム概要

### 1.1 コンセプト
**タイトル**: 『クラスで一番人気の美少女と入れ替われるパズル～30分間の秘密～』

**ジャンル**: 恋愛ノベル × パズルゲーム（上海）

**コアコンセプト**:
- 90年代ゲームセンター風「クリア報酬型」恋愛ゲーム
- 上海パズルに勝利すると、クラスで一番人気の美少女と30分間入れ替われる
- 憧れの彼女視点で日常を体験し、秘密を知る
- クリア報酬として「ご褒美画像・動画」が解放される
- 全キャラクリアで特別なコンプリート動画が視聴可能
- 男性の密かな願望「好きな子になってみたい」を叶えるゲーム

### 1.2 プラットフォーム・技術
- **プラットフォーム**: Electron（Windows/Mac/Linux対応）
- **技術スタック**: HTML5, CSS3, JavaScript, React
- **データ管理**: CSV完全外部化（BOM付きUTF-8）
- **セーブシステム**: LocalStorage自動保存（5秒間隔）

### 1.3 プレイ時間
- **体験版**: 15-20分（チュートリアル1キャラ完結）
- **完全版想定**: 60-90分（全キャラクリア）

### 1.4 ゲーム目標
1. 会話シーンで正しい選択肢を選ぶ
2. 上海パズルをクリアする
3. 憧れの美少女と入れ替わり、30分間の秘密体験
4. ご褒美コンテンツを解放する
5. 全キャラクリアでコンプリート報酬獲得

### 1.5 ターゲット層
- **メイン**: 20-40代男性
- **サブ**: 恋愛シミュレーション好き、パズルゲーム好き
- **訴求ポイント**: 「好きな子のリコーダーを吹いてみたい」的な密かな男性の願望

---

## 2. 必須4画面UI/UX設計

### 2.1 タイトル画面

**レイアウト**:
```
┌──────────────────────────────────────────┐
│                                          │
│         [ゲームタイトルロゴ]             │
│  クラスで一番人気の美少女と              │
│    入れ替われるパズル                    │
│      ～30分間の秘密～                    │
│                                          │
│         [キャラクター立ち絵3人]          │
│       愛莉      夏帆      美月           │
│                                          │
│         ┌──────────────┐                 │
│         │  ▶ はじめから  │                 │
│         ├──────────────┤                 │
│         │  ▶ つづきから  │                 │
│         ├──────────────┤                 │
│         │  ▶ ギャラリー  │                 │
│         ├──────────────┤                 │
│         │  ▶ 設定       │                 │
│         └──────────────┘                 │
│                                          │
│         [BGM: タイトル曲ループ再生]       │
│         Ver 1.0 (DEMO)                   │
└──────────────────────────────────────────┘
```

**仕様**:
- 背景: 学園風景（夕焼け空・教室のシルエット）
- キャラ立ち絵: 3人横並び（透過PNG）
- タイトルロゴ: 2段組み表示
  - メインタイトル: 「クラスで一番人気の美少女と入れ替われるパズル」
  - サブタイトル: 「～30分間の秘密～」
- ボタン: ホバー時に拡大＋光エフェクト
- BGM: 甘く切ない青春系の曲
- アニメーション: タイトルロゴがゆっくりフェードイン

**インタラクティブ要素**:
- キャラクター立ち絵にマウスホバーで微笑みモーション
- ボタンクリック時に効果音（ピコン）
- 背景に桜の花びらが舞うエフェクト（オプション）

---

### 2.2 会話シーン画面

**レイアウト**:
```
┌──────────────────────────────────────────┐
│  [背景画像: 教室/廊下/屋上など]          │
│                                          │
│                    [キャラ立ち絵]        │
│                    （表情差分対応）       │
│                                          │
│                                          │
│  ┌────────────────────────────────┐    │
│  │ [キャラ名]   星野 愛莉              │    │
│  ├────────────────────────────────┤    │
│  │ こんにちは！今日も良い天気だね。    │    │
│  │ ねえ、ちょっとお願いがあるんだけど… │    │
│  │                                    │    │
│  └────────────────────────────────┘    │
│           [▼ クリックで次へ]              │
└──────────────────────────────────────────┘
```

**仕様**:
- **テキスト表示**: タイプライター風（1文字ずつ表示）
- **表示速度**: 50ms/文字（設定で変更可能）
- **キャラ立ち絵**: 
  - 位置: 画面右側
  - サイズ: 高さ80%
  - 表情差分: 通常/笑顔/困り顔/怒り/照れ（最低5種類）
- **背景変化**: シーンに応じて自動切り替え
- **テキストボックス**: 半透明黒背景（opacity: 0.8）
- **キャラ名表示**: 左上に常時表示

**感情表現システム**:
```csv
dialogue_id,character,emotion,text
1,星野 愛莉,normal,こんにちは！
2,星野 愛莉,smile,今日も良い天気だね。
3,星野 愛莉,shy,ねえ、ちょっとお願いがあるんだけど…
```

**選択肢表示**:
```
┌──────────────────────────────────────────┐
│  選択肢が表示される場合:                  │
│  ┌────────────────────────────────┐    │
│  │ ▶ もちろん！何でも聞くよ！        │    │
│  ├────────────────────────────────┤    │
│  │ ▶ 忙しいから後でね                │    │
│  ├────────────────────────────────┤    │
│  │ ▶ どんなお願い？（詳しく聞く）    │    │
│  └────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

---

### 2.3 メインゲーム画面（上海パズル）

**レイアウト**:
```
┌──────────────────────────────────────────┐
│ [HUD]                                    │
│ 残り: 40枚 | 時間: 03:45 | ヒント: 3回  │
├──────────────────────────────────────────┤
│                                          │
│         [上海パズル盤面]                 │
│                                          │
│     ┌─┬─┬─┬─┬─┬─┬─┬─┐           │
│     │牌│牌│牌│牌│牌│牌│牌│牌│           │
│     ├─┼─┼─┼─┼─┼─┼─┼─┤           │
│     │牌│牌│牌│牌│牌│牌│牌│牌│           │
│     ├─┼─┼─┼─┼─┼─┼─┼─┤           │
│     │牌│牌│牌│牌│牌│牌│牌│牌│           │
│     └─┴─┴─┴─┴─┴─┴─┴─┘           │
│                                          │
│                                          │
│  [ボタン類]                              │
│  [💡ヒント] [↩️やり直し] [🔄新規ゲーム]  │
└──────────────────────────────────────────┘
```

**体験版仕様（チュートリアル）**:
- **牌数**: 40-50枚
- **レイアウト**: 3層構造（簡易版）
- **制限時間**: 10分
- **ヒント回数**: 5回まで
- **手詰まり**: 自動シャッフル（ペナルティなし）

**完全版仕様**:
- **牌数**: 144枚（標準レイアウト「龍」）
- **レイアウト**: 5層構造
- **制限時間**: 15分
- **ヒント回数**: 3回まで

**HUD要素**:
- 残り牌数: リアルタイム更新
- 経過時間: MM:SS形式
- ヒント残り回数: アイコン表示

**牌の視覚デザイン**:
- サイズ: 60px × 80px
- 立体効果: box-shadow使用
- 選択可能牌: 明るく表示
- 選択不可牌: 暗く表示（opacity: 0.6）
- 選択中牌: 金色の枠（border: 3px solid gold）

**キャラ応援システム**（オプション）:
- パズル中、画面隅に小さくキャラ立ち絵表示
- 進捗に応じて応援セリフ吹き出し
  - 50%消化: 「頑張って！」
  - 75%消化: 「あともう少し！」
  - 90%消化: 「すごい！もうすぐだよ！」

---

### 2.4 マルチエンディング画面

**4種類のエンディング**:

#### 2.4.1 ハッピーエンド（パズルクリア成功）
```
┌──────────────────────────────────────────┐
│  [背景: 夕焼けの屋上]                    │
│                                          │
│              [キャラ立ち絵: 笑顔]        │
│                                          │
│  ┌────────────────────────────────┐    │
│  │ 星野 愛莉                           │    │
│  ├────────────────────────────────┤    │
│  │ やった！ありがとう！                │    │
│  │ 約束通り、30分間入れ替わろうね♪     │    │
│  └────────────────────────────────┘    │
│                                          │
│         [▶ ご褒美コンテンツへ]           │
└──────────────────────────────────────────┘
```

**演出**:
- BGM: 明るく感動的な曲
- 背景: 温かみのある夕焼け色調
- キャラ立ち絵: 最高の笑顔
- エフェクト: キラキラパーティクル

#### 2.4.2 BADエンド（選択肢ミス）
```
┌──────────────────────────────────────────┐
│  [背景: 薄暗い教室]                      │
│                                          │
│  ┌────────────────────────────────┐    │
│  │                                    │    │
│  │   俺はまた、                       │    │
│  │   つまらない日常に戻った…          │    │
│  │                                    │    │
│  └────────────────────────────────┘    │
│                                          │
│         [▶ タイトルに戻る]               │
└──────────────────────────────────────────┘
```

**演出**:
- BGM: 静かで物悲しい曲
- 背景: モノトーン
- テキスト: ゆっくりフェードイン

#### 2.4.3 BADエンド特別版（木村美咲登場）
```
┌──────────────────────────────────────────┐
│  [背景: 廊下]                            │
│                                          │
│         [木村美咲立ち絵: 怒り顔]         │
│                                          │
│  ┌────────────────────────────────┐    │
│  │ 木村 美咲                           │    │
│  ├────────────────────────────────┤    │
│  │ ちょっとアンタ！                   │    │
│  │ 何サボってんの！？                 │    │
│  │ 今から特訓よ特訓！！               │    │
│  └────────────────────────────────┘    │
│                                          │
│    [▶ 美咲との特別ルートへ（BADエンド）]  │
└──────────────────────────────────────────┘
```

**演出**:
- BGM: コミカルで慌ただしい曲
- 背景: 通常の明るさ
- エフェクト: ビックリマーク演出

#### 2.4.4 ゲームオーバー（パズル失敗）
```
┌──────────────────────────────────────────┐
│                                          │
│         [大きく表示]                     │
│                                          │
│           TIME UP                        │
│         GAME OVER                        │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  [リトライ]  [タイトルへ]          │    │
│  └────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

**演出**:
- BGM: ゲームオーバージングル
- 背景: 暗転
- テキスト: 赤文字で点滅

---

### 2.5 ギャラリー画面

**レイアウト**:
```
┌──────────────────────────────────────────┐
│  ギャラリー                              │
│  ┌────┬────┬────┬────┐              │
│  │愛莉│愛莉│愛莉│ ？ │              │
│  │画像│画像│動画│    │              │
│  │ 1  │ 2  │ 1  │    │              │
│  ├────┼────┼────┼────┤              │
│  │夏帆│夏帆│ ？ │ ？ │              │
│  │画像│動画│    │    │              │
│  │ 1  │ 1  │    │    │              │
│  ├────┼────┼────┼────┤              │
│  │美月│ ？ │ ？ │ ？ │              │
│  │画像│    │    │    │              │
│  │ 1  │    │    │    │              │
│  ├────┼────┼────┼────┤              │
│  │美咲│ ？ │コン│ ？ │              │
│  │画像│    │プリ│    │              │
│  │ 1  │    │動画│    │              │
│  └────┴────┴────┴────┘              │
│                                          │
│  [◀ 戻る]                                │
└──────────────────────────────────────────┘
```

**仕様**:
- **未取得**: 黒背景に「？」表示
- **取得済み**: サムネイル表示
- **クリック動作**:
  - 画像: 全画面拡大表示
  - 動画: 専用プレイヤーで再生
- **やりこみ要素**: 各キャラ3パターンランダム解放

---

### 2.6 設定画面

**レイアウト**:
```
┌──────────────────────────────────────────┐
│  設定                                    │
│                                          │
│  BGM音量:  [======|---] 70%              │
│  SE音量:   [=====|----] 50%              │
│                                          │
│  テキスト速度: [遅い] [普通] [速い]      │
│                                          │
│  ウィンドウモード: [全画面] [ウィンドウ]│
│                                          │
│  セーブデータ:                           │
│    [データ削除]  [エクスポート]          │
│                                          │
│  [◀ 戻る]                                │
└──────────────────────────────────────────┘
```

---

## 3. ゲームシステム

### 3.1 メインゲームループ

```
START
  ↓
タイトル画面
  ↓
名前入力
  ↓
オープニング会話
  ↓
選択肢
  ├─ 正解 → 上海パズル開始
  └─ 不正解 → BADエンド
      ↓
  上海パズル（40-50枚・3層）
      ├─ クリア → ご褒美コンテンツ
      └─ 失敗 → ゲームオーバー
          ↓
  入れ替わり体験（選択式ADV）
      ↓
  ご褒美画像・動画表示
      ↓
  ギャラリー登録
      ↓
  エンディング
      ↓
  タイトルへ戻る or 次のキャラへ
```

### 3.2 上海パズルシステム

#### 3.2.1 基本ルール
1. 同じ絵柄の麻雀牌を2枚1組で選択
2. 以下の条件を満たす牌のみ取れる:
   - 上に他の牌が乗っていない
   - 左右どちらか一方以上が空いている
3. すべての牌を取り除けたらクリア

#### 3.2.2 牌データ構造
```javascript
const tile = {
  id: Number,           // 牌の一意なID
  type: String,         // 牌の種類 ('1m', '2p', 'east'など)
  x: Number,            // X座標（グリッド位置）
  y: Number,            // Y座標（グリッド位置）
  layer: Number,        // 層（0が最下層）
  isRemoved: Boolean,   // 削除済みフラグ
  isSelectable: Boolean // 選択可能フラグ（動的計算）
}
```

#### 3.2.3 選択可能判定ロジック
```javascript
function isSelectable(tile, allTiles) {
  if (tile.isRemoved) return false;
  
  // 上に牌があるかチェック
  const hasBlockingTileAbove = allTiles.some(t => 
    !t.isRemoved &&
    t.layer === tile.layer + 1 &&
    isOverlapping(t, tile)
  );
  
  if (hasBlockingTileAbove) return false;
  
  // 左右チェック
  const leftBlocked = allTiles.some(t =>
    !t.isRemoved &&
    t.layer === tile.layer &&
    t.x === tile.x - 1 &&
    t.y === tile.y
  );
  
  const rightBlocked = allTiles.some(t =>
    !t.isRemoved &&
    t.layer === tile.layer &&
    t.x === tile.x + 1 &&
    t.y === tile.y
  );
  
  return !leftBlocked || !rightBlocked;
}
```

#### 3.2.4 ヒント機能
```javascript
function findHint(tiles) {
  const selectableTiles = tiles.filter(t => 
    !t.isRemoved && isSelectable(t, tiles)
  );
  
  for (let i = 0; i < selectableTiles.length; i++) {
    for (let j = i + 1; j < selectableTiles.length; j++) {
      if (selectableTiles[i].type === selectableTiles[j].type) {
        return [selectableTiles[i], selectableTiles[j]];
      }
    }
  }
  
  return null; // ペアなし
}
```

#### 3.2.5 簡易レイアウト（体験版・40-50枚）
```javascript
const tutorialLayout = {
  layer0: [
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0]
  ],
  layer1: [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0]
  ],
  layer2: [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0]
  ]
};
// 合計: 48枚
```

### 3.3 入れ替わり体験システム

#### 3.3.1 コンセプト
- パズルクリア後、30分間クラスで一番人気の美少女と入れ替われる
- 憧れのあの子視点で日常を体験
- 選択肢によって展開が変化
- 「好きな子のリコーダーを吹く」的な密かな願望を叶える

#### 3.3.2 体験内容例
```
入れ替わり成功！
  ↓
[選択肢1] 何をする？
  ▶ 鏡で自分（彼女）を見る
  ▶ 制服を確認する
  ▶ 部屋を探索する
  ↓
[選択肢2] 次は？
  ▶ 友達に会いに行く
  ▶ お風呂に入る
  ▶ 日記を読む
  ↓
[選択肢3] 最後に…
  ▶ ベッドで休む
  ▶ スマホをチェック
  ▶ 写真を撮る
  ↓
30分経過…元の体に戻る
  ↓
ご褒美コンテンツ解放
```

#### 3.3.3 CSV管理例
```csv
swap_event_id,character,choice_text,result_text,unlock_reward
1,星野 愛莉,鏡で自分を見る,わぁ…本当に愛莉ちゃんになってる！,image_airi_01
2,星野 愛莉,制服を確認する,この制服…似合ってるかな？,image_airi_02
3,星野 愛莉,お風呂に入る,これは…ドキドキするな…,video_airi_01
```

### 3.4 ご褒美システム

#### 3.4.1 解放条件
- 各キャラごとに3パターンの画像・動画
- ランダムで1つ解放（クリアごと）
- 全パターン取得でコンプリート扱い

#### 3.4.2 ご褒美種類
```csv
reward_id,character,type,file_path,description
reward_airi_01,星野 愛莉,image,/assets/rewards/airi_01.png,制服姿
reward_airi_02,星野 愛莉,image,/assets/rewards/airi_02.png,私服姿
reward_airi_03,星野 愛莉,video,/assets/rewards/airi_01.mp4,入れ替わりシーン
reward_kaho_01,夏目 夏帆,image,/assets/rewards/kaho_01.png,体操服
reward_kaho_02,夏目 夏帆,image,/assets/rewards/kaho_02.png,水着
reward_kaho_03,夏目 夏帆,video,/assets/rewards/kaho_01.mp4,シャワーシーン
```

#### 3.4.3 動画再生仕様
- **形式**: MP4
- **再生方法**: HTMLビデオプレイヤー
- **コントロール**: 再生/一時停止/音量調整
- **再生時間**: 可変（最初から最後まで再生）
- **自動ループ**: なし（1回再生で停止）

### 3.5 セーブシステム

#### 3.5.1 自動保存
- **保存間隔**: 5秒ごと
- **保存先**: LocalStorage
- **保存内容**:
  - プレイヤー名
  - クリア済みキャラ
  - 解放済みご褒美
  - ゲーム進行状態

#### 3.5.2 セーブデータ構造
```javascript
const saveData = {
  playerName: String,
  clearedCharacters: ['星野 愛莉', '夏目 夏帆'],
  unlockedRewards: ['reward_airi_01', 'reward_kaho_02'],
  currentProgress: {
    currentCharacter: '水瀬 美月',
    currentPhase: 'puzzle', // title/story/puzzle/reward
    puzzleProgress: 24 // 残り牌数
  },
  statistics: {
    totalPlayTime: 3600, // 秒
    hintsUsed: 5,
    undoUsed: 12,
    fastestClearTime: 180
  }
}
```

---

## 4. キャラクター設定

### 4.1 星野 愛莉（ほしの あいり）

#### 基本情報
- **年齢**: 17歳（高校2年生）
- **誕生日**: 3月15日
- **身長**: 162cm
- **スリーサイズ**: B88(E) / W56 / H85
- **血液型**: A型
- **攻略順**: 1番目（チュートリアル）
- **立ち位置**: クラスで一番人気の美少女・才色兼備

#### 外見
- 金髪セミロング（天然・ハーフ）
- 碧眼
- 華奢だが豊満なスタイル
- 清楚な服装

#### 性格
- 表向き: 優等生で礼儀正しい
- 本音: ちょっと天然でドジ
- 真面目すぎて融通が利かない
- 実は寂しがり屋

#### 好きなもの
- **食べ物**: いちごのショートケーキ、抹茶ラテ
- **シャンプー**: ローズ系の香り
- **趣味**: クラシックピアノ、推理小説
- **色**: パステルピンク
- **科目**: 英語、音楽

#### 苦手・嫌いなもの
- 虫（特にゴキブリ）
- 運動全般
- 辛い食べ物
- 大勢の前で話すこと

#### 隠している秘密
- BL漫画の隠れファン
- 母親が外国人
- 夜は一人で寝られない

#### 立ち絵バリエーション
```csv
character_id,emotion,file_path,description
airi,normal,/assets/characters/airi_normal.png,通常
airi,smile,/assets/characters/airi_smile.png,笑顔
airi,shy,/assets/characters/airi_shy.png,照れ
airi,sad,/assets/characters/airi_sad.png,困り顔
airi,angry,/assets/characters/airi_angry.png,怒り
```

---

### 4.2 夏目 夏帆（なつめ かほ）

#### 基本情報
- **年齢**: 16歳（高校2年生）
- **誕生日**: 7月7日
- **身長**: 165cm
- **スリーサイズ**: B90(F) / W60 / H88
- **血液型**: O型
- **攻略順**: 2番目
- **立ち位置**: 活発で人気者・スポーツ少女

#### 外見
- オレンジ色ショートヘア
- 大きな瞳、笑顔が眩しい
- ダイナミックなスタイル
- ボーイッシュな雰囲気

#### 性格
- 明るく元気
- 裏表がなく正直
- 感情表現豊か
- おっちょこちょい

#### 好きなもの
- **食べ物**: ハンバーガー、カレー、唐揚げ
- **シャンプー**: オレンジ・レモン系
- **趣味**: バスケ、カラオケ、ゲーム
- **色**: オレンジ、黄色
- **科目**: 体育、美術

#### 苦手・嫌いなもの
- 勉強（特に数学）
- 静かな場所
- お化け屋敷
- 細かい作業

#### 隠している秘密
- 料理が壊滅的に下手
- 恋愛経験ゼロ
- 可愛いパジャマ愛用

#### 立ち絵バリエーション
```csv
character_id,emotion,file_path,description
kaho,normal,/assets/characters/kaho_normal.png,通常
kaho,smile,/assets/characters/kaho_smile.png,満面の笑み
kaho,excited,/assets/characters/kaho_excited.png,興奮
kaho,sad,/assets/characters/kaho_sad.png,しょんぼり
kaho,surprised,/assets/characters/kaho_surprised.png,驚き
```

---

### 4.3 水瀬 美月（みなせ みつき）

#### 基本情報
- **年齢**: 17歳（高校2年生）
- **誕生日**: 9月23日
- **身長**: 158cm
- **スリーサイズ**: B82(C) / W58 / H83
- **血液型**: AB型
- **攻略順**: 3番目
- **立ち位置**: クールな学級委員長・完璧主義

#### 外見
- 黒髪ロングポニーテール
- 切れ長の目
- すらっとした均整の取れた体型
- 清潔感のある服装

#### 性格
- 真面目で責任感が強い
- 完璧主義
- 他人に優しく自分に厳しい
- 意外とロマンチスト

#### 好きなもの
- **食べ物**: 和菓子（どら焼き）、緑茶
- **シャンプー**: グレープフルーツ系
- **趣味**: 書道、茶道、少女小説
- **色**: 深緑、紺色
- **科目**: 国語、歴史

#### 苦手・嫌いなもの
- ルーズな人
- 約束破り
- ホラー映画
- 予定外の出来事

#### 隠している秘密
- 恋愛ドラマ好き
- ラブレター黒歴史
- 家ではジャージでゴロゴロ

#### 立ち絵バリエーション
```csv
character_id,emotion,file_path,description
mitsuki,normal,/assets/characters/mitsuki_normal.png,通常
mitsuki,smile,/assets/characters/mitsuki_smile.png,微笑み
mitsuki,blush,/assets/characters/mitsuki_blush.png,赤面
mitsuki,serious,/assets/characters/mitsuki_serious.png,真剣
mitsuki,embarrassed,/assets/characters/mitsuki_embarrassed.png,恥ずかしい
```

---

### 4.4 木村 美咲（きむら みさき）- BADエンド専用

#### 基本情報
- **年齢**: 18歳（高校3年生）
- **誕生日**: 12月1日
- **身長**: 172cm
- **スリーサイズ**: B105(H) / W88 / H102
- **血液型**: B型
- **役割**: BADエンド専用キャラ

#### 外見
- **黒髪**セミロング
- 恰幅の良い体格
- **巨乳・ウエスト太め**
- 迫力ある顔立ち（笑うと可愛い）
- 制服パツパツ

#### 性格
- 気が強くハキハキ
- 怒りっぽいが根は優しい
- 面倒見が良い姉御肌
- 実はロマンチスト

#### 好きなもの
- **食べ物**: 焼肉、ラーメン、スイーツ全般
- **シャンプー**: フローラル系（甘い香り）
- **趣味**: **ガールズコミック（超愛読）**、少女漫画収集
- **色**: ピンク、赤
- **科目**: 家庭科（料理上手）

#### 苦手・嫌いなもの
- ダイエット
- 体型をバカにされること
- ナンパ男
- 暑い日

#### 隠している秘密
- **性欲が強い**（ガールズコミックで妄想）
- 夜な夜な18禁BL/TL漫画
- 実は処女
- 痩せた頃の美人写真を保管
- 主人公が気になっている

#### 立ち絵バリエーション
```csv
character_id,emotion,file_path,description
misaki,normal,/assets/characters/misaki_normal.png,通常
misaki,angry,/assets/characters/misaki_angry.png,怒り
misaki,smile,/assets/characters/misaki_smile.png,笑顔
misaki,embarrassed,/assets/characters/misaki_embarrassed.png,照れ
misaki,serious,/assets/characters/misaki_serious.png,真剣
```

---

## 5. ストーリー・エンディング

### 5.1 体験版ストーリー（星野愛莉ルート）

#### オープニング
```
[シーン: 放課後の教室]

主人公: （名前入力）
愛莉: 「こんにちは！今日も良い天気だね」

愛莉: 「ねえ、ちょっとお願いがあるんだけど…」
愛莉: 「今度のテスト、一緒に勉強してくれない？」

[選択肢]
1. ▶ もちろん！何でも手伝うよ！（正解）
2. ▶ 忙しいから無理かな…（BADエンド）
3. ▶ 勉強苦手なんだよね…（BADエンド）

[正解選択時]
愛莉: 「やった！ありがとう！」
愛莉: 「実は…お礼に面白いものを見せてあげる♪」
愛莉: 「この不思議な上海パズル…クリアできたら、特別なことが起こるんだよ」

[上海パズル開始]
```

#### パズル中応援セリフ
```csv
progress,character,message
25%,星野 愛莉,頑張って！あなたならできるよ！
50%,星野 愛莉,すごい！半分消えたね！
75%,星野 愛莉,あともう少し！応援してるよ！
90%,星野 愛莉,ほとんどクリア！やったね！
```

#### クリア後
```
愛莉: 「すごい！本当にクリアしちゃった！」
愛莉: 「じゃあ…約束通り」
愛莉: 「30分間、私と…入れ替わろうね♪」

[画面が光に包まれる]

主人公: 「え？これって…」

[入れ替わり完了]

愛莉の声: （心の中で聞こえる）
「今から30分間、私の体で過ごしてみて」
「何をするかは…あなた次第だよ♡」
```

#### 入れ替わり体験
```
[選択肢1] 最初に何をする？
▶ 鏡で自分（愛莉）を見る
▶ 制服を確認する
▶ 部屋を探索する

[選択肢2] 次は？
▶ 友達に会いに行く
▶ お風呂の準備をする
▶ 日記を読んでみる

[選択肢3] 最後に…
▶ ベッドで横になる
▶ スマホの写真をチェック
▶ 窓の外を眺める
```

#### エンディング
```
[30分経過]

主人公: 「あれ…体が元に戻る…」

愛莉: 「お疲れ様！どうだった？」
愛莉: 「女の子の気持ち…少しわかったかな？」

主人公: 「すごく…新鮮な体験だった」

愛莉: 「えへへ♪ 気に入ってくれたみたいで嬉しいな」
愛莉: 「また…一緒に遊ぼうね！」

[ご褒美コンテンツ解放]
[ギャラリーに画像/動画追加]

---DEMO END---
続きは製品版で！
```

### 5.2 BADエンドパターン

#### BADエンド1（選択肢ミス）
```
[選択肢で「忙しいから無理」を選択]

愛莉: 「そっか…忙しいんだね」
愛莉: 「また今度でいいよ」

[愛莉が去っていく]

主人公: 「あれ？何か大事なもの失った気が…」

ナレーション:
「俺はまた、つまらない日常に戻った…」

[GAME OVER]
[タイトルに戻る]
```

#### BADエンド2（木村美咲ルート発動）
```
[選択肢で「勉強苦手」を選択]

愛莉: 「えっ…そうなんだ…」
愛莉: 「じゃあ仕方ないね…」

[その時、廊下から大きな足音]

美咲: 「ちょっとアンタ！」
美咲: 「勉強苦手？甘えたこと言ってんじゃないわよ！」

主人公: 「き、木村先輩！？」

美咲: 「愛莉ちゃんが困ってるでしょ！」
美咲: 「今から私が特訓してあげるわ！」
美咲: 「覚悟しなさいよ！！」

[強制的に美咲ルート開始]
[これもBADエンドだが、別の意味で"ご褒美"かも…？]
```

#### BADエンド3（パズル失敗）
```
[制限時間切れ or 完全手詰まり]

愛莉: 「あっ…時間切れだね」
愛莉: 「残念…でも頑張ってくれてありがとう」

主人公: 「ごめん…クリアできなかった」

愛莉: 「大丈夫だよ！また挑戦してみてね♪」

[GAME OVER]

[選択肢]
▶ リトライ（パズルからやり直し）
▶ タイトルへ戻る
```

### 5.3 コンプリート報酬

#### 全キャラクリア条件
- 星野愛莉ルート完全クリア
- 夏目夏帆ルート完全クリア
- 水瀬美月ルート完全クリア

#### コンプリート動画
```
[タイトル]
「Thank you for playing!」

[内容]
- 3人のキャラクターが登場
- 各キャラの名シーン総集編
- 開発者メッセージ
- スタッフクレジット

[長さ]
2-3分程度

[BGM]
感動的なエンディングテーマ

[ファイル]
/assets/rewards/complete_movie.mp4
```

---

## 6. CSV完全管理システム

### 6.1 CSVエンコーディング仕様（超重要）

**絶対に守るべきルール**:
```
- エンコーディング: BOM付きUTF-8
- ファイル先頭: \uFEFF (BOM) を必ず付与
- 改行コード: CRLF (\r\n)
- 区切り文字: カンマ (,)
- エスケープ: ダブルクォート (")
- Excel互換性: BOM付きUTF-8でExcelから直接開いても文字化けしない
```

**実装例（JavaScript）**:
```javascript
// CSV生成時に必ずBOMを付与
function generateCSV(data) {
  const BOM = '\uFEFF';
  const csvContent = data.map(row => row.join(',')).join('\r\n');
  return BOM + csvContent;
}

// CSV保存
function saveCSV(filename, data) {
  const csvWithBOM = generateCSV(data);
  const blob = new Blob([csvWithBOM], { 
    type: 'text/csv;charset=utf-8;' 
  });
  // ... 保存処理
}
```

### 6.2 必須CSVファイル一覧（16個）

#### 6.2.1 シーン・背景管理
**scenes.csv** - シーン管理
```csv
scene_id,scene_name,background_image,bgm_file,description
opening,オープニング,/assets/backgrounds/classroom_sunset.jpg,/assets/bgm/gentle.mp3,放課後の教室
puzzle_start,パズル開始,/assets/backgrounds/puzzle_room.jpg,/assets/bgm/puzzle.mp3,不思議な空間
reward,ご褒美,/assets/backgrounds/bedroom.jpg,/assets/bgm/romantic.mp3,愛莉の部屋
ending,エンディング,/assets/backgrounds/rooftop.jpg,/assets/bgm/ending.mp3,屋上
```

#### 6.2.2 キャラクター管理
**characters.csv** - キャラクター基本設定
```csv
character_id,character_name,age,height,bust,waist,hips,blood_type,birthday,description
airi,星野 愛莉,17,162,88,56,85,A,3月15日,クラスで一番人気の才色兼備美少女
kaho,夏目 夏帆,16,165,90,60,88,O,7月7日,活発で人気者のスポーツ少女
mitsuki,水瀬 美月,17,158,82,58,83,AB,9月23日,クールな学級委員長・完璧主義
misaki,木村 美咲,18,172,105,88,102,B,12月1日,恰幅の良い先輩・姉御肌
```

**character_emotions.csv** - 立ち絵・表情管理
```csv
character_id,emotion_id,emotion_name,image_path,description
airi,normal,通常,/assets/characters/airi_normal.png,普通の表情
airi,smile,笑顔,/assets/characters/airi_smile.png,満面の笑み
airi,shy,照れ,/assets/characters/airi_shy.png,頬を赤らめる
airi,sad,困り顔,/assets/characters/airi_sad.png,困った表情
airi,angry,怒り,/assets/characters/airi_angry.png,怒った顔
```

**character_profiles.csv** - キャラ詳細プロフィール
```csv
character_id,likes_food,likes_shampoo,likes_hobby,likes_color,dislikes,secret
airi,いちごケーキ/抹茶ラテ,ローズ系,ピアノ/推理小説,ピンク,虫/運動/辛い物,BL漫画好き/一人で寝られない
kaho,ハンバーガー/カレー,オレンジ系,バスケ/カラオケ,オレンジ,勉強/静かな場所,料理下手/恋愛経験ゼロ
mitsuki,どら焼き/緑茶,グレープフルーツ,書道/茶道,深緑,ルーズな人/ホラー,恋愛ドラマ好き/家ではゴロゴロ
misaki,焼肉/ラーメン,フローラル系,ガールズコミック,ピンク,ダイエット/ナンパ男,性欲強い/BL好き
```

#### 6.2.3 会話・ダイアログ管理
**dialogues.csv** - 全会話データ
```csv
dialogue_id,scene_id,character_id,emotion,text,next_dialogue_id
1,opening,airi,smile,こんにちは！今日も良い天気だね,2
2,opening,airi,normal,ねえ、ちょっとお願いがあるんだけど…,3
3,opening,airi,shy,今度のテスト、一緒に勉強してくれない？,choice_1
4,opening,airi,smile,やった！ありがとう！,5
5,opening,airi,excited,実は…お礼に面白いものを見せてあげる♪,6
```

**choices.csv** - 選択肢管理
```csv
choice_id,scene_id,choice_text,next_dialogue_id,flag_set,is_correct
choice_1_1,opening,もちろん！何でも手伝うよ！,4,airi_friendship+10,true
choice_1_2,opening,忙しいから無理かな…,bad_end_1,airi_friendship-5,false
choice_1_3,opening,勉強苦手なんだよね…,misaki_route_1,misaki_flag+1,false
```

#### 6.2.4 エンディング管理
**endings.csv** - エンディング分岐設定
```csv
ending_id,ending_name,character_id,condition,background_image,bgm_file,ending_text
happy_airi,愛莉ハッピーエンド,airi,puzzle_clear=true,/assets/backgrounds/rooftop_sunset.jpg,/assets/bgm/happy_ending.mp3,やった！ありがとう！約束通り30分間入れ替わろうね♪
bad_choice,選択ミスBAD,none,choice_correct=false,/assets/backgrounds/classroom_dark.jpg,/assets/bgm/sad.mp3,俺はまた、つまらない日常に戻った…
bad_misaki,美咲ルート,misaki,choice_1_3=true,/assets/backgrounds/hallway.jpg,/assets/bgm/comical.mp3,ちょっとアンタ！何サボってんの！？
gameover,ゲームオーバー,none,puzzle_failed=true,/assets/backgrounds/black.jpg,/assets/bgm/gameover.mp3,TIME UP / GAME OVER
```

#### 6.2.5 UI要素管理
**ui_elements.csv** - UI要素の画像・位置・サイズ
```csv
element_id,element_type,image_path,x_position,y_position,width,height,z_index
title_logo,image,/assets/ui/title_logo.png,center,100,600,200,10
btn_start,button,/assets/ui/btn_start.png,center,350,300,80,20
btn_continue,button,/assets/ui/btn_continue.png,center,450,300,80,21
btn_gallery,button,/assets/ui/btn_gallery.png,center,550,300,80,22
btn_settings,button,/assets/ui/btn_settings.png,center,650,300,80,23
textbox,panel,/assets/ui/textbox.png,0,bottom,100%,200,5
```

**ui_panels.csv** - パネル配置・透明度
```csv
panel_id,panel_name,background_color,opacity,x,y,width,height,z_index
textbox,会話テキストボックス,#000000,0.8,0,520,1200,200,5
hud_panel,HUDパネル,#1a1a1a,0.9,0,0,1200,60,10
choice_panel,選択肢パネル,#2a2a2a,0.95,300,300,600,400,15
```

**ui_icons.csv** - アイコン設定・ツールチップ
```csv
icon_id,icon_image,tooltip_text,x,y,width,height
hint_icon,/assets/ui/icon_hint.png,ヒント,50,700,64,64
undo_icon,/assets/ui/icon_undo.png,やり直し,150,700,64,64
reset_icon,/assets/ui/icon_reset.png,リセット,250,700,64,64
```

**click_areas.csv** - クリック可能エリア・エフェクト
```csv
area_id,area_name,x,y,width,height,click_effect,sound_effect
tile_area,牌クリックエリア,200,100,800,600,tile_select,/assets/se/select.mp3
next_button,次へボタン,1000,680,150,50,fade_out,/assets/se/click.mp3
```

**ui_animations.csv** - アニメーション・タイミング
```csv
animation_id,element_id,animation_type,duration,easing,trigger
title_fadein,title_logo,fade_in,2000,ease-in-out,on_load
button_hover,btn_start,scale,300,ease-out,on_hover
textbox_slide,textbox,slide_up,500,ease-in,on_dialogue_start
character_enter,character_sprite,slide_right,800,ease-out,on_scene_start
```

**ui_fonts.csv** - フォント・色・影設定
```csv
font_id,font_family,font_size,font_weight,color,text_shadow,line_height
dialogue_text,游ゴシック,24,normal,#ffffff,2px 2px 4px rgba(0,0,0,0.8),1.6
character_name,游ゴシック,20,bold,#ffd700,1px 1px 3px rgba(0,0,0,0.9),1.4
choice_text,游ゴシック,22,normal,#ffffff,1px 1px 2px rgba(0,0,0,0.7),1.5
```

**ui_responsive.csv** - 画面サイズ対応
```csv
breakpoint,min_width,max_width,scale_factor,font_scale
desktop,1200,9999,1.0,1.0
tablet,768,1199,0.8,0.9
mobile,0,767,0.6,0.8
```

#### 6.2.6 ゲームバランス管理
**game_balance.csv** - 数値バランス設定
```csv
setting_id,setting_name,value,description
tutorial_tiles,チュートリアル牌数,48,体験版の牌枚数
normal_tiles,通常牌数,144,完全版の牌枚数
hint_count_tutorial,チュートリアルヒント回数,5,体験版ヒント上限
hint_count_normal,通常ヒント回数,3,完全版ヒント上限
time_limit_tutorial,チュートリアル制限時間,600,秒単位（10分）
time_limit_normal,通常制限時間,900,秒単位（15分）
autosave_interval,自動保存間隔,5,秒単位
```

**sound_effects.csv** - 音響効果・BGM設定
```csv
sound_id,sound_name,sound_type,file_path,volume,loop
bgm_title,タイトルBGM,bgm,/assets/bgm/title.mp3,0.7,true
bgm_puzzle,パズルBGM,bgm,/assets/bgm/puzzle.mp3,0.6,true
bgm_romantic,ロマンティックBGM,bgm,/assets/bgm/romantic.mp3,0.5,true
se_click,クリック音,se,/assets/se/click.mp3,1.0,false
se_select,選択音,se,/assets/se/select.mp3,0.8,false
se_match,ペア成立,se,/assets/se/match.mp3,0.9,false
se_clear,クリア,se,/assets/se/clear.mp3,1.0,false
se_gameover,ゲームオーバー,se,/assets/se/gameover.mp3,0.8,false
```

#### 6.2.7 ご褒美コンテンツ管理
**rewards.csv** - ご褒美画像・動画
```csv
reward_id,character_id,reward_type,file_path,unlock_condition,description
reward_airi_01,airi,image,/assets/rewards/airi_01.png,puzzle_clear_airi,制服姿
reward_airi_02,airi,image,/assets/rewards/airi_02.png,puzzle_clear_airi,私服姿
reward_airi_03,airi,video,/assets/rewards/airi_01.mp4,puzzle_clear_airi,入れ替わりシーン
reward_kaho_01,kaho,image,/assets/rewards/kaho_01.png,puzzle_clear_kaho,体操服
reward_kaho_02,kaho,image,/assets/rewards/kaho_02.png,puzzle_clear_kaho,水着
reward_kaho_03,kaho,video,/assets/rewards/kaho_01.mp4,puzzle_clear_kaho,シャワーシーン
reward_complete,all,video,/assets/rewards/complete_movie.mp4,all_characters_clear,コンプリート動画
```

#### 6.2.8 入れ替わり体験管理
**swap_events.csv** - 入れ替わり体験イベント
```csv
swap_event_id,character_id,choice_text,result_text,unlock_reward,background_image
swap_airi_01,airi,鏡で自分を見る,わぁ…本当に愛莉ちゃんになってる！,reward_airi_01,/assets/backgrounds/bedroom_mirror.jpg
swap_airi_02,airi,制服を確認する,この制服…似合ってるかな？,reward_airi_02,/assets/backgrounds/bedroom.jpg
swap_airi_03,airi,お風呂の準備をする,これは…ドキドキするな…,reward_airi_03,/assets/backgrounds/bathroom.jpg
swap_kaho_01,kaho,バスケボールを持つ,この体でシュート決めてみたい！,reward_kaho_01,/assets/backgrounds/gym.jpg
swap_kaho_02,kaho,鏡の前でポーズ,夏帆ちゃんってこんなスタイルいいんだ…,reward_kaho_02,/assets/backgrounds/bedroom.jpg
swap_kaho_03,kaho,シャワーを浴びる,運動後のシャワー…最高だな,reward_kaho_03,/assets/backgrounds/shower_room.jpg
```

---

### 6.3 CSV読み込み実装サンプル

```javascript
// BOM付きUTF-8対応CSVローダー
class CSVLoader {
  static async loadCSV(filePath) {
    try {
      const response = await fetch(filePath);
      let text = await response.text();
      
      // BOM除去（もし存在すれば）
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
      }
      
      // パース（PapaParseライブラリ推奨）
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        encoding: 'UTF-8'
      });
      
      return parsed.data;
    } catch (error) {
      console.error(`CSV読み込みエラー: ${filePath}`, error);
      return [];
    }
  }
  
  // 全CSV一括読み込み
  static async loadAllCSVs() {
    const csvFiles = {
      scenes: '/data/scenes.csv',
      characters: '/data/characters.csv',
      dialogues: '/data/dialogues.csv',
      choices: '/data/choices.csv',
      endings: '/data/endings.csv',
      uiElements: '/data/ui_elements.csv',
      uiPanels: '/data/ui_panels.csv',
      uiIcons: '/data/ui_icons.csv',
      clickAreas: '/data/click_areas.csv',
      uiAnimations: '/data/ui_animations.csv',
      uiFonts: '/data/ui_fonts.csv',
      uiResponsive: '/data/ui_responsive.csv',
      gameBalance: '/data/game_balance.csv',
      soundEffects: '/data/sound_effects.csv',
      rewards: '/data/rewards.csv',
      swapEvents: '/data/swap_events.csv',
    };
    
    const loadedData = {};
    
    for (const [key, path] of Object.entries(csvFiles)) {
      loadedData[key] = await this.loadCSV(path);
    }
    
    return loadedData;
  }
}

// 使用例
const gameData = await CSVLoader.loadAllCSVs();
console.log(gameData.characters); // キャラクターデータ
console.log(gameData.dialogues);  // 会話データ
```

---

## 7. UI画像・動画仕様

### 7.1 画像ファイル構成

```
/assets/
├── backgrounds/          # 背景画像
│   ├── classroom_sunset.jpg      (1200x800px)
│   ├── hallway.jpg                (1200x800px)
│   ├── rooftop.jpg                (1200x800px)
│   ├── puzzle_room.jpg            (1200x800px)
│   ├── bedroom.jpg                (1200x800px)
│   ├── bathroom.jpg               (1200x800px)
│   ├── gym.jpg                    (1200x800px)
│   ├── shower_room.jpg            (1200x800px)
│   └── black.jpg                  (1200x800px)
│
├── characters/          # キャラクター立ち絵
│   ├── airi_normal.png           (600x1200px, 透過PNG)
│   ├── airi_smile.png            (600x1200px, 透過PNG)
│   ├── airi_shy.png              (600x1200px, 透過PNG)
│   ├── airi_sad.png              (600x1200px, 透過PNG)
│   ├── airi_angry.png            (600x1200px, 透過PNG)
│   ├── kaho_normal.png           (600x1200px, 透過PNG)
│   ├── kaho_smile.png            (600x1200px, 透過PNG)
│   ├── mitsuki_normal.png        (600x1200px, 透過PNG)
│   ├── mitsuki_smile.png         (600x1200px, 透過PNG)
│   ├── misaki_normal.png         (600x1200px, 透過PNG)
│   └── misaki_angry.png          (600x1200px, 透過PNG)
│
├── tiles/               # 麻雀牌画像（34種類）
│   ├── 1m.png ~ 9m.png           (60x80px, PNG)
│   ├── 1p.png ~ 9p.png           (60x80px, PNG)
│   ├── 1s.png ~ 9s.png           (60x80px, PNG)
│   ├── east.png, south.png, west.png, north.png
│   └── white.png, green.png, red.png
│
├── ui/                  # UIボタン・パネル
│   ├── title_logo.png            (600x200px, 透過PNG)
│   ├── btn_start.png             (300x80px, 透過PNG)
│   ├── btn_start_hover.png       (300x80px, 透過PNG)
│   ├── btn_continue.png          (300x80px, 透過PNG)
│   ├── btn_gallery.png           (300x80px, 透過PNG)
│   ├── btn_settings.png          (300x80px, 透過PNG)
│   ├── textbox.png               (1200x200px, 半透過PNG)
│   ├── icon_hint.png             (64x64px, 透過PNG)
│   ├── icon_undo.png             (64x64px, 透過PNG)
│   └── icon_reset.png            (64x64px, 透過PNG)
│
├── rewards/             # ご褒美コンテンツ
│   ├── airi_01.png               (1200x800px, PNG/JPG)
│   ├── airi_02.png               (1200x800px, PNG/JPG)
│   ├── airi_01.mp4               (可変長, MP4)
│   ├── kaho_01.png               (1200x800px, PNG/JPG)
│   ├── kaho_02.png               (1200x800px, PNG/JPG)
│   ├── kaho_01.mp4               (可変長, MP4)
│   ├── mitsuki_01.png            (1200x800px, PNG/JPG)
│   ├── mitsuki_01.mp4            (可変長, MP4)
│   ├── misaki_01.png             (1200x800px, PNG/JPG)
│   └── complete_movie.mp4        (2-3分, MP4)
│
└── thumbnails/          # ギャラリーサムネイル
    ├── airi_01_thumb.png         (300x200px, PNG)
    ├── airi_02_thumb.png         (300x200px, PNG)
    ├── locked.png                (300x200px, PNG) # 「？」表示
    └── ...
```

### 7.2 動画仕様

**形式**: MP4 (H.264コーデック)

**解像度**: 1280x720px (720p) または 1920x1080px (1080p)

**フレームレート**: 30fps

**ビットレート**: 2-5Mbps

**音声**: AAC, 128-192kbps, ステレオ

**長さ**: 可変（1-3分程度）

**ファイルサイズ目安**: 
- 1分動画: 約15-25MB
- 2分動画: 約30-50MB
- 3分動画: 約45-75MB

### 7.3 仮素材仕様（開発初期用）

**背景**: 単色塗りつぶし画像
```
教室: #FFE4B5 (ベージュ)
廊下: #D3D3D3 (グレー)
屋上: #87CEEB (スカイブルー)
パズル空間: #4B0082 (インディゴ)
```

**キャラクター立ち絵**: 色付き長方形 + テキスト
```
愛莉: #FFD700 (金色) + 「愛莉」
夏帆: #FFA500 (オレンジ) + 「夏帆」
美月: #000000 (黒) + 「美月」
美咲: #8B4513 (茶色) + 「美咲」
```

**牌**: 色付き長方形 + 文字
```
萬子: 赤文字
筒子: 青文字
索子: 緑文字
風牌: 白文字
```

**ボタン**: CSS装飾のみ
```css
.button {
  background: linear-gradient(to bottom, #4CAF50, #45a049);
  border: 2px solid #fff;
  border-radius: 8px;
  color: white;
  font-size: 24px;
  padding: 15px 40px;
}
```

**動画**: テスト用動画
```
内容: 「TEST VIDEO」という文字が表示されるだけ
背景: 黒
音声: なし or テスト音
長さ: 可変（5-10秒程度）
```

---

## 8. アニメーション仕様

### 8.1 画面遷移アニメーション

**フェードイン/アウト**:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 1s ease-in-out;
}
```

**スライドイン（左から）**:
```css
@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.slide-in-left {
  animation: slideInLeft 0.8s ease-out;
}
```

**スライドイン（右から）**:
```css
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.slide-in-right {
  animation: slideInRight 0.8s ease-out;
}
```

### 8.2 キャラクター演出

**登場アニメーション**:
```css
@keyframes characterEnter {
  0% {
    opacity: 0;
    transform: translateX(50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.character-enter {
  animation: characterEnter 0.6s ease-out;
}
```

**感情変化（表情切り替え）**:
```javascript
function changeEmotion(characterId, newEmotion) {
  const characterSprite = document.getElementById(characterId);
  
  // クロスフェード
  characterSprite.style.opacity = 0;
  
  setTimeout(() => {
    characterSprite.src = `/assets/characters/${characterId}_${newEmotion}.png`;
    characterSprite.style.opacity = 1;
  }, 200);
}
```

### 8.3 テキスト演出

**タイプライター効果**:
```javascript
function typewriterEffect(element, text, speed = 50) {
  let index = 0;
  element.textContent = '';
  
  const timer = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(timer);
    }
  }, speed);
}
```

**テキストボックス表示**:
```css
@keyframes textboxSlideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.textbox {
  animation: textboxSlideUp 0.5s ease-out;
}
```

### 8.4 ボタン演出

**ホバー時拡大**:
```css
.button {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(255, 215, 0, 0.4);
}
```

**クリック時縮小**:
```css
.button:active {
  transform: scale(0.95);
}
```

**キラキラエフェクト**:
```css
@keyframes sparkle {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.sparkle {
  animation: sparkle 1.5s infinite;
}
```

### 8.5 牌アニメーション

**選択時**:
```css
.tile-selected {
  transition: all 0.2s ease;
  transform: translateY(-10px);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  border: 3px solid #FFD700;
}
```

**ペア成立時（消える）**:
```css
@keyframes tileDisappear {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    opacity: 0;
    transform: scale(0) rotate(30deg);
  }
}

.tile-disappear {
  animation: tileDisappear 0.5s ease-out forwards;
}
```

**ヒント時点滅**:
```css
@keyframes hintBlink {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 255, 0, 0.8); }
  50% { box-shadow: 0 0 30px rgba(255, 255, 0, 1); }
}

.tile-hint {
  animation: hintBlink 1s infinite;
}
```

### 8.6 エンディング演出

**ご褒美画像表示**:
```css
@keyframes rewardReveal {
  0% {
    opacity: 0;
    transform: scale(0.8);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

.reward-image {
  animation: rewardReveal 1.5s ease-out;
}
```

**コンプリート祝福エフェクト**:
```css
@keyframes confetti {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti {
  animation: confetti 3s ease-in infinite;
}
```

---

## 9. 段階的開発ロードマップ

### 9.1 フェーズ1: MVP（最小限動作版）- 1-2週間

**目標**: 仮素材でゲームが一通り動く状態

#### 実装内容
1. **基本画面構築**
   - タイトル画面（シンプルなボタンのみ）
   - 名前入力画面
   - 会話シーン（テキスト表示のみ）
   - 上海パズル画面
   - クリア/ゲームオーバー画面

2. **コアシステム**
   - CSV読み込み機能（BOM付きUTF-8対応）
   - 上海パズルロジック（40-50枚・3層）
   - 選択可能判定
   - ペア判定・削除
   - クリア判定

3. **仮素材**
   - 単色背景
   - 色付き長方形（キャラ・牌）
   - CSSボタン
   - ダミーテキスト

#### 成功基準
- [ ] タイトルから名前入力まで進める
- [ ] 会話が表示される
- [ ] 上海パズルがプレイできる
- [ ] クリアすると次の画面へ進む
- [ ] LocalStorageでセーブされる

---

### 9.2 フェーズ2: 装飾追加 - 1-2週間

**目標**: ビジュアル・サウンドの実装

#### 実装内容
1. **立ち絵システム**
   - キャラクター立ち絵表示
   - 表情差分切り替え
   - 登場/退場アニメーション

2. **サウンドシステム**
   - BGM再生・ループ
   - 効果音（クリック、選択、ペア成立）
   - 音量調整機能

3. **UIアニメーション**
   - タイプライター効果
   - ボタンホバーエフェクト
   - 画面遷移フェード

4. **ギャラリー機能**
   - ギャラリー画面作成
   - 未取得/取得済み表示
   - サムネイル表示

#### 成功基準
- [ ] キャラが表情豊かに動く
- [ ] BGM/SEが適切に再生される
- [ ] UIが滑らかにアニメーションする
- [ ] ギャラリーが機能する

---

### 9.3 フェーズ3: 完成版 - 2-3週間

**目標**: 本番素材の実装と完全版機能

#### 実装内容
1. **ご褒美システム**
   - 画像表示機能
   - 動画プレイヤー実装
   - ランダム解放機能

2. **入れ替わり体験**
   - 選択式ADVパート実装
   - 背景切り替え
   - フラグ管理

3. **エンディング分岐**
   - 4種類エンディング実装
   - 条件判定ロジック
   - 各エンディング専用演出

4. **完全版機能**
   - 144枚レイアウト実装（オプション）
   - 統計情報表示
   - セーブデータ管理

5. **本番素材差し替え**
   - すべての画像を本番素材に
   - 動画ファイル追加
   - BGM/SE最終版

#### 成功基準
- [ ] 全キャラクリア可能
- [ ] ご褒美コンテンツが解放される
- [ ] 動画が正常に再生される
- [ ] 全エンディングが見られる
- [ ] コンプリート報酬が表示される

---

### 9.4 フェーズ4: 最適化・デバッグ - 1週間

#### 実装内容
1. **パフォーマンス最適化**
   - ローディング高速化
   - メモリリーク修正
   - アニメーション最適化

2. **バグ修正**
   - セーブデータ不具合
   - 牌判定ミス
   - UI表示崩れ

3. **UX改善**
   - ボタン配置調整
   - テキスト速度調整
   - 音量バランス調整

4. **テスト**
   - 全ルートプレイテスト
   - クリア時間計測
   - 快適性チェック

#### 成功基準
- [ ] 安定して動作する
- [ ] 快適にプレイできる
- [ ] すべての機能が正常動作

---

### 9.5 フェーズ5: パッケージング - 数日

#### 実装内容
1. **Electronビルド**
   - Windows版(.exe)
   - Mac版(.app)
   - Linux版(.AppImage)

2. **リソース同梱**
   - 画像ファイル
   - 動画ファイル
   - CSVファイル
   - 音声ファイル

3. **インストーラー作成**
   - セットアップウィザード
   - アイコン設定
   - バージョン情報

#### 成功基準
- [ ] 実行ファイルが起動する
- [ ] すべてのリソースが読み込める
- [ ] インストール/アンインストールが正常

---

## 10. 実装サンプルコード

### 10.1 ゲーム初期化

```javascript
// main.js - ゲーム初期化
class BeautySwapPuzzleGame {
  constructor() {
    this.gameData = null;
    this.currentScene = 'title';
    this.playerName = '';
    this.saveData = this.loadSaveData();
  }
  
  async init() {
    // CSV一括読み込み
    this.gameData = await CSVLoader.loadAllCSVs();
    
    // 初期画面表示
    this.showTitleScreen();
    
    // 自動保存開始
    this.startAutoSave();
  }
  
  loadSaveData() {
    const saved = localStorage.getItem('beauty_swap_puzzle_save');
    return saved ? JSON.parse(saved) : this.getDefaultSaveData();
  }
  
  getDefaultSaveData() {
    return {
      playerName: '',
      clearedCharacters: [],
      unlockedRewards: [],
      currentProgress: {},
      statistics: {
        totalPlayTime: 0,
        gamesPlayed: 0,
        gamesCleared: 0,
        hintsUsed: 0,
        undoUsed: 0
      }
    };
  }
  
  startAutoSave() {
    setInterval(() => {
      this.save();
    }, 5000); // 5秒ごと
  }
  
  save() {
    localStorage.setItem('beauty_swap_puzzle_save', JSON.stringify(this.saveData));
  }
}

// ゲーム開始
const game = new BeautySwapPuzzleGame();
game.init();
```

### 10.2 会話システム

```javascript
// dialogue.js
class DialogueSystem {
  constructor(gameData) {
    this.dialogues = gameData.dialogues;
    this.choices = gameData.choices;
    this.characters = gameData.characters;
    this.currentDialogueId = null;
    this.textSpeed = 50; // ms/文字
  }
  
  async showDialogue(dialogueId) {
    const dialogue = this.dialogues.find(d => d.dialogue_id === dialogueId);
    if (!dialogue) return;
    
    // 背景設定
    this.setBackground(dialogue.scene_id);
    
    // キャラクター表示
    await this.showCharacter(dialogue.character_id, dialogue.emotion);
    
    // テキスト表示（タイプライター効果）
    await this.typewriterText(dialogue.text);
    
    // 次の処理
    if (dialogue.next_dialogue_id.startsWith('choice_')) {
      this.showChoices(dialogue.next_dialogue_id);
    } else {
      this.waitForClick(() => this.showDialogue(dialogue.next_dialogue_id));
    }
  }
  
  async typewriterText(text) {
    const textElement = document.getElementById('dialogue-text');
    textElement.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
      textElement.textContent += text[i];
      await this.sleep(this.textSpeed);
    }
  }
  
  showChoices(choiceId) {
    const choiceList = this.choices.filter(c => c.choice_id.startsWith(choiceId));
    const choiceContainer = document.getElementById('choice-container');
    choiceContainer.innerHTML = '';
    
    choiceList.forEach(choice => {
      const button = document.createElement('button');
      button.textContent = choice.choice_text;
      button.className = 'choice-button';
      button.onclick = () => this.selectChoice(choice);
      choiceContainer.appendChild(button);
    });
  }
  
  selectChoice(choice) {
    // フラグ設定
    if (choice.flag_set) {
      this.setFlag(choice.flag_set);
    }
    
    // 次のダイアログへ
    if (choice.is_correct) {
      this.showDialogue(choice.next_dialogue_id);
    } else {
      this.showBadEnd(choice.next_dialogue_id);
    }
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 10.3 動画プレイヤー

```javascript
// videoPlayer.js
class VideoPlayer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.videoElement = null;
  }
  
  play(videoPath) {
    // プレイヤーHTML生成
    this.container.innerHTML = `
      <div class="video-player-overlay">
        <div class="video-player-container">
          <video id="reward-video" controls autoplay>
            <source src="${videoPath}" type="video/mp4">
          </video>
          <button class="close-video-btn" onclick="videoPlayer.close()">×</button>
        </div>
      </div>
    `;
    
    this.videoElement = document.getElementById('reward-video');
    
    // 終了時の処理
    this.videoElement.addEventListener('ended', () => {
      console.log('動画再生終了');
    });
  }
  
  close() {
    if (this.videoElement) {
      this.videoElement.pause();
    }
    this.container.innerHTML = '';
  }
}

// 使用例
const videoPlayer = new VideoPlayer('video-container');
videoPlayer.play('/assets/rewards/airi_01.mp4');
```

---

## 11. 想定プレイフロー

### 11.1 体験版プレイフロー（15-20分）

```
[0:00] タイトル画面表示
  「クラスで一番人気の美少女と入れ替われるパズル～30分間の秘密～」
  ↓ (はじめからボタンクリック)
[0:30] 名前入力画面
  ↓ (名前入力: 例「太郎」)
[1:00] オープニング会話（愛莉登場）
  ├─ セリフ1: 「こんにちは！」
  ├─ セリフ2: 「お願いがあるの」
  └─ セリフ3: 「一緒に勉強して？」
  ↓
[2:00] 選択肢表示
  ├─ ✅ 正解: 「もちろん！」
  ├─ ❌ 不正解: 「忙しい」→ BADエンド
  └─ ❌ 不正解: 「勉強苦手」→ 美咲ルート
  ↓
[3:00] パズル説明
  └─ 愛莉: 「この不思議なパズルをクリアして！」
  ↓
[4:00] 上海パズル開始（40-50枚・3層）
  ├─ 25%消化: 「頑張って！」
  ├─ 50%消化: 「すごい！」
  ├─ 75%消化: 「あともう少し！」
  └─ クリア or タイムオーバー
  ↓
[9:00] クリア演出
  └─ 愛莉: 「やった！ありがとう！」
  ↓
[10:00] 入れ替わりシーン
  └─ 画面が光に包まれる
  ↓
[11:00] 入れ替わり体験（選択式ADV）
  ├─ 選択肢1: 鏡を見る
  ├─ 選択肢2: 部屋を探索
  └─ 選択肢3: ベッドで休む
  ↓
[14:00] 元の体に戻る
  └─ 愛莉: 「どうだった？」
  ↓
[15:00] ご褒美コンテンツ解放
  ├─ 画像表示（ランダム1枚）
  └─ 動画再生（1-2分）
  ↓
[17:00] エンディング
  └─ 「DEMO END - 続きは製品版で！」
  ↓
[18:00] ギャラリー登録確認
  └─ タイトルへ戻る
```

---

## 12. 開発チェックリスト

### フェーズ1（MVP）
- [ ] プロジェクト初期設定（Electron + React）
- [ ] CSV読み込みシステム実装（BOM付きUTF-8対応）
- [ ] タイトル画面（仮素材）
- [ ] 名前入力機能
- [ ] 会話システム（テキスト表示のみ）
- [ ] 上海パズルロジック（40-50枚・3層）
- [ ] 選択可能判定
- [ ] ペア判定・削除
- [ ] クリア/ゲームオーバー判定
- [ ] LocalStorage保存機能

### フェーズ2（装飾）
- [ ] 立ち絵表示システム
- [ ] 表情差分切り替え
- [ ] タイプライター効果
- [ ] BGM再生システム
- [ ] 効果音再生
- [ ] ボタンアニメーション
- [ ] 画面遷移フェード
- [ ] ギャラリー画面

### フェーズ3（完成版）
- [ ] ご褒美画像表示
- [ ] 動画プレイヤー
- [ ] 入れ替わり体験ADV
- [ ] エンディング分岐（4種類）
- [ ] 144枚レイアウト実装（オプション）
- [ ] 統計情報表示
- [ ] 本番素材差し替え

### フェーズ4（最適化）
- [ ] パフォーマンステスト
- [ ] バグ修正
- [ ] UX改善
- [ ] 全ルートプレイテスト

### フェーズ5（パッケージング）
- [ ] Electronビルド設定
- [ ] リソース同梱
- [ ] インストーラー作成
- [ ] 最終動作確認

---

## 13. Claude Code への実装依頼文テンプレート

```
以下の仕様書に基づいて、Electron製の恋愛ノベル×上海パズルゲーム
「クラスで一番人気の美少女と入れ替われるパズル～30分間の秘密～」を実装してください。

【ゲームコンセプト】
- 上海パズルをクリアすると、クラスで一番人気の美少女と30分間入れ替われる
- 憧れの彼女視点で秘密の日常を体験
- クリア報酬として「ご褒美画像・動画」を解放
- 90年代ゲームセンター風の「クリア報酬型」恋愛ゲーム

【最優先事項】
1. フェーズ1（MVP）から段階的に実装
2. まず仮素材で動作確認
3. すべてのデータをCSV管理（BOM付きUTF-8必須）
4. LocalStorageで自動保存（5秒間隔）

【実装順序】
フェーズ1: 基本動作（仮素材）
- タイトル→名前入力→会話→上海パズル→クリア画面

フェーズ2: 装飾追加
- 立ち絵、BGM/SE、アニメーション、ギャラリー

フェーズ3: 完全版機能
- ご褒美コンテンツ、動画再生、エンディング分岐

【技術要件】
- Electron + React
- CSV読み込みはPapaParseライブラリ使用
- BOM付きUTF-8エンコーディング厳守
- レスポンシブ対応（1200x800px基準）

【体験版仕様】
- 星野愛莉ルートのみ実装
- 上海パズル: 40-50枚・3層
- プレイ時間: 15-20分

添付の完全仕様書を参照し、段階的に実装をお願いします。
まずフェーズ1（MVP）から開始してください。
```

---

## 14. 最終確認事項

### ✅ 必須4画面完備
- [x] タイトル画面
- [x] 会話シーン
- [x] メインゲーム（上海パズル）
- [x] マルチエンディング画面

### ✅ CSV完全外部化（16個）
- [x] scenes.csv
- [x] characters.csv
- [x] character_emotions.csv
- [x] character_profiles.csv
- [x] dialogues.csv
- [x] choices.csv
- [x] endings.csv
- [x] ui_elements.csv
- [x] ui_panels.csv
- [x] ui_icons.csv
- [x] click_areas.csv
- [x] ui_animations.csv
- [x] ui_fonts.csv
- [x] ui_responsive.csv
- [x] game_balance.csv
- [x] sound_effects.csv
- [x] rewards.csv
- [x] swap_events.csv

### ✅ BOM付きUTF-8エンコーディング
- [x] 全CSVファイルにBOM（\uFEFF）付与
- [x] Excel直接開き対応
- [x] 日本語文字化け完全防止

### ✅ 4種類エンディング
- [x] ハッピーエンド（パズルクリア）
- [x] BADエンド（選択肢ミス）
- [x] BADエンド特別版（美咲ルート）
- [x] ゲームオーバー（パズル失敗）

---

# 🎉 完全仕様書完成！

**ゲームタイトル**: 『クラスで一番人気の美少女と入れ替われるパズル～30分間の秘密～』

この仕様書をClaude Codeに渡せば、完全なゲームが実装可能です。

**段階的開発で、必ず完成させましょう！** 💪