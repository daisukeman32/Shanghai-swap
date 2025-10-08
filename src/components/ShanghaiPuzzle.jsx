import React, { useState, useEffect } from 'react';
import './ShanghaiPuzzle.css';
import {
  generateTutorialLayout,
  isSelectable,
  canMatch,
  findHint,
  isGameCleared,
  isStuck
} from '../utils/shanghaiLogic';

function ShanghaiPuzzle({ onClear, onGameOver }) {
  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [hintTiles, setHintTiles] = useState([]);
  const [hintsRemaining, setHintsRemaining] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10分 = 600秒
  const [gameStarted, setGameStarted] = useState(false);

  // ゲーム初期化
  useEffect(() => {
    const initialTiles = generateTutorialLayout();
    setTiles(initialTiles);
    setGameStarted(true);
  }, []);

  // タイマー
  useEffect(() => {
    if (!gameStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeRemaining, onGameOver]);

  // クリア判定
  useEffect(() => {
    if (tiles.length > 0 && isGameCleared(tiles)) {
      setTimeout(() => {
        onClear();
      }, 1000);
    }
  }, [tiles, onClear]);

  // 手詰まり判定
  useEffect(() => {
    if (tiles.length > 0 && isStuck(tiles)) {
      alert('手詰まりです！シャッフルします。');
      handleShuffle();
    }
  }, [tiles]);

  // 牌をクリック
  const handleTileClick = (tile) => {
    if (tile.isRemoved || !isSelectable(tile, tiles)) return;

    // ヒントクリア
    setHintTiles([]);

    if (!selectedTile) {
      // 1枚目を選択
      setSelectedTile(tile);
    } else if (selectedTile.id === tile.id) {
      // 同じ牌をクリック → 選択解除
      setSelectedTile(null);
    } else if (canMatch(selectedTile, tile, tiles)) {
      // ペア成立 → 削除
      setTiles(prevTiles =>
        prevTiles.map(t =>
          t.id === selectedTile.id || t.id === tile.id
            ? { ...t, isRemoved: true }
            : t
        )
      );
      setSelectedTile(null);
    } else {
      // ペア不成立 → 2枚目を選択
      setSelectedTile(tile);
    }
  };

  // ヒント機能
  const handleHint = () => {
    if (hintsRemaining <= 0) {
      alert('ヒント残り回数がありません！');
      return;
    }

    const hint = findHint(tiles);
    if (hint) {
      setHintTiles(hint);
      setHintsRemaining(prev => prev - 1);

      // 3秒後にヒントクリア
      setTimeout(() => {
        setHintTiles([]);
      }, 3000);
    } else {
      alert('ヒントが見つかりません！');
    }
  };

  // シャッフル
  const handleShuffle = () => {
    const remainingTiles = tiles.filter(t => !t.isRemoved);
    const positions = remainingTiles.map(t => ({ x: t.x, y: t.y, layer: t.layer }));

    // タイプをシャッフル
    const types = remainingTiles.map(t => t.type).sort(() => Math.random() - 0.5);

    setTiles(prevTiles =>
      prevTiles.map((t, index) => {
        if (t.isRemoved) return t;
        const pos = positions.shift();
        return { ...t, ...pos, type: types[index] || t.type };
      })
    );
  };

  // リセット
  const handleReset = () => {
    const newTiles = generateTutorialLayout();
    setTiles(newTiles);
    setSelectedTile(null);
    setHintTiles([]);
    setHintsRemaining(5);
    setTimeRemaining(600);
  };

  const remainingTiles = tiles.filter(t => !t.isRemoved).length;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="shanghai-puzzle">
      {/* HUD */}
      <div className="hud">
        <div className="hud-item">
          <span className="hud-label">残り:</span>
          <span className="hud-value">{remainingTiles}枚</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">時間:</span>
          <span className="hud-value">{`${minutes}:${seconds.toString().padStart(2, '0')}`}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">ヒント:</span>
          <span className="hud-value">{hintsRemaining}回</span>
        </div>
      </div>

      {/* パズル盤面 */}
      <div className="puzzle-board">
        {tiles.map(tile => {
          const isSelected = selectedTile?.id === tile.id;
          const isHint = hintTiles.some(h => h.id === tile.id);
          const selectable = !tile.isRemoved && isSelectable(tile, tiles);

          return (
            <div
              key={tile.id}
              className={`tile ${tile.isRemoved ? 'removed' : ''} ${isSelected ? 'selected' : ''} ${
                isHint ? 'hint' : ''
              } ${selectable ? 'selectable' : 'blocked'} layer-${tile.layer}`}
              style={{
                left: `${tile.x * 70 + tile.layer * 5}px`,
                top: `${tile.y * 90 + tile.layer * 5}px`,
                zIndex: tile.layer * 100 + tile.y * 10 + tile.x
              }}
              onClick={() => handleTileClick(tile)}
            >
              <div className="tile-content">{tile.type}</div>
            </div>
          );
        })}
      </div>

      {/* コントロールボタン */}
      <div className="controls">
        <button className="control-button" onClick={handleHint} disabled={hintsRemaining <= 0}>
          💡 ヒント
        </button>
        <button className="control-button" onClick={handleReset}>
          🔄 やり直し
        </button>
      </div>
    </div>
  );
}

export default ShanghaiPuzzle;
