import React, { useRef, useEffect, useState } from 'react';
import './RewardScene.css';
import { unlockReward } from '../utils/saveManager';

function RewardScene({ selectedCharacter, currentStage, gameData, saveData, onStageComplete }) {
  const videoRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const characterNames = {
    airi: '星野 愛莉',
    kaho: '田中 夏帆',
    mitsuki: '佐藤 美月',
    misaki: '山本 美咲'
  };

  const characterName = characterNames[selectedCharacter] || '星野 愛莉';

  // 現在のステージのご褒美を取得
  const currentReward = gameData?.rewards?.find(
    r => r.character_id === selectedCharacter && parseInt(r.stage) === currentStage
  ) || null;

  // 報酬解放（マウント時に実行）
  useEffect(() => {
    if (currentReward && saveData) {
      unlockReward(saveData, currentReward.asset_id);
      console.log(`報酬解放: ${currentReward.asset_id} (ステージ ${currentStage})`);
    }
  }, [currentReward, saveData, currentStage]);

  // 動画自動再生
  useEffect(() => {
    if (videoRef.current && currentReward?.reward_type === 'video') {
      videoRef.current.play().catch(err => {
        console.warn('動画の自動再生が失敗しました:', err);
      });
    }
  }, [currentReward]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // 次のステージへ進む
  const handleNext = () => {
    const nextDialogueId = currentReward?.next_dialogue_id;

    if (nextDialogueId === 'complete') {
      // 全ステージクリア（ステージ6完了）
      console.log(`${selectedCharacter} 全ステージクリア！`);
      onStageComplete(null); // nullを渡すとApp.jsxがタイトルへ遷移
    } else if (nextDialogueId === 'bad_end') {
      // BADエンド（美咲ルート）
      console.log('BAD END triggered');
      alert('GAME OVER\n\n調子に乗りすぎた代償を払うことになった...\n\nタイトルに戻ります。');
      onStageComplete(null); // タイトルへ遷移
    } else {
      // 次のステージへ
      onStageComplete(nextDialogueId);
    }
  };

  if (!currentReward) {
    return (
      <div className="reward-scene">
        <div className="reward-content">
          <div className="message-container">
            <h1 className="congratulations">おめでとうございます！</h1>
            <p className="reward-text">パズルをクリアしました！</p>
            <p className="error-text">ステージ {currentStage} のご褒美データが見つかりません</p>
            <button className="continue-button" onClick={() => onStageComplete(null)}>
              ▶ タイトルに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPlaceholder = currentReward.is_placeholder === 'true';

  return (
    <div className="reward-scene">
      <div className="reward-bg"></div>

      <div className="reward-content">
        {/* セクション1: 動画/画像フレーム */}
        <div className="reward-media-section">
          <div className="reward-image-container">
            {isPlaceholder && (
              <div className="placeholder-overlay">
                <div className="placeholder-label">
                  <p>🎨 仮素材（PLACEHOLDER）</p>
                  <p className="placeholder-note">
                    {currentReward.reward_type === 'video' ? '動画' : '画像'}ファイルを配置してください
                  </p>
                  <p className="placeholder-path">{currentReward.file_path}</p>
                </div>
              </div>
            )}

            {currentReward.reward_type === 'video' ? (
              <video
                ref={videoRef}
                className="reward-video"
                controls
                loop
                muted
                playsInline
                key={currentReward.reward_id}
                onClick={() => setIsModalOpen(true)}
                style={{ cursor: 'pointer' }}
              >
                <source src={currentReward.file_path} type="video/mp4" />
                お使いのブラウザは動画タグをサポートしていません。
              </video>
            ) : (
              <img
                className="reward-image"
                src={currentReward.file_path}
                alt={currentReward.title}
                onClick={() => setIsModalOpen(true)}
                style={{ cursor: 'pointer' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            )}

            {/* 画像読込失敗時の代替表示 */}
            {currentReward.reward_type === 'image' && (
              <div className="image-placeholder" style={{ display: 'none' }}>
                <p>📷</p>
                <p>{currentReward.title}</p>
              </div>
            )}
          </div>
        </div>

        {/* セクション2: タイトル・説明 */}
        <div className="reward-info-section">
          <h1 className="sinister-title">
            {currentReward.sinister_phrase || `やった...{characterName}に入れ替わった...`}
          </h1>
          <p className="sinister-text">
            彼女は意識を失っている...
            <br />
            今なら何でもできる...
          </p>

          {/* 進行状況 */}
          <div className="reward-progress">
            <p>ステージ {currentStage} / {selectedCharacter === 'misaki' ? '4' : '6'}</p>
          </div>

          <h2 className="reward-title">{currentReward.title}</h2>
          <p className="reward-text">{currentReward.description}</p>
        </div>

        {/* セクション3: プレイヤーリアクション */}
        {currentReward.player_reaction && (
          <div className="reward-reaction-section">
            <div className="player-reaction">
              <p className="reaction-label">🔄 入れ替わった瞬間...</p>
              <p className="reaction-text">{currentReward.player_reaction}</p>
            </div>
          </div>
        )}

        {/* ボタンセクション */}
        <div className="reward-info-section">
          <button className="continue-button" onClick={handleNext}>
            {(selectedCharacter === 'misaki' && currentStage >= 4) || (selectedCharacter !== 'misaki' && currentStage >= 6)
              ? '▶ 完結編へ'
              : `▶ ステージ ${currentStage + 1} へ進む`}
          </button>

          {((selectedCharacter === 'misaki' && currentStage === 4) || (selectedCharacter !== 'misaki' && currentStage === 6)) && (
            <div className="demo-end-notice">
              <p>--- {characterName} ルート{currentReward?.next_dialogue_id === 'bad_end' ? 'BAD END' : '完結'} ---</p>
              {currentReward?.next_dialogue_id !== 'bad_end' && <p>おめでとうございます！</p>}
            </div>
          )}
        </div>
      </div>

      {/* モーダル（動画拡大表示） */}
      {isModalOpen && (
        <div className="video-modal" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            {currentReward.reward_type === 'video' ? (
              <video
                className="modal-video"
                controls
                autoPlay
                loop
                key={`modal-${currentReward.reward_id}`}
              >
                <source src={currentReward.file_path} type="video/mp4" />
              </video>
            ) : (
              <img
                className="modal-image"
                src={currentReward.file_path}
                alt={currentReward.title}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RewardScene;
