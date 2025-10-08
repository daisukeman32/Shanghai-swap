import React, { useState } from 'react';
import './RewardScene.css';

function RewardScene({ onComplete }) {
  const [showMessage, setShowMessage] = useState(true);

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
              愛莉と30分間入れ替わります...
            </p>

            {/* 仮ご褒美画像（色付き四角形） */}
            <div className="reward-image-container">
              <div className="reward-image-dummy">
                <span className="reward-label">ご褒美画像</span>
                <p className="reward-note">（本番では画像・動画が表示されます）</p>
              </div>
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
