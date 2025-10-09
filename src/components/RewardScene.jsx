import React, { useState, useRef, useEffect } from 'react';
import './RewardScene.css';

function RewardScene({ selectedCharacter, onComplete }) {
  const [showMessage, setShowMessage] = useState(true);
  const videoRef = useRef(null);

  const characterNames = {
    airi: '愛莉',
    kaho: '夏帆',
    mitsuki: '美月'
  };

  const characterName = characterNames[selectedCharacter] || '愛莉';

  // 動画自動再生
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn('動画の自動再生が失敗しました:', err);
      });
    }
  }, []);

  return (
    <div className="reward-scene">
      <div className="reward-bg"></div>

      <div className="reward-content">
        {showMessage && (
          <div className="message-container fade-in">
            <h1 className="congratulations">おめでとうございます！</h1>
            <p className="reward-text">
              パズルをクリアしました！
              <br />
              {characterName}と30分間入れ替わります...
            </p>

            {/* ご褒美動画 */}
            <div className="reward-image-container">
              <video
                ref={videoRef}
                className="reward-video"
                controls
                loop
                muted
                playsInline
              >
                <source src="/assets/reward.mp4" type="video/mp4" />
                お使いのブラウザは動画タグをサポートしていません。
              </video>
            </div>

            <div className="reward-description">
              <p>愛莉の視点で30分間の秘密体験...</p>
              <ul>
                <li>✨ 鏡で自分（愛莉）を確認</li>
                <li>✨ 部屋の中を探索</li>
                <li>✨ 彼女の秘密を知る</li>
                <li>✨ 不思議な体験を満喫</li>
              </ul>
            </div>

            <button className="continue-button" onClick={onComplete}>
              ▶ タイトルに戻る
            </button>

            <div className="demo-end-notice">
              <p>--- DEMO END ---</p>
              <p>続きは製品版で！</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RewardScene;
