import React, { useState, useEffect } from 'react';
import './styles/App.css';
import TitleScreen from './components/TitleScreen';
import NameInput from './components/NameInput';
import ConversationScene from './components/ConversationScene';
import ShanghaiPuzzle from './components/ShanghaiPuzzle';
import RewardScene from './components/RewardScene';
import { loadGameData } from './utils/csvLoader';
import { loadSaveData, autoSave } from './utils/saveManager';

function App() {
  const [currentScene, setCurrentScene] = useState('title');
  const [gameData, setGameData] = useState(null);
  const [saveData, setSaveData] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('airi');
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
          onStart={(character) => {
            setSelectedCharacter(character);
            changeScene('nameInput');
          }}
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
          gameData={gameData}
          onComplete={() => changeScene('title')}
        />
      )}
    </div>
  );
}

export default App;
