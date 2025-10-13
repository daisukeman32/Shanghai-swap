import React, { useState, useEffect } from 'react';
import './styles/App.css';
import TitleScreen from './components/TitleScreen';
import NameInput from './components/NameInput';
import ConversationScene from './components/ConversationScene';
import ShanghaiPuzzle from './components/ShanghaiPuzzle';
import RewardScene from './components/RewardScene';
import { loadGameData } from './utils/csvLoader';
import {
  loadSaveData,
  autoSave,
  getCharacterStage,
  updateCharacterStage,
  unlockNextCharacter,
  isCharacterFullyCleared,
  markCharacterCleared,
  resetCharacterStage
} from './utils/saveManager';

function App() {
  const [currentScene, setCurrentScene] = useState('title');
  const [gameData, setGameData] = useState(null);
  const [saveData, setSaveData] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('airi');
  const [currentStage, setCurrentStage] = useState(1);
  const [nextDialogueId, setNextDialogueId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ゲーム初期化
  useEffect(() => {
    const initGame = async () => {
      try {
        // CSV読み込み
        const data = await loadGameData();
        setGameData(data);

        // セーブデータ読み込み
        const save = loadSaveData();
        setSaveData(save);

        // セーブデータに名前があれば設定
        if (save.playerName) {
          setPlayerName(save.playerName);
        }

        setLoading(false);
      } catch (error) {
        console.error('ゲーム初期化エラー:', error);
        setLoading(false);
      }
    };

    initGame();
  }, []);

  // 自動セーブ（5秒間隔）
  useEffect(() => {
    if (saveData) {
      const interval = setInterval(() => {
        autoSave(saveData);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [saveData]);

  // シーン遷移
  const changeScene = (scene) => {
    setCurrentScene(scene);
  };

  // 名前設定
  const setName = (name) => {
    setPlayerName(name);
    setSaveData({
      ...saveData,
      playerName: name
    });
  };

  // キャラクター選択時：ステージをロード（「はじめから」ボタン用）
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    // 「はじめから」は常にstage1から開始 - セーブデータもリセット
    const updatedSaveData = resetCharacterStage(saveData, character);
    setSaveData(updatedSaveData);
    setCurrentStage(1);
    setNextDialogueId(null); // 初回は null（{character}_1 から開始）
    changeScene('nameInput');
  };

  // ステージクリア時：次のステージへ進む
  const handleStageComplete = (nextDialogueId) => {
    const newStage = currentStage + 1;
    const maxStage = selectedCharacter === 'misaki' ? 4 : 6; // 美咲は4ステージのみ

    if (newStage > maxStage) {
      // 全ステージクリア
      console.log(`${selectedCharacter} 全ステージクリア！`);

      // キャラクターをクリア済みとしてマーク
      let updatedSaveData = markCharacterCleared(saveData, selectedCharacter);

      // 次のキャラクターを解放
      updatedSaveData = unlockNextCharacter(updatedSaveData, selectedCharacter);

      setSaveData(updatedSaveData);

      // タイトルへ戻る
      changeScene('title');
    } else {
      // 次のステージへ進む
      const updatedSaveData = updateCharacterStage(saveData, selectedCharacter, newStage);
      setSaveData(updatedSaveData);
      setCurrentStage(newStage);
      setNextDialogueId(nextDialogueId); // rewards.csvのnext_dialogue_idを使用
      changeScene('conversation');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="app">
      {currentScene === 'title' && (
        <TitleScreen
          onStart={handleCharacterSelect}
          onContinue={() => changeScene('conversation')}
          onGallery={() => changeScene('gallery')}
          saveData={saveData}
        />
      )}

      {currentScene === 'nameInput' && (
        <NameInput
          defaultName={playerName}
          onSubmit={(name) => {
            setName(name);
            changeScene('conversation');
          }}
        />
      )}

      {currentScene === 'conversation' && (
        <ConversationScene
          gameData={gameData}
          playerName={playerName}
          selectedCharacter={selectedCharacter}
          currentStage={currentStage}
          startDialogueId={nextDialogueId}
          onComplete={() => changeScene('puzzle')}
          onBadEnd={() => changeScene('title')}
        />
      )}

      {currentScene === 'puzzle' && (
        <ShanghaiPuzzle
          onClear={() => changeScene('reward')}
          onGameOver={() => changeScene('conversation')}
        />
      )}

      {currentScene === 'reward' && (
        <RewardScene
          selectedCharacter={selectedCharacter}
          currentStage={currentStage}
          gameData={gameData}
          saveData={saveData}
          onStageComplete={handleStageComplete}
        />
      )}
    </div>
  );
}

export default App;
