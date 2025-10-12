import React, { useState, useRef, useEffect } from 'react';
import './RewardScene.css';

function RewardScene({ selectedCharacter, gameData, onComplete }) {
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);
  const videoRef = useRef(null);

  const characterNames = {
    airi: '星野 愛莉',
    kaho: '田中 夏帆',
    mitsuki: '佐藤 美月',
    misaki: '山本 美咲'
  };

  const characterName = characterNames[selectedCharacter] || '星野 愛莉';

  // キャラクター別のご褒美を取得
  const characterRewards = gameData?.rewards?.filter(
    r => r.character_id === selectedCharacter
  ) || [];

  const currentReward = characterRewards[currentRewardIndex];
  const totalRewards = characterRewards.length;

  // 動画自動再生
  useEffect(() => {
    if (videoRef.current && currentReward?.reward_type === 'video') {
      videoRef.current.play().catch(err => {
        console.warn('動画の自動再生が失敗しました:', err);
      });
    }
  }, [currentReward]);

  // 次のご褒美へ進む
  const handleNext = () => {
    if (currentRewardIndex < totalRewards - 1) {
      setCurrentRewardIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (!currentReward) {
    return (
      <div className="reward-scene">
        <div className="reward-content">
          <div className="message-container">
            <h1 className="congratulations">おめでとうございます！</h1>
            <p className="reward-text">パズルをクリアしました！</p>
            <p className="error-text">ご褒美データが見つかりません</p>
            <button className="continue-button" onClick={onComplete}>
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
        <div className="message-container fade-in">
          <h1 className="congratulations">おめでとうございます！</h1>
          <p className="reward-text">
            パズルをクリアしました！
            <br />
            {characterName}と30分間入れ替わります...
          </p>

          {/* 進行状況 */}
          <div className="reward-progress">
            <p>ご褒美 {currentRewardIndex + 1} / {totalRewards}</p>
          </div>

          {/* ご褒美コンテンツ */}
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
              >
                <source src={currentReward.file_path} type="video/mp4" />
                お使いのブラウザは動画タグをサポートしていません。
              </video>
            ) : (
              <img
                className="reward-image"
                src={currentReward.file_path}
                alt={currentReward.title}
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

          <div className="reward-description">
            <h2 className="reward-title">{currentReward.title}</h2>
            <p>{currentReward.description}</p>
            <p className="reward-character-note">{characterName}の視点で30分間の秘密体験...</p>
            <ul>
              <li>✨ 鏡で自分（{characterName}）を確認</li>
              <li>✨ 部屋の中を探索</li>
              <li>✨ 彼女の秘密を知る</li>
              <li>✨ 不思議な体験を満喫</li>
            </ul>
          </div>

          <button className="continue-button" onClick={handleNext}>
            {currentRewardIndex < totalRewards - 1
              ? '▶ 次のご褒美へ'
              : '▶ タイトルに戻る'}
          </button>

          {currentRewardIndex === totalRewards - 1 && (
            <div className="demo-end-notice">
              <p>--- DEMO END ---</p>
              <p>続きは製品版で！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RewardScene;
