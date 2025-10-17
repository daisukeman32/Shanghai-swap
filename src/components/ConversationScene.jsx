import React, { useState, useEffect } from 'react';
import './ConversationScene.css';
import audioManager, { playBGMById, playSEById } from '../utils/audioManager';

function ConversationScene({ gameData, playerName, selectedCharacter, currentStage, startDialogueId, onComplete, onBadEnd }) {
  // キャラクター別の開始ダイアログID
  const getStartDialogueId = () => {
    // startDialogueIdが指定されている場合はそれを使用（ステージ2以降）
    if (startDialogueId) {
      return startDialogueId;
    }
    // 指定がない場合は {character}_1 から開始（ステージ1）
    return `${selectedCharacter}_1`;
  };

  const [currentDialogueId, setCurrentDialogueId] = useState(getStartDialogueId());
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);
  const [isMouthOpen, setIsMouthOpen] = useState(false); // 口パク状態管理
  const [showChoiceImage, setShowChoiceImage] = useState(false); // 選択肢画像表示フラグ
  const [choiceImagePath, setChoiceImagePath] = useState(null); // 選択肢画像パス

  const currentDialogue = gameData?.dialogues?.find(
    d => d.dialogue_id === currentDialogueId
  );

  // ダイアログのcharacter_idに応じてキャラクターを取得（美咲登場対応）
  const currentCharacter = gameData?.characters?.find(
    c => c.character_id === currentDialogue?.character_id
  );

  // startDialogueIdが変更されたときにダイアログIDをリセット
  useEffect(() => {
    const newDialogueId = getStartDialogueId();
    setCurrentDialogueId(newDialogueId);
    console.log(`ConversationScene開始: ステージ ${currentStage}, ダイアログID: ${newDialogueId}`);
  }, [selectedCharacter, startDialogueId]); // selectedCharacterとstartDialogueIdが変更されたときに実行

  // BGM再生（会話シーン開始時）
  useEffect(() => {
    if (gameData?.bgm) {
      playBGMById(gameData.bgm, 'BGM_001'); // 会話シーンのBGM
    }

    // クリーンアップ: コンポーネントアンマウント時にBGM停止
    return () => {
      audioManager.fadeOutBGM(500);
    };
  }, [gameData]);

  // 口パクアニメーション & タイピング音
  useEffect(() => {
    let mouthAnimationInterval = null;
    let typingSoundId = null;

    if (isTyping) {
      // タイピング音を再生（ループ）
      if (gameData?.soundEffects) {
        // 主人公かナレーターの場合はSE_011、それ以外はSE_010
        const seAssetId = (currentDialogue?.character_id === 'protagonist' || currentDialogue?.character_id === 'narrator')
          ? 'SE_011'
          : 'SE_010';
        const typingSE = gameData.soundEffects.find(se => se.asset_id === seAssetId);
        if (typingSE) {
          typingSoundId = audioManager.playSE(typingSE.file_path, true, parseFloat(typingSE.volume) || 0.3);
        }
      }

      // 口パクアニメーション（emotionがdefaultの時のみ）
      if (currentDialogue?.character_id !== 'narrator' && currentDialogue?.emotion === 'default') {
        mouthAnimationInterval = setInterval(() => {
          setIsMouthOpen(prev => !prev);
        }, 200);
      }
    } else {
      // タイピング終了時
      setIsMouthOpen(false);
      if (typingSoundId) {
        audioManager.stopSE();
      }
    }

    return () => {
      if (mouthAnimationInterval) {
        clearInterval(mouthAnimationInterval);
      }
      audioManager.stopSE();
    };
  }, [isTyping, currentDialogue, gameData]);

  // テキストのタイプライター効果
  useEffect(() => {
    if (!currentDialogue) return;

    // プレイヤー名のプレースホルダーを置き換え
    const fullText = currentDialogue.text.replace(/{playerName}/g, playerName || 'あなた');
    setDisplayedText('');
    setIsTyping(true);
    setShowChoices(false);

    let index = 0;
    let timeoutId = null;
    let isCancelled = false;

    const typeNextChar = () => {
      if (isCancelled) return;

      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        const currentChar = fullText[index];

        // 句読点で待機時間を調整
        let currentDelay;
        if (currentChar === '。' || currentChar === '！' || currentChar === '？') {
          currentDelay = 300; // 文末は長めの間
        } else if (currentChar === '、' || currentChar === '…') {
          currentDelay = 150; // 読点は中間の間
        } else {
          currentDelay = 50; // 通常の文字
        }

        index++;
        timeoutId = setTimeout(typeNextChar, currentDelay);
      } else {
        setIsTyping(false);

        // 選択肢チェック
        if (currentDialogue.next_dialogue_id.startsWith('choice_')) {
          const choiceId = currentDialogue.next_dialogue_id;
          const choices = gameData.choices.filter(c =>
            c.choice_id.startsWith(choiceId)
          );
          setCurrentChoices(choices);
          setSelectedChoiceIndex(0);
          setShowChoices(true);
        }
      }
    };

    typeNextChar();

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentDialogueId, currentDialogue, gameData, playerName]);

  // キーボード・クリックイベントで次へ進む / 選択肢操作
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showChoices) {
        // 選択肢表示中：カーソルキーで選択、Enterで決定
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          // カーソル移動音
          if (gameData?.soundEffects) {
            playSEById(gameData.soundEffects, 'SE_004'); // カーソル移動音
          }
          setSelectedChoiceIndex(prev =>
            prev > 0 ? prev - 1 : currentChoices.length - 1
          );
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          // カーソル移動音
          if (gameData?.soundEffects) {
            playSEById(gameData.soundEffects, 'SE_004'); // カーソル移動音
          }
          setSelectedChoiceIndex(prev =>
            prev < currentChoices.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleChoice(currentChoices[selectedChoiceIndex]);
        }
      } else {
        // 通常の会話進行
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isTyping, showChoices, currentDialogue, currentChoices, selectedChoiceIndex]);

  // 次のダイアログへ進む
  const handleNext = () => {
    // クリック音再生
    if (gameData?.soundEffects) {
      playSEById(gameData.soundEffects, 'SE_001'); // クリック音
    }

    if (isTyping) {
      // タイピング中の場合はスキップ
      const fullText = currentDialogue.text.replace(/{playerName}/g, playerName || 'あなた');
      setDisplayedText(fullText);
      setIsTyping(false);
      return;
    }

    if (showChoices) return; // 選択肢表示中は進まない

    const nextId = currentDialogue.next_dialogue_id;

    if (nextId === 'puzzle_start') {
      onComplete();
    } else if (nextId === 'bad_end') {
      onBadEnd();
    } else if (!nextId.startsWith('choice_')) {
      setCurrentDialogueId(nextId);
    }
  };

  // 選択肢を選ぶ
  const handleChoice = (choice) => {
    // 選択音再生
    if (gameData?.soundEffects) {
      if (choice.is_correct === 'true') {
        playSEById(gameData.soundEffects, 'SE_002'); // 正解音
      } else {
        playSEById(gameData.soundEffects, 'SE_003'); // 不正解音
      }
    }

    setShowChoices(false);

    // 選択肢に画像がある場合は画像を表示
    if (choice.choice_image && choice.choice_image.trim() !== '') {
      console.log('選択肢画像を表示:', choice.choice_image);
      setChoiceImagePath(choice.choice_image);
      setShowChoiceImage(true);

      // 画像表示後、次のダイアログへ進む準備
      // 実際の遷移は画像クリック時に実行
      setTimeout(() => {
        // 自動的に3秒後に画像を閉じる
        setShowChoiceImage(false);
        if (choice.is_correct === 'true') {
          setCurrentDialogueId(choice.next_dialogue_id);
        } else {
          // BADエンド
          setCurrentDialogueId(choice.next_dialogue_id);
        }
      }, 3000); // 3秒表示
    } else {
      // 画像がない場合は即座に次のダイアログへ
      if (choice.is_correct === 'true') {
        setCurrentDialogueId(choice.next_dialogue_id);
      } else {
        // BADエンド
        setCurrentDialogueId(choice.next_dialogue_id);
      }
    }
  };

  if (!currentDialogue || !currentCharacter) {
    return (
      <div className="conversation-scene">
        <p style={{ color: 'white' }}>データ読み込み中...</p>
      </div>
    );
  }

  // 背景色・背景画像取得
  const scene = gameData?.scenes?.find(s => s.scene_id === currentDialogue.scene_id);
  const bgColor = scene?.background_color || '#FFB6C1';
  const bgImage = scene?.background_image || null;

  // 感情に応じた色（仮素材用）
  const emotionColors = {
    smile: '#FFD700',
    normal: '#87CEEB',
    shy: '#FFB6C1',
    sad: '#9370DB',
    angry: '#FF6347'
  };

  const characterColor = emotionColors[currentDialogue.emotion] || '#87CEEB';

  // 画面全体をクリックで次へ進む
  const handleScreenClick = () => {
    if (!showChoices) {
      handleNext();
    }
  };

  // キャラクター立ち絵画像を取得（口パク対応）
  const getCharacterSprite = () => {
    if (!gameData?.images || !currentDialogue) return null;

    // ナレーターの場合は立ち絵を表示しない
    if (currentDialogue.character_id === 'narrator') {
      return null;
    }

    const targetCharacterId = currentDialogue.character_id;
    const targetEmotion = currentDialogue.emotion;

    // 口パク中かつemotionがdefaultの場合のみ talk 画像を優先
    if (isMouthOpen && currentDialogue.character_id !== 'narrator' && targetEmotion === 'default') {
      const talkSprite = gameData.images.find(
        img => img.image_type === 'character_sprite' &&
               img.character_id === targetCharacterId &&
               img.emotion === 'talk'
      );
      if (talkSprite) return talkSprite.file_path;
    }

    // 通常の感情画像を取得
    let sprite = gameData.images.find(
      img => img.image_type === 'character_sprite' &&
             img.character_id === targetCharacterId &&
             img.emotion === targetEmotion
    );

    // 指定されたemotionの画像が見つからない場合は、defaultにフォールバック
    if (!sprite) {
      sprite = gameData.images.find(
        img => img.image_type === 'character_sprite' &&
               img.character_id === targetCharacterId &&
               img.emotion === 'default'
      );
    }

    return sprite?.file_path || null;
  };

  const spriteImagePath = getCharacterSprite();

  return (
    <div className="conversation-scene" style={{ background: bgColor }} onClick={handleScreenClick}>
      {/* 背景画像レイヤー（第1ステージは非表示） */}
      {bgImage && currentStage > 1 && (
        <div className="background-layer">
          <img src={bgImage} alt="背景" className="background-image" />
        </div>
      )}

      {/* キャラクター立ち絵 */}
      <div className={`character-sprite slide-in-right ${isTyping ? 'talking' : ''}`}>
        {spriteImagePath ? (
          // 実際の画像を表示
          <div className="character-sprite-image">
            <img
              src={spriteImagePath}
              alt={`${currentCharacter.character_name} (${currentDialogue.emotion})`}
              onError={(e) => {
                // 画像読み込みエラー時は仮素材にフォールバック
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div
              className="character-sprite-dummy"
              style={{
                background: `linear-gradient(135deg, ${characterColor}, ${characterColor}dd)`,
                display: 'none'
              }}
            >
              <span className="emotion-label">{currentDialogue.emotion}</span>
            </div>
          </div>
        ) : (
          // 仮素材（画像が見つからない場合）
          <div
            className="character-sprite-dummy"
            style={{ background: `linear-gradient(135deg, ${characterColor}, ${characterColor}dd)` }}
          >
            <span className="emotion-label">{currentDialogue.emotion}</span>
          </div>
        )}
        <p className="character-name-label">{currentCharacter.character_name}</p>
      </div>

      {/* テキストボックス */}
      <div className="textbox">
        <div className="textbox-header">
          <span className="speaker-name">{currentCharacter.character_name}</span>
        </div>
        <div className="textbox-content">
          <p className="dialogue-text">{displayedText}</p>
        </div>
        {!isTyping && !showChoices && (
          <div className="next-indicator" onClick={handleNext}>
            ▼ クリックで次へ
          </div>
        )}
      </div>

      {/* 選択肢 */}
      {showChoices && (
        <div className="choices-container">
          {currentChoices.map((choice, index) => (
            <button
              key={index}
              className={`choice-button ${selectedChoiceIndex === index ? 'selected' : ''}`}
              onClick={() => handleChoice(choice)}
            >
              ▶ {choice.choice_text}
              {selectedChoiceIndex === index && (
                <span className="choice-indicator">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 選択肢画像表示（全画面モーダル） */}
      {showChoiceImage && choiceImagePath && (
        <div
          className="choice-image-modal"
          onClick={() => {
            setShowChoiceImage(false);
            // 画像クリックで即座に次の会話へ
            const nextChoice = currentChoices.find(c => c.choice_image === choiceImagePath);
            if (nextChoice) {
              if (nextChoice.is_correct === 'true') {
                setCurrentDialogueId(nextChoice.next_dialogue_id);
              } else {
                setCurrentDialogueId(nextChoice.next_dialogue_id);
              }
            }
          }}
        >
          <img
            src={choiceImagePath}
            alt="選択肢画像"
            className="choice-image-fullscreen"
          />
          <div className="choice-image-hint">クリックで続きへ</div>
        </div>
      )}
    </div>
  );
}

export default ConversationScene;
