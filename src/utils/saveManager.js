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
    unlockedRewards: [],
    currentScene: 'title',
    currentProgress: {
      characterId: null,
      dialogueId: null
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
