import React, { useState } from 'react';
import './TitleScreen.css';
import { isCharacterUnlocked } from '../utils/saveManager';

function TitleScreen({ onStart, onContinue, onGallery, saveData }) {
  const hasSaveData = saveData && saveData.playerName;
  const [selectedCharacter, setSelectedCharacter] = useState('airi'); // デフォルトは愛莉

  const characters = [
    { id: 'airi', name: '愛莉', fullName: '星野 愛莉', className: 'character-1', image: '/assets/characters/airi/airi_title.png' },
    { id: 'kaho', name: '夏帆', fullName: '夏目 夏帆', className: 'character-2', image: '/assets/characters/kaho/kaho_title.png' },
    { id: 'mitsuki', name: '美月', fullName: '水瀬 美月', className: 'character-3', image: '/assets/characters/mitsuki/mitsuki_title.png' },
    { id: 'misaki', name: '美咲', fullName: '木村 美咲', className: 'character-4', image: '/assets/characters/misaki/misaki_title.png' }
  ];

  // セーブデータの状態を確認
  const hasProgress = saveData && saveData.playerName && saveData.characterProgress;

  // 続きから情報を取得
  const getContinueInfo = () => {
    if (!hasProgress) return null;

    // 最後にプレイしたキャラクターを探す
    let lastCharId = null;
    let lastStage = 0;

    for (const [charId, progress] of Object.entries(saveData.characterProgress)) {
      if (progress && progress.currentStage > lastStage) {
        lastCharId = charId;
        lastStage = progress.currentStage;
      }
    }

    if (!lastCharId) return null;

    const char = characters.find(c => c.id === lastCharId);
    return {
      characterId: lastCharId,
      characterName: char ? char.name : '不明',
      stage: lastStage
    };
  };

  const continueInfo = getContinueInfo();

  // スタートボタンのハンドラー（自動判定）
  const handleStart = () => {
    if (continueInfo) {
      // セーブデータがあれば続きから
      onContinue();
    } else {
      // なければ選択中のキャラではじめから
      onStart(selectedCharacter);
    }
  };

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
          {/* メインスタートボタン */}
          <button className="menu-button main-start-button" onClick={handleStart} autoFocus>
            {continueInfo ? (
              <>
                <div className="button-main">▶ スタート</div>
                <div className="button-sub">
                  {continueInfo.characterName} ステージ{continueInfo.stage}から再開
                </div>
              </>
            ) : (
              <div className="button-main">▶ スタート</div>
            )}
          </button>

          {/* 新しく始めるリンク（セーブデータがある場合のみ表示） */}
          {continueInfo && (
            <button className="menu-button secondary-button" onClick={() => onStart(selectedCharacter)}>
              最初から始める（{characters.find(c => c.id === selectedCharacter)?.name}）
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
