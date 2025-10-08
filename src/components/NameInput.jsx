import React, { useState } from 'react';
import './NameInput.css';

function NameInput({ onSubmit, defaultName = '' }) {
  const [name, setName] = useState(defaultName);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    } else {
      alert('名前を入力してください');
    }
  };

  return (
    <div className="name-input-screen">
      <div className="name-input-bg"></div>

      <div className="name-input-content">
        <div className="name-input-box fade-in">
          <h1 className="name-input-title">あなたの名前を教えてください</h1>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                className="name-input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="名前を入力..."
                maxLength={20}
                autoFocus
              />
            </div>

            <div className="input-hint">
              ※ 半角・全角どちらでも入力できます（最大20文字）
            </div>

            <div className="button-group">
              <button type="submit" className="submit-button">
                ▶ 決定
              </button>
            </div>
          </form>

          {/* 簡易的なキャラクターイメージ */}
          <div className="character-preview">
            <div className="preview-character"></div>
            <p className="preview-text">「お名前、教えてくれる？」</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NameInput;
