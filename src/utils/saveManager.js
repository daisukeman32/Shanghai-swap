/**
 * セーブ/ロード管理システム
 * LocalStorageを使用した自動保存（5秒間隔）
 */

const SAVE_KEY = 'beauty_swap_puzzle_save';

/**
 * デフォルトセーブデータ構造
 */
export function getDefaultSaveData() {
  return {
    playerName: '',
    clearedCharacters: [],
    unlockedCharacters: ['airi'], // 初期は愛莉のみ解放（愛莉→夏帆→美月→美咲の順）
    unlockedRewards: [],
    currentScene: 'title',
    currentProgress: {
      characterId: null,
      dialogueId: null
    },
    // キャラクター別ステージ進行度
    characterProgress: {
      airi: { currentStage: 1, clearedStages: [] },
      kaho: { currentStage: 1, clearedStages: [] },
      mitsuki: { currentStage: 1, clearedStages: [] },
      misaki: { currentStage: 1, clearedStages: [] }
    },
    statistics: {
      totalPlayTime: 0,
      gamesPlayed: 0,
      gamesCleared: 0,
      hintsUsed: 0,
      undoUsed: 0
    },
    settings: {
      bgmVolume: 70,
      seVolume: 50,
      textSpeed: 'normal', // 'slow', 'normal', 'fast'
      fullscreen: false
    },
    timestamp: Date.now()
  };
}

/**
 * セーブデータを読み込む
 * @returns {Object} セーブデータ
 */
export function loadSaveData() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      console.log('セーブデータ読み込み成功:', data);
      return data;
    }
  } catch (error) {
    console.error('セーブデータ読み込みエラー:', error);
  }

  return getDefaultSaveData();
}

/**
 * セーブデータを保存
 * @param {Object} saveData - セーブデータ
 */
export function saveSaveData(saveData) {
  try {
    const dataWithTimestamp = {
      ...saveData,
      timestamp: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataWithTimestamp));
    console.log('セーブデータ保存成功');
    return true;
  } catch (error) {
    console.error('セーブデータ保存エラー:', error);
    return false;
  }
}

/**
 * 自動セーブ（5秒間隔で呼び出される）
 * @param {Object} saveData - セーブデータ
 */
export function autoSave(saveData) {
  return saveSaveData(saveData);
}

/**
 * セーブデータを削除
 */
export function deleteSaveData() {
  try {
    localStorage.removeItem(SAVE_KEY);
    console.log('セーブデータ削除成功');
    return true;
  } catch (error) {
    console.error('セーブデータ削除エラー:', error);
    return false;
  }
}

/**
 * セーブデータをエクスポート（JSON形式）
 * @param {Object} saveData - セーブデータ
 */
export function exportSaveData(saveData) {
  try {
    const dataStr = JSON.stringify(saveData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shanghai_swap_save_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('セーブデータエクスポートエラー:', error);
    return false;
  }
}

/**
 * セーブデータをインポート（JSON形式）
 * @param {File} file - JSONファイル
 * @returns {Promise<Object>} インポートされたセーブデータ
 */
export async function importSaveData(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    saveSaveData(data);
    return data;
  } catch (error) {
    console.error('セーブデータインポートエラー:', error);
    return null;
  }
}

/**
 * ご褒美を解放
 * @param {Object} saveData - セーブデータ
 * @param {string} rewardId - ご褒美ID
 * @returns {Object} 更新されたセーブデータ
 */
export function unlockReward(saveData, rewardId) {
  if (!saveData.unlockedRewards.includes(rewardId)) {
    saveData.unlockedRewards.push(rewardId);
    saveSaveData(saveData);
  }
  return saveData;
}

/**
 * キャラクターをクリア済みにマーク
 * @param {Object} saveData - セーブデータ
 * @param {string} characterId - キャラクターID
 * @returns {Object} 更新されたセーブデータ
 */
export function markCharacterCleared(saveData, characterId) {
  if (!saveData.clearedCharacters.includes(characterId)) {
    saveData.clearedCharacters.push(characterId);
    saveData.statistics.gamesCleared++;
    saveSaveData(saveData);
  }
  return saveData;
}

/**
 * 統計情報を更新
 * @param {Object} saveData - セーブデータ
 * @param {string} stat - 統計項目
 * @param {number} value - 値
 * @returns {Object} 更新されたセーブデータ
 */
export function updateStatistics(saveData, stat, value) {
  if (saveData.statistics.hasOwnProperty(stat)) {
    saveData.statistics[stat] += value;
    saveSaveData(saveData);
  }
  return saveData;
}

/**
 * キャラクターの現在のステージを取得
 * @param {Object} saveData - セーブデータ
 * @param {string} characterId - キャラクターID
 * @returns {number} 現在のステージ (1-6)
 */
export function getCharacterStage(saveData, characterId) {
  // characterProgressが存在しない場合（古いセーブデータ対応）
  if (!saveData.characterProgress || !saveData.characterProgress[characterId]) {
    return 1;
  }
  return saveData.characterProgress[characterId].currentStage || 1;
}

/**
 * キャラクターのステージ進行度を更新
 * @param {Object} saveData - セーブデータ
 * @param {string} characterId - キャラクターID
 * @param {number} stage - ステージ番号 (1-6)
 * @returns {Object} 更新されたセーブデータ
 */
export function updateCharacterStage(saveData, characterId, stage) {
  // characterProgressが存在しない場合は初期化
  if (!saveData.characterProgress) {
    saveData.characterProgress = {
      airi: { currentStage: 1, clearedStages: [] },
      kaho: { currentStage: 1, clearedStages: [] },
      mitsuki: { currentStage: 1, clearedStages: [] },
      misaki: { currentStage: 1, clearedStages: [] }
    };
  }

  if (saveData.characterProgress[characterId]) {
    // 現在のステージを更新
    saveData.characterProgress[characterId].currentStage = stage;

    // クリア済みステージに追加（重複防止）
    if (stage > 1 && !saveData.characterProgress[characterId].clearedStages.includes(stage - 1)) {
      saveData.characterProgress[characterId].clearedStages.push(stage - 1);
    }

    saveSaveData(saveData);
  }

  return saveData;
}

/**
 * キャラクターのステージをリセット（ステージ1に戻す）
 * @param {Object} saveData - セーブデータ
 * @param {string} characterId - キャラクターID
 * @returns {Object} 更新されたセーブデータ
 */
export function resetCharacterStage(saveData, characterId) {
  if (saveData.characterProgress && saveData.characterProgress[characterId]) {
    saveData.characterProgress[characterId].currentStage = 1;
    saveData.characterProgress[characterId].clearedStages = [];
    saveSaveData(saveData);
  }
  return saveData;
}

/**
 * キャラクターが解放されているかチェック
 * @param {Object} saveData - セーブデータ
 * @param {string} characterId - キャラクターID
 * @returns {boolean} 解放済みならtrue
 */
export function isCharacterUnlocked(saveData, characterId) {
  // unlockedCharactersが存在しない場合（古いセーブデータ対応）
  if (!saveData.unlockedCharacters) {
    return characterId === 'airi'; // デフォルトで愛莉のみ解放
  }
  return saveData.unlockedCharacters.includes(characterId);
}

/**
 * 次のキャラクターを解放
 * @param {Object} saveData - セーブデータ
 * @param {string} currentCharacterId - 現在のキャラクターID
 * @returns {Object} 更新されたセーブデータ
 */
export function unlockNextCharacter(saveData, currentCharacterId) {
  // unlockedCharactersが存在しない場合は初期化
  if (!saveData.unlockedCharacters) {
    saveData.unlockedCharacters = ['airi'];
  }

  // キャラクター解放順序: airi → kaho → mitsuki → misaki
  const unlockOrder = {
    airi: 'kaho',
    kaho: 'mitsuki',
    mitsuki: 'misaki',
    misaki: null // 美咲の次はなし
  };

  const nextCharacter = unlockOrder[currentCharacterId];

  if (nextCharacter && !saveData.unlockedCharacters.includes(nextCharacter)) {
    saveData.unlockedCharacters.push(nextCharacter);
    console.log(`次のキャラクター解放: ${nextCharacter}`);
    saveSaveData(saveData);
  }

  return saveData;
}

/**
 * キャラクターの全ステージをクリアしたかチェック
 * @param {Object} saveData - セーブデータ
 * @param {string} characterId - キャラクターID
 * @param {number} maxStage - 最大ステージ数（デフォルト: 6、美咲のみ4）
 * @returns {boolean} 全ステージクリア済みならtrue
 */
export function isCharacterFullyCleared(saveData, characterId, maxStage = 6) {
  if (!saveData.characterProgress || !saveData.characterProgress[characterId]) {
    return false;
  }

  const progress = saveData.characterProgress[characterId];

  // 美咲は4ステージのみ（BADエンド用）
  const targetMaxStage = characterId === 'misaki' ? 4 : maxStage;

  // clearedStagesに全ステージが含まれているかチェック
  return progress.clearedStages.length >= targetMaxStage;
}
