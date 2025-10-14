/**
 * BGM・効果音管理システム
 * CSV定義に基づいて音声ファイルを再生
 */

class AudioManager {
  constructor() {
    this.bgm = null; // 現在再生中のBGM
    this.currentSE = null; // 現在再生中の効果音（ループ用）
    this.bgmVolume = 0.5; // BGM音量（0.0～1.0）
    this.seVolume = 0.7; // 効果音音量（0.0～1.0）
    this.isMuted = false; // ミュート状態
  }

  /**
   * BGMを再生
   * @param {string} filePath - BGMファイルパス
   * @param {boolean} loop - ループ再生するか（デフォルト: true）
   */
  playBGM(filePath, loop = true) {
    if (!filePath) return;

    // 既存のBGMを停止
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }

    try {
      this.bgm = new Audio(filePath);
      this.bgm.loop = loop;
      this.bgm.volume = this.isMuted ? 0 : this.bgmVolume;

      this.bgm.play().catch(err => {
        console.warn('BGM再生エラー:', err);
      });

      console.log('🎵 BGM再生:', filePath);
    } catch (error) {
      console.error('BGM読み込みエラー:', error);
    }
  }

  /**
   * BGMを停止
   */
  stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
      console.log('⏹️ BGM停止');
    }
  }

  /**
   * BGMをフェードアウト
   * @param {number} duration - フェードアウト時間（ミリ秒）
   */
  fadeOutBGM(duration = 1000) {
    if (!this.bgm) return;

    const step = 50; // フェードステップ（ms）
    const volumeStep = (this.bgm.volume / duration) * step;

    const fadeInterval = setInterval(() => {
      if (this.bgm.volume > volumeStep) {
        this.bgm.volume -= volumeStep;
      } else {
        this.bgm.volume = 0;
        this.stopBGM();
        clearInterval(fadeInterval);
      }
    }, step);
  }

  /**
   * 効果音を再生
   * @param {string} filePath - 効果音ファイルパス
   * @param {boolean} loop - ループ再生するか（デフォルト: false）
   * @param {number} volume - 音量（0.0～1.0、nullの場合はデフォルト音量）
   * @returns {Audio} Audio オブジェクト（ループ再生時の停止用）
   */
  playSE(filePath, loop = false, volume = null) {
    if (!filePath) return null;

    try {
      const se = new Audio(filePath);
      se.loop = loop;
      se.volume = volume !== null ? volume : (this.isMuted ? 0 : this.seVolume);

      se.play().catch(err => {
        console.warn('効果音再生エラー:', err);
      });

      // ループ再生の場合は保持
      if (loop) {
        this.currentSE = se;
      }

      console.log('🔊 効果音再生:', filePath, loop ? '(ループ)' : '');
      return se;
    } catch (error) {
      console.error('効果音読み込みエラー:', error);
      return null;
    }
  }

  /**
   * 現在再生中の効果音を停止
   */
  stopSE() {
    if (this.currentSE) {
      this.currentSE.pause();
      this.currentSE.currentTime = 0;
      this.currentSE = null;
      console.log('⏹️ 効果音停止');
    }
  }

  /**
   * BGM音量を設定
   * @param {number} volume - 音量（0.0～1.0）
   */
  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgm && !this.isMuted) {
      this.bgm.volume = this.bgmVolume;
    }
    console.log('🎵 BGM音量:', this.bgmVolume);
  }

  /**
   * 効果音音量を設定
   * @param {number} volume - 音量（0.0～1.0）
   */
  setSEVolume(volume) {
    this.seVolume = Math.max(0, Math.min(1, volume));
    console.log('🔊 効果音音量:', this.seVolume);
  }

  /**
   * ミュート切り替え
   */
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.bgm) {
      this.bgm.volume = this.isMuted ? 0 : this.bgmVolume;
    }

    console.log(this.isMuted ? '🔇 ミュート ON' : '🔊 ミュート OFF');
    return this.isMuted;
  }

  /**
   * すべての音声を停止
   */
  stopAll() {
    this.stopBGM();
    this.stopSE();
    console.log('🔇 全音声停止');
  }
}

// シングルトンインスタンス
const audioManager = new AudioManager();

export default audioManager;

/**
 * CSV定義からBGMを取得して再生
 * @param {Array} bgmList - bgm.csvのデータ
 * @param {string} bgmId - BGM ID
 */
export function playBGMById(bgmList, bgmId) {
  const bgm = bgmList?.find(b => b.bgm_id === bgmId);
  if (bgm) {
    audioManager.playBGM(bgm.file_path, bgm.loop === 'true');
  }
}

/**
 * CSV定義から効果音を取得して再生
 * @param {Array} seList - sound_effects.csvのデータ
 * @param {string} seId - 効果音 ID
 */
export function playSEById(seList, seId) {
  const se = seList?.find(s => s.se_id === seId);
  if (se) {
    audioManager.playSE(se.file_path);
  }
}
