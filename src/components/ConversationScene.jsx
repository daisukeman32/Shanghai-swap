import React, { useState, useEffect } from 'react';
import './ConversationScene.css';

function ConversationScene({ gameData, playerName, onComplete, onBadEnd }) {
  const [currentDialogueId, setCurrentDialogueId] = useState('1');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);

  const currentDialogue = gameData?.dialogues?.find(
    d => d.dialogue_id === currentDialogueId
  );

  const currentCharacter = gameData?.characters?.find(
    c => c.character_id === currentDialogue?.character_id
  );

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
          setSelectedChoiceIndex(prev =>
            prev > 0 ? prev - 1 : currentChoices.length - 1
          );
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
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
    setShowChoices(false);

    if (choice.is_correct === 'true') {
      setCurrentDialogueId(choice.next_dialogue_id);
    } else {
      // BADエンド
      setCurrentDialogueId(choice.next_dialogue_id);
    }
  };

  if (!currentDialogue || !currentCharacter) {
    return (
      <div className="conversation-scene">
        <p style={{ color: 'white' }}>データ読み込み中...</p>
      </div>
    );
  }

  // 背景色取得
  const scene = gameData?.scenes?.find(s => s.scene_id === currentDialogue.scene_id);
  const bgColor = scene?.background_color || '#FFB6C1';

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

  return (
    <div className="conversation-scene" style={{ background: bgColor }} onClick={handleScreenClick}>
      {/* キャラクター立ち絵（仮素材） */}
      <div className={`character-sprite slide-in-right ${isTyping ? 'talking' : ''}`}>
        <div
          className="character-sprite-dummy"
          style={{ background: `linear-gradient(135deg, ${characterColor}, ${characterColor}dd)` }}
        >
          <span className="emotion-label">{currentDialogue.emotion}</span>
        </div>
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
    </div>
  );
}

export default ConversationScene;
