# Mahjong Solitaire - 組み込み用モジュール

ScriptRaccoonのMahjong Solitaireをノベルゲーム組み込み用に改造したモジュールです。

## 特徴

- ✅ **jQuery不要** - Vanilla JavaScriptで実装
- ✅ **完全カプセル化** - CSS/JS名前空間分離
- ✅ **API制御** - ノベルゲームから完全制御可能
- ✅ **軽量** - 最小限のUI、必要な機能のみ
- ✅ **レスポンシブ** - 各種画面サイズに対応

## インストール

```html
<!-- CSS読み込み -->
<link rel="stylesheet" href="/mahjong-solitaire/mahjong-solitaire.css">

<!-- JavaScript読み込み -->
<script src="/mahjong-solitaire/mahjong-solitaire.js"></script>
```

## 基本的な使い方

```html
<div id="game-container"></div>

<script>
// インスタンス作成
const game = new MahjongSolitaire();

// 初期化
game.init(document.getElementById('game-container'), {
    imagePath: '/mahjong-solitaire/img/',
    showHint: true,
    showRestart: true,
    autoStart: true
});

// ゲーム終了時のコールバック
game.onGameEnd((result) => {
    if (result.won) {
        console.log('クリア！');
    } else {
        console.log(`ゲームオーバー（残り${result.remainingTiles}枚）`);
    }
});
</script>
```

## API仕様

### `MahjongSolitaire.init(containerElement, options)`

ゲームを初期化します。

**パラメータ:**
- `containerElement` (HTMLElement) - ゲームを表示するコンテナ要素
- `options` (Object) - オプション設定
  - `imagePath` (string) - 画像ディレクトリパス（デフォルト: `/mahjong-solitaire/img/`）
  - `showHint` (boolean) - ヒントボタン表示（デフォルト: `true`）
  - `showRestart` (boolean) - 再開ボタン表示（デフォルト: `true`）
  - `autoStart` (boolean) - 自動開始（デフォルト: `true`）
  - `minimalUI` (boolean) - 最小限UI（デフォルト: `false`）

**戻り値:** `MahjongSolitaire` インスタンス（メソッドチェーン可能）

---

### `MahjongSolitaire.start()`

ゲームを開始します。

**戻り値:** なし

---

### `MahjongSolitaire.onGameEnd(callback)`

ゲーム終了時のコールバックを設定します。

**パラメータ:**
- `callback` (Function) - コールバック関数
  - 引数: `result` (Object)
    - `won` (boolean) - クリアしたかどうか
    - `remainingTiles` (number) - 残りタイル数

**戻り値:** `MahjongSolitaire` インスタンス（メソッドチェーン可能）

---

### `MahjongSolitaire.getStatus()`

現在のゲーム状態を取得します。

**戻り値:** (Object)
- `isRunning` (boolean) - ゲーム実行中かどうか
- `totalTiles` (number) - 総タイル数（144）
- `remainingTiles` (number) - 残りタイル数
- `selectedCoord` (Array|null) - 選択中の座標
- `hasHint` (boolean) - ヒントが利用可能かどうか

---

### `MahjongSolitaire.reset()`

ゲームをリセットして再開します。

**戻り値:** なし

---

### `MahjongSolitaire.showHint()`

ヒントを表示します（手動でヒント機能を呼び出す場合）。

**戻り値:** なし

## React での使用例

```jsx
import React, { useEffect, useRef } from 'react';

function MahjongGame({ onClear, onGameOver }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      const game = new window.MahjongSolitaire();

      game.init(containerRef.current, {
        imagePath: '/mahjong-solitaire/img/',
        showHint: true,
        showRestart: false,
        autoStart: true,
        minimalUI: false
      });

      game.onGameEnd((result) => {
        if (result.won) {
          onClear && onClear();
        } else {
          onGameOver && onGameOver();
        }
      });

      gameRef.current = game;
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      gameRef.current = null;
    };
  }, [onClear, onGameOver]);

  return <div ref={containerRef} />;
}

export default MahjongGame;
```

## ノベルゲーム組み込みパターン

### パターン1: クリア後に次のシーンへ

```javascript
game.onGameEnd((result) => {
    if (result.won) {
        // 2秒後にご褒美シーンへ遷移
        setTimeout(() => {
            changeScene('reward');
        }, 2000);
    } else {
        // ゲームオーバー時は会話シーンに戻る
        setTimeout(() => {
            changeScene('conversation');
        }, 2000);
    }
});
```

### パターン2: スコア計算

```javascript
game.onGameEnd((result) => {
    const score = result.won ? 1000 : Math.floor((144 - result.remainingTiles) * 5);
    updatePlayerScore(score);
});
```

### パターン3: 進行度に応じた分岐

```javascript
game.onGameEnd((result) => {
    const progress = ((144 - result.remainingTiles) / 144) * 100;

    if (result.won) {
        showDialogue('完璧だね！');
    } else if (progress > 70) {
        showDialogue('惜しかった！もう少しだったのに...');
    } else {
        showDialogue('今回は運が悪かったみたいだね。');
    }
});
```

## カスタマイズ

### CSS変数でのスタイル調整

```css
.mahjong-container {
    /* 背景画像変更 */
    background: url('./custom-bg.jpg');
}

.mahjong-tile-front {
    /* タイルの色変更 */
    background-image: linear-gradient(to left top, #ffccdd, #ffeeff);
}

.mahjong-btn {
    /* ボタンの色変更 */
    background-color: #FF69B4;
}
```

### サイズ調整

```css
.mahjong-container {
    transform: scale(0.8); /* 80%に縮小 */
    transform-origin: top center;
}
```

## ライセンス

Original: MIT License by ScriptRaccoon
Modified: MIT License (組み込み用改造版)

## クレジット

- Original: [ScriptRaccoon/mahjong-solitaire](https://github.com/ScriptRaccoon/mahjong-solitaire)
- Modified for embedding by Claude Code
