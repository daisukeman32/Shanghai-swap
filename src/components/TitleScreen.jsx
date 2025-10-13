import React, { useState } from 'react';
import './TitleScreen.css';
import { isCharacterUnlocked } from '../utils/saveManager';

function TitleScreen({ onStart, onContinue, onGallery, saveData }) {
  const hasSaveData = saveData && saveData.playerName;
  const [selectedCharacter, setSelectedCharacter] = useState('airi'); // デフォルトは愛莉

  const characters = [
    { id: 'airi', name: '愛莉', fullName: '星野 愛莉', className: 'character-1', image: '/assets/characters/character1.png' },
    { id: 'kaho', name: '夏帆', fullName: '夏目 夏帆', className: 'character-2', image: '/assets/characters/character2.png' },
    { id: 'mitsuki', name: '美月', fullName: '水瀬 美月', className: 'character-3', image: '/assets/characters/character3.png' },
    { id: 'misaki', name: '美咲', fullName: '木村 美咲', className: 'character-4', image: '/assets/characters/character4.png' }
  ];

  const handleCharacterSelect = (characterId) => {
    // ロックされているキャラは選択不可
    if (!isCharacterUnlocked(saveData, characterId)) {
      return;
    }
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
        </div>

        {/* キャラクター立ち絵（仮素材：色付き四角形） */}
        <div className="character-lineup">
          {characters.map((char) => {
            const isUnlocked = isCharacterUnlocked(saveData, char.id);
            return (
              <div
                key={char.id}
                className={`character-dummy ${char.className} ${
                  selectedCharacter === char.id ? 'selected' : ''
                } ${!isUnlocked ? 'locked' : ''}`}
                style={{ backgroundImage: `url(${char.image})` }}
                title={isUnlocked ? char.fullName : '？？？（ロック中）'}
                onClick={() => handleCharacterSelect(char.id)}
              >
                <span className="character-name">
                  {isUnlocked ? char.name : '？？？'}
                </span>
                {selectedCharacter === char.id && isUnlocked && (
                  <div className="selected-indicator">✓</div>
                )}
                {!isUnlocked && (
                  <div className="lock-indicator">🔒</div>
                )}
              </div>
            );
          })}
        </div>

        {/* メニューボタン */}
        <div className="menu-buttons">
          <button className="menu-button" onClick={() => onStart(selectedCharacter)}>
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
