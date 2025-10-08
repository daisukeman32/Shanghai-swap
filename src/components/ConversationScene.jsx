import React, { useState, useEffect } from 'react';
import './ConversationScene.css';

function ConversationScene({ gameData, playerName, onComplete, onBadEnd }) {
  const [currentDialogueId, setCurrentDialogueId] = useState('1');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [currentChoices, setCurrentChoices] = useState([]);

  const currentDialogue = gameData?.dialogues?.find(
    d => d.dialogue_id === currentDialogueId
  );

  const currentCharacter = gameData?.characters?.find(
    c => c.character_id === currentDialogue?.character_id
  );

  // テキストのタイプライター効果
  useEffect(() => {
    if (!currentDialogue) return;

    const fullText = currentDialogue.text;
    setDisplayedText('');
    setIsTyping(true);
    setShowChoices(false);

    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);

        // 選択肢チェック
        if (currentDialogue.next_dialogue_id.startsWith('choice_')) {
          const choiceId = currentDialogue.next_dialogue_id;
          const choices = gameData.choices.filter(c =>
            c.choice_id.startsWith(choiceId)
          );
          setCurrentChoices(choices);
          setShowChoices(true);
        }
      }
    }, 50); // 50ms/文字

    return () => clearInterval(timer);
  }, [currentDialogueId, currentDialogue, gameData]);

  // 次のダイアログへ進む
  const handleNext = () => {
    if (isTyping) {
      // タイピング中の場合はスキップ
      setDisplayedText(currentDialogue.text);
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

  return (
    <div className="conversation-scene" style={{ background: bgColor }}>
      {/* キャラクター立ち絵（仮素材） */}
      <div className="character-sprite slide-in-right">
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
              className="choice-button"
              onClick={() => handleChoice(choice)}
            >
              ▶ {choice.choice_text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConversationScene;
