import React, { useState } from 'react';
import './TitleScreen.css';

function TitleScreen({ onStart, onContinue, onGallery, saveData }) {
  const hasSaveData = saveData && saveData.playerName;
  const [selectedCharacter, setSelectedCharacter] = useState('airi'); // デフォルトは愛莉

  const characters = [
    { id: 'airi', name: '愛莉', fullName: '星野 愛莉', className: 'character-1' },
    { id: 'kaho', name: '夏帆', fullName: '夏目 夏帆', className: 'character-2' },
    { id: 'mitsuki', name: '美月', fullName: '水瀬 美月', className: 'character-3' }
  ];

  const handleCharacterSelect = (characterId) => {
    setSelectedCharacter(characterId);
  };

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
          {characters.map((char) => (
            <div
              key={char.id}
              className={`character-dummy ${char.className} ${
                selectedCharacter === char.id ? 'selected' : ''
              }`}
              title={char.fullName}
              onClick={() => handleCharacterSelect(char.id)}
            >
              <span className="character-name">{char.name}</span>
              {selectedCharacter === char.id && (
                <div className="selected-indicator">✓</div>
              )}
            </div>
          ))}
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
