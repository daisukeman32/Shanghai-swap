import React from 'react';
import './TitleScreen.css';

function TitleScreen({ onStart, onContinue, onGallery, saveData }) {
  const hasSaveData = saveData && saveData.playerName;

  return (
    <div className="title-screen">
      <div className="title-bg"></div>

      <div className="title-content">
        {/* タイトルロゴ */}
        <div className="title-logo fade-in">
          <h1 className="main-title">
            クラスで一番人気の美少女と
            <br />
            入れ替われるパズル
          </h1>
          <p className="sub-title">～30分間の秘密～</p>
        </div>

        {/* キャラクター立ち絵（仮素材：色付き四角形） */}
        <div className="character-lineup">
          <div className="character-dummy character-1" title="星野 愛莉">
            <span className="character-name">愛莉</span>
          </div>
          <div className="character-dummy character-2" title="夏目 夏帆">
            <span className="character-name">夏帆</span>
          </div>
          <div className="character-dummy character-3" title="水瀬 美月">
            <span className="character-name">美月</span>
          </div>
        </div>

        {/* メニューボタン */}
        <div className="menu-buttons">
          <button className="menu-button" onClick={onStart}>
            ▶ はじめから
          </button>

          {hasSaveData && (
            <button className="menu-button" onClick={onContinue}>
              ▶ つづきから
            </button>
          )}

          <button className="menu-button" onClick={onGallery}>
            ▶ ギャラリー
          </button>

          <button className="menu-button" onClick={() => alert('設定機能は開発中です')}>
            ▶ 設定
          </button>
        </div>

        {/* バージョン情報 */}
        <div className="version-info">
          Ver 1.0 (DEMO)
        </div>
      </div>
    </div>
  );
}

export default TitleScreen;
