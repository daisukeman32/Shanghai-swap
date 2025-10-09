import React, { useEffect, useRef } from 'react';
import './ShanghaiPuzzle.css';

function ShanghaiPuzzle({ onClear, onGameOver }) {
  const containerRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    // マージャンソリティア初期化
    if (containerRef.current && !gameInstanceRef.current) {
      const game = new window.MahjongSolitaire();

      game.init(containerRef.current, {
        imagePath: '/mahjong-solitaire/img/',
        showHint: true,
        showRestart: false, // ノベルゲーム側で制御
        autoStart: true,
        minimalUI: false
      });

      // ゲーム終了時のコールバック
      game.onGameEnd((result) => {
        console.log('Game ended:', result);
        if (result.won) {
          // クリア時
          setTimeout(() => {
            onClear && onClear();
          }, 2000);
        } else {
          // ゲームオーバー時
          setTimeout(() => {
            onGameOver && onGameOver();
          }, 2000);
        }
      });

      gameInstanceRef.current = game;
    }

    // クリーンアップ
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      gameInstanceRef.current = null;
    };
  }, [onClear, onGameOver]);

  return (
    <div
      className="shanghai-puzzle"
      style={{
        backgroundImage: 'url(/assets/shanghai-bg.jpg)'
      }}
    >
      <div ref={containerRef} className="mahjong-wrapper"></div>
    </div>
  );
}

export default ShanghaiPuzzle;
