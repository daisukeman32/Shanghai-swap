import React, { useRef, useEffect, useState } from 'react';
import './Match3Puzzle.css';

/**
 * Match-3 Puzzle Game (Candy Crush風)
 * Based on: rembound/Match-3-Game-HTML5 (GPL v3)
 * Customized for: Shanghai-swap game
 */

// 🎨 背景画像選択（ABテスト用）
// 'キャラ背景1.png' - カラフルで派手、強い催眠効果
// 'キャラ背景2.png' - 青～ピンク系、落ち着いた色合い、キャラクターが見やすい
const CHARACTER_BG = 'キャラ背景2.png'; // ← ここを変更するだけで背景切り替え可能

function Match3Puzzle({ onClear, onGameOver, stage = 1, selectedCharacter = 'airi', saveData, updateSaveData, onResetToStage1 }) {
  const canvasRef = useRef(null);

  // バトル用ステート
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(80);
  const [playerMaxHP] = useState(100);
  const [enemyMaxHP, setEnemyMaxHP] = useState(80);
  const [defenseBonus, setDefenseBonus] = useState(0); // 防御バフ（%）
  const [defenseTurns, setDefenseTurns] = useState(0); // 防御持続ターン数
  const [playerUltimateGauge, setPlayerUltimateGauge] = useState(0); // プレイヤー必殺技ゲージ（0-100）
  const [enemyUltimateGauge, setEnemyUltimateGauge] = useState(0); // 敵必殺技ゲージ（0-100）
  const [turnCount, setTurnCount] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false); // ゲームオーバーダイアログ表示

  const gameStateRef = useRef({
    level: {
      x: 47,  // 左右バランス良く配置
      y: 360,  // 200 → 360 (立ち絵エリア160px追加)
      columns: 7,
      rows: 5,
      tilewidth: 65,  // 少し小さめ: 65px × 7 = 455px
      tileheight: 65,  // 正方形に
      tiles: [],
      selectedtile: { selected: false, column: 0, row: 0 }
    },
    tilecolors: [
      [255, 140, 80],   // 👊 オレンジ（パンチ・攻撃）
      [100, 180, 255],  // 📱 青（スマホ・防御）
      [255, 100, 150],  // ❤️ ピンク（ハート・回復）
      [255, 68, 68]     // 💣 赤（爆弾・お邪魔）
    ],
    characters: [
      { name: '攻撃', initial: '👊', description: '相手にダメージ' },
      { name: '防御', initial: '🛡️', description: '防御バフ' },
      { name: '回復', initial: '❤️', description: 'HP回復' },
      { name: 'お邪魔', initial: '💣', description: '自分にダメージ' }
    ],
    clusters: [],
    moves: [],
    currentmove: { column1: 0, row1: 0, column2: 0, row2: 0 },
    lastSwappedTile: { column: -1, row: -1 }, // 最後にスワップで動かしたタイルの位置
    lastSwapDirection: 'horizontal', // 最後のスワップ方向 ('horizontal' or 'vertical')
    gamestates: { init: 0, ready: 1, resolve: 2, enemyTurn: 3 },
    gamestate: 0,
    playerHP: 100,
    playerMaxHP: 100,
    enemyHP: 80,
    enemyMaxHP: 80,
    defenseBonus: 0,
    defenseTurns: 0,
    playerUltimateGauge: 0,
    enemyUltimateGauge: 0,
    turnCount: 0,
    animationstate: 0,
    animationtime: 0,
    animationtimetotal: 0.3,  // 0.6秒 → 0.3秒（2倍速）
    drag: false,
    gameover: false,
    cleared: false,
    isShuffling: false,
    particles: [],
    specialEffects: [],
    screenShake: { active: false, intensity: 0, duration: 0 },
    battleLog: [],
    // キャラクター画像
    playerImage: null,
    enemyImage: null,
    characterBgImage: null, // キャラ背景画像
    imagesLoaded: false,
    // タイルアイコン画像
    tileImages: {
      attack: null,
      defense: null,
      heal: null,
      trap: null,
      orb: null,
      vertical: null,
      horizontal: null
    },
    tileImagesLoaded: false
  });

  // キャラクター画像とタイルアイコン画像の読み込み
  useEffect(() => {
    const game = gameStateRef.current;
    let loadedCount = 0;
    const totalImages = 10; // 主人公 + 相手キャラ + キャラ背景 + タイル7種

    // 主人公の画像（500×500の正方形画像）
    const playerImg = new Image();
    playerImg.src = '/assets/characters/player_portrait.png';
    playerImg.onload = () => {
      game.playerImage = playerImg;
      loadedCount++;
      checkImagesLoaded();
    };
    playerImg.onerror = () => {
      // フォールバック: protagonist フォルダの画像を試す
      console.warn('主人公 player_portrait 画像がないため protagonist にフォールバック');
      const fallbackImg = new Image();
      fallbackImg.src = '/assets/characters/protagonist/protagonist_default.png';
      fallbackImg.onload = () => {
        game.playerImage = fallbackImg;
        loadedCount++;
        checkImagesLoaded();
      };
      fallbackImg.onerror = () => {
        console.warn('主人公画像の読み込み失敗');
        loadedCount++;
        checkImagesLoaded();
      };
    };

    // 相手キャラの画像（battle.png を優先、なければ portrait.png）
    const enemyImg = new Image();
    enemyImg.src = `/assets/characters/${selectedCharacter}/${selectedCharacter}_battle.png`;
    enemyImg.onload = () => {
      game.enemyImage = enemyImg;
      loadedCount++;
      checkImagesLoaded();
    };
    enemyImg.onerror = () => {
      // battle.png がない場合は portrait.png にフォールバック
      console.warn('相手キャラ battle 画像がないため portrait にフォールバック');
      const fallbackImg = new Image();
      fallbackImg.src = `/assets/characters/${selectedCharacter}/${selectedCharacter}_portrait.png`;
      fallbackImg.onload = () => {
        game.enemyImage = fallbackImg;
        loadedCount++;
        checkImagesLoaded();
      };
      fallbackImg.onerror = () => {
        console.warn('相手キャラ portrait 画像の読み込みも失敗');
        loadedCount++;
        checkImagesLoaded();
      };
    };

    // キャラ背景画像の読み込み（ABテスト対応）
    const characterBgImg = new Image();
    characterBgImg.src = `/assets/ui/${CHARACTER_BG}`;
    characterBgImg.onload = () => {
      game.characterBgImage = characterBgImg;
      loadedCount++;
      checkImagesLoaded();
      console.log(`✅ キャラ背景読み込み: ${CHARACTER_BG}`);
    };
    characterBgImg.onerror = () => {
      console.warn(`キャラ背景画像の読み込み失敗: ${CHARACTER_BG}`);
      loadedCount++;
      checkImagesLoaded();
    };

    // タイルアイコン画像の読み込み
    const tileImagePaths = {
      attack: '/assets/tiles/attack.png',
      defense: '/assets/tiles/defense.png',
      heal: '/assets/tiles/heal.png',
      trap: '/assets/tiles/trap.png',
      orb: '/assets/tiles/orb.png',
      vertical: '/assets/tiles/vertical.png',
      horizontal: '/assets/tiles/horizontal.png'
    };

    Object.keys(tileImagePaths).forEach(key => {
      const img = new Image();
      img.src = tileImagePaths[key];
      img.onload = () => {
        game.tileImages[key] = img;
        loadedCount++;
        checkImagesLoaded();
      };
      img.onerror = () => {
        console.warn(`タイル画像の読み込み失敗: ${key}`);
        loadedCount++;
        checkImagesLoaded();
      };
    });

    function checkImagesLoaded() {
      if (loadedCount >= totalImages) {
        game.imagesLoaded = true;
        game.tileImagesLoaded = true;
        console.log('全ての画像読み込み完了');
      }
    }
  }, [selectedCharacter]);

  useEffect(() => {
    // ステージごとの敵HP設定
    const stageDifficulty = {
      1: { enemyHP: 80, enemyAttack: 10 },
      2: { enemyHP: 100, enemyAttack: 15 },
      3: { enemyHP: 120, enemyAttack: 20 },
      4: { enemyHP: 140, enemyAttack: 25 },
      5: { enemyHP: 160, enemyAttack: 30 },
      6: { enemyHP: 180, enemyAttack: 35 }
    };

    const difficulty = stageDifficulty[Math.min(stage, 6)] || stageDifficulty[1];
    setEnemyHP(difficulty.enemyHP);
    setEnemyMaxHP(difficulty.enemyHP);
    gameStateRef.current.enemyHP = difficulty.enemyHP;
    gameStateRef.current.enemyMaxHP = difficulty.enemyHP;
    gameStateRef.current.enemyAttack = difficulty.enemyAttack;

    console.log(`Stage ${stage} 敵HP: ${difficulty.enemyHP}, 攻撃力: ${difficulty.enemyAttack}`);
  }, [stage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High DPI対応：解像度を上げてぼやけを防ぐ
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = 550;
    const displayHeight = 700;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(dpr, dpr);

    const game = gameStateRef.current;
    let lastframe = 0;
    let animationId;

    // 初期化
    const init = () => {
      // タイル配列初期化
      for (let i = 0; i < game.level.columns; i++) {
        game.level.tiles[i] = [];
        for (let j = 0; j < game.level.rows; j++) {
          game.level.tiles[i][j] = { type: 0, shift: 0, special: null, specialDirection: null };
        }
      }

      // 新しいゲーム開始
      newGame();

      // マウスイベント設定
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('mouseout', onMouseOut);

      // メインループ開始
      animationId = requestAnimationFrame(mainLoop);
    };

    // メインループ
    const mainLoop = (tframe) => {
      const dt = (tframe - lastframe) / 1000;
      lastframe = tframe;

      update(dt);
      render(context);

      animationId = requestAnimationFrame(mainLoop);
    };

    // ゲーム状態更新
    const update = (dt) => {
      // パーティクル更新
      game.particles = game.particles.filter(p => {
        p.life -= dt;
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.vy += p.gravity * dt * 60;
        p.alpha = Math.max(0, p.life / p.maxLife);
        return p.life > 0;
      });

      // 特殊エフェクト更新（終了時にコールバック実行）
      game.specialEffects = game.specialEffects.filter(e => {
        e.time += dt;
        const isFinished = e.time >= e.duration;

        // エフェクト終了時に遅延実行アクションを実行
        if (isFinished && e.onComplete && !e.completedExecuted) {
          e.completedExecuted = true;
          e.onComplete();
        }

        return !isFinished;
      });

      // 画面揺れ更新
      if (game.screenShake.active) {
        game.screenShake.duration -= dt;
        if (game.screenShake.duration <= 0) {
          game.screenShake.active = false;
        }
      }

      if (game.gamestate === game.gamestates.ready) {
        // 手詰まりチェック
        if (game.moves.length === 0 && !game.isShuffling) {
          game.isShuffling = true;
          console.log('⚠ 手詰まり検出！シャッフルします...');

          // 10%ダメージ（半減調整）
          const deadlockDamage = Math.floor(game.playerMaxHP * 0.1);
          game.playerHP = Math.max(0, game.playerHP - deadlockDamage);
          setPlayerHP(game.playerHP);
          console.log(`💀 手詰まりペナルティ: ${deadlockDamage}ダメージ！`);

          // 画面揺れ
          game.screenShake.active = true;
          game.screenShake.intensity = 15;
          game.screenShake.duration = 0.5;

          // シャッフル実行（少し遅延）
          setTimeout(() => {
            reshuffleBoard();
            game.isShuffling = false;
          }, 600);
        }

        // ゲームオーバーチェック（プレイヤーHP0以下）
        if (game.playerHP <= 0 && !game.gameover) {
          game.gameover = true;
          setTimeout(() => setShowGameOverDialog(true), 1500);
        }

        // クリアチェック（相手HP0以下）
        if (game.enemyHP <= 0 && !game.cleared) {
          game.cleared = true;
          setTimeout(() => onClear(), 1500);
        }
      } else if (game.gamestate === game.gamestates.resolve) {
        game.animationtime += dt;

        if (game.animationstate === 0) {
          // クラスター検出
          if (game.animationtime > game.animationtimetotal) {
            findClusters();

            if (game.clusters.length > 0) {
              // 色ごとのバトル効果を適用
              applyBattleEffects();

              removeClusters();
              game.animationstate = 1;
            } else {
              // クラスターがなければ相手のターンへ
              game.gamestate = game.gamestates.enemyTurn;
              setTimeout(() => {
                enemyAttack();
                game.gamestate = game.gamestates.ready;
              }, 1000);
            }
            game.animationtime = 0;
          }
        } else if (game.animationstate === 1) {
          // タイルシフト
          if (game.animationtime > game.animationtimetotal) {
            shiftTiles();
            game.animationstate = 0;
            game.animationtime = 0;

            findClusters();
            if (game.clusters.length <= 0) {
              // 連鎖終了 → 相手のターンへ
              game.gamestate = game.gamestates.enemyTurn;
              setTimeout(() => {
                enemyAttack();
                game.gamestate = game.gamestates.ready;
              }, 1000);
            }
          }
        } else if (game.animationstate === 2) {
          // スワップアニメーション
          if (game.animationtime > game.animationtimetotal) {
            swap(game.currentmove.column1, game.currentmove.row1,
                 game.currentmove.column2, game.currentmove.row2);

            findClusters();
            if (game.clusters.length > 0) {
              game.animationstate = 0;
              game.animationtime = 0;
              game.gamestate = game.gamestates.resolve;
            } else {
              game.animationstate = 3;
              game.animationtime = 0;
            }

            findMoves();
            findClusters();
          }
        } else if (game.animationstate === 3) {
          // 無効なスワップを戻す
          if (game.animationtime > game.animationtimetotal) {
            swap(game.currentmove.column1, game.currentmove.row1,
                 game.currentmove.column2, game.currentmove.row2);
            game.gamestate = game.gamestates.ready;
          }
        }

        findMoves();
        findClusters();
      }
    };

    // 描画
    const render = (ctx) => {
      // 論理サイズ（表示サイズ）
      const logicalWidth = 550;
      const logicalHeight = 700;
      const headerHeight = 175; // ヘッダー高さ縮小（ステータスゲージを少し上に）

      // 背景（ダークテーマ）
      ctx.fillStyle = '#1a0a0a';
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // ヘッダー
      ctx.fillStyle = '#2d1b1b';
      ctx.fillRect(0, 0, logicalWidth, headerHeight);

      // 【左側】相手キャラクター表示
      const enemyPortraitX = 70;
      const enemyPortraitY = 115;
      const portraitRadius = 40;

      drawCharacterPortrait(ctx, enemyPortraitX, enemyPortraitY, portraitRadius, game.enemyImage, '#ff4444', '相手');

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('相手', 120, 85);

      // 相手HPバー
      drawHPBar(ctx, 120, 100, 150, 18, game.enemyHP, game.enemyMaxHP, '#ff4444');

      // 相手必殺技ゲージ
      ctx.fillStyle = '#ffdd44';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('★必殺', 120, 135);
      drawGaugeBar(ctx, 120, 140, 150, 16, game.enemyUltimateGauge, 100, '#ffdd44');

      // 【右側】プレイヤーキャラクター表示
      const playerPortraitX = logicalWidth - 70;
      const playerPortraitY = 115;

      drawCharacterPortrait(ctx, playerPortraitX, playerPortraitY, portraitRadius, game.playerImage, '#44ff44', 'あなた');

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('あなた', logicalWidth - 120, 85);
      ctx.textAlign = 'left';

      // プレイヤーHPバー
      drawHPBar(ctx, logicalWidth - 270, 100, 150, 18, game.playerHP, game.playerMaxHP, '#44ff44');

      // プレイヤー必殺技ゲージ
      ctx.fillStyle = '#ffdd44';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('★必殺', logicalWidth - 120, 135);
      ctx.textAlign = 'left';
      drawGaugeBar(ctx, logicalWidth - 270, 140, 150, 16, game.playerUltimateGauge, 100, '#44ff44');

      // ステータス・警告表示（少し上に移動）
      const statusY = 170;
      ctx.textAlign = 'center';

      // 敵必殺技警告（80%以上）
      if (game.enemyUltimateGauge >= 80) {
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 18px sans-serif';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillText('⚠ 敵必殺技まもなく！ ⚠', logicalWidth / 2, statusY);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      } else if (game.defenseBonus > 0 && game.defenseTurns > 0) {
        ctx.fillStyle = '#44ccff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`🛡️ 防御: ${Math.floor(game.defenseBonus)}%軽減（残り${game.defenseTurns}ターン）`, logicalWidth / 2, statusY);
      }

      // 戦闘ログ（実況）表示 - 必殺技ゲージの下
      const battleLogY = statusY + 20;
      const currentTime = Date.now();

      // 2秒以内の最新ログを表示
      const recentLogs = game.battleLog.filter(log => currentTime - log.timestamp < 2000);

      if (recentLogs.length > 0) {
        const latestLog = recentLogs[recentLogs.length - 1];
        const logAge = currentTime - latestLog.timestamp;
        const opacity = Math.max(0, 1 - (logAge / 2000)); // 2秒でフェードアウト

        ctx.globalAlpha = opacity;
        ctx.font = 'bold 14px sans-serif';

        // 白いフチ（袋文字）
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeText(latestLog.message, logicalWidth / 2, battleLogY);

        // メッセージ本体
        ctx.fillStyle = latestLog.color || '#ffff00';
        ctx.fillText(latestLog.message, logicalWidth / 2, battleLogY);

        ctx.globalAlpha = 1.0;
      }

      ctx.textAlign = 'left';

      // 【立ち絵エリア】190px - 350px
      const portraitAreaY = headerHeight;
      const portraitAreaHeight = 160;

      // 立ち絵背景
      ctx.fillStyle = '#1a0a0a';
      ctx.fillRect(0, portraitAreaY, logicalWidth, portraitAreaHeight);

      // 区切り線
      ctx.strokeStyle = '#4a3a3a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, portraitAreaY);
      ctx.lineTo(logicalWidth, portraitAreaY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, portraitAreaY + portraitAreaHeight);
      ctx.lineTo(logicalWidth, portraitAreaY + portraitAreaHeight);
      ctx.stroke();

      // 立ち絵描画（左: プレイヤー、右: 相手）- 500×500正方形
      const portraitHeight = portraitAreaHeight; // エリアいっぱいに表示
      const portraitWidth = portraitHeight; // 縦横比 1:1（正方形）

      // プレイヤー立ち絵は削除（中央に敵キャラのみ表示）

      // 背景画像を立ち絵エリア全体に描画（催眠感を出すサイケデリック背景）
      if (game.characterBgImage && game.characterBgImage.complete) {
        ctx.drawImage(
          game.characterBgImage,
          0, portraitAreaY, logicalWidth, portraitAreaHeight // 立ち絵エリア全体
        );
      }

      // 相手立ち絵（中央に大きく表示）- 500×500の正方形画像
      if (game.enemyImage && game.enemyImage.complete) {
        // 中央配置（エリアいっぱい）
        const enemyX = (logicalWidth - portraitWidth) / 2;
        const enemyY = portraitAreaY;

        ctx.save();
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 20;
        // 500×500の画像をアスペクト比を保ったまま表示
        ctx.drawImage(
          game.enemyImage,
          enemyX, enemyY, portraitWidth, portraitHeight
        );
        ctx.restore();

        // 枠線は削除（臨場感を出すため）
      }

      // VS表示は削除（中央に敵キャラが表示されるため不要）
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';

      // 画面揺れ適用
      if (game.screenShake.active) {
        const shakeX = (Math.random() - 0.5) * game.screenShake.intensity;
        const shakeY = (Math.random() - 0.5) * game.screenShake.intensity;
        ctx.save();
        ctx.translate(shakeX, shakeY);
      }

      // レベル背景
      const levelwidth = game.level.columns * game.level.tilewidth;
      const levelheight = game.level.rows * game.level.tileheight;
      ctx.fillStyle = '#000000';
      ctx.fillRect(game.level.x - 4, game.level.y - 4, levelwidth + 8, levelheight + 8);

      // 特殊エフェクト描画（背景）
      renderSpecialEffects(ctx);

      // タイル描画
      renderTiles(ctx);

      // クラスター描画
      renderClusters(ctx);

      // パーティクル描画
      renderParticles(ctx);

      // 画面揺れリセット
      if (game.screenShake.active) {
        ctx.restore();
      }

      // 手詰まり表示
      if (game.isShuffling) {
        ctx.fillStyle = 'rgba(255, 140, 0, 0.85)';
        ctx.fillRect(game.level.x, game.level.y, levelwidth, levelheight);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff8c00';
        ctx.font = 'bold 28px sans-serif';
        ctx.shadowColor = '#ff8c00';
        ctx.shadowBlur = 10;
        ctx.fillText('⚠ 手詰まり！', game.level.x + levelwidth / 2, game.level.y + levelheight / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fillText('盤面をシャッフルします...', game.level.x + levelwidth / 2, game.level.y + levelheight / 2 + 20);
        ctx.textAlign = 'left';
      }

      // ゲームオーバー/クリア表示
      if (game.gameover) {
        ctx.fillStyle = 'rgba(139, 0, 0, 0.9)';
        ctx.fillRect(game.level.x, game.level.y, levelwidth, levelheight);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('敗北...', game.level.x + levelwidth / 2, game.level.y + levelheight / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.fillText('意識を奪われた...', game.level.x + levelwidth / 2, game.level.y + levelheight / 2 + 20);
        ctx.textAlign = 'left';
      }

      if (game.cleared) {
        ctx.fillStyle = 'rgba(0, 100, 0, 0.85)';
        ctx.fillRect(game.level.x, game.level.y, levelwidth, levelheight);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('勝利！', game.level.x + levelwidth / 2, game.level.y + levelheight / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.fillText('入れ替わりに成功した...', game.level.x + levelwidth / 2, game.level.y + levelheight / 2 + 20);
        ctx.textAlign = 'left';
      }

      // 効果説明は削除（レイアウト優先）
    };

    // タイル描画
    const renderTiles = (ctx) => {
      for (let i = 0; i < game.level.columns; i++) {
        for (let j = 0; j < game.level.rows; j++) {
          const shift = game.level.tiles[i][j].shift;
          const coord = getTileCoordinate(i, j, 0, (game.animationtime / game.animationtimetotal) * shift);

          if (game.level.tiles[i][j].type >= 0) {
            const tileType = game.level.tiles[i][j].type;
            const col = game.tilecolors[tileType];
            const special = game.level.tiles[i][j].special;
            drawTile(ctx, coord.tilex, coord.tiley, col[0], col[1], col[2], tileType, special);
          }

          // 選択タイルの光る枠線
          if (game.level.selectedtile.selected) {
            if (game.level.selectedtile.column === i && game.level.selectedtile.row === j) {
              ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
              ctx.shadowBlur = 15;
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
              ctx.lineWidth = 3;
              ctx.strokeRect(coord.tilex + 2, coord.tiley + 2, game.level.tilewidth - 4, game.level.tileheight - 4);
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // スワップアニメーション
      if (game.gamestate === game.gamestates.resolve && (game.animationstate === 2 || game.animationstate === 3)) {
        const shiftx = game.currentmove.column2 - game.currentmove.column1;
        const shifty = game.currentmove.row2 - game.currentmove.row1;

        const tile1Type = game.level.tiles[game.currentmove.column1][game.currentmove.row1].type;
        const tile2Type = game.level.tiles[game.currentmove.column2][game.currentmove.row2].type;

        const coord1 = getTileCoordinate(game.currentmove.column1, game.currentmove.row1, 0, 0);
        const coord1shift = getTileCoordinate(game.currentmove.column1, game.currentmove.row1,
          (game.animationtime / game.animationtimetotal) * shiftx,
          (game.animationtime / game.animationtimetotal) * shifty);
        const col1 = game.tilecolors[tile1Type];

        const coord2 = getTileCoordinate(game.currentmove.column2, game.currentmove.row2, 0, 0);
        const coord2shift = getTileCoordinate(game.currentmove.column2, game.currentmove.row2,
          (game.animationtime / game.animationtimetotal) * -shiftx,
          (game.animationtime / game.animationtimetotal) * -shifty);
        const col2 = game.tilecolors[tile2Type];

        const tile1Special = game.level.tiles[game.currentmove.column1][game.currentmove.row1].special;
        const tile2Special = game.level.tiles[game.currentmove.column2][game.currentmove.row2].special;

        drawTile(ctx, coord1.tilex, coord1.tiley, 0, 0, 0, -1, null);
        drawTile(ctx, coord2.tilex, coord2.tiley, 0, 0, 0, -1, null);

        if (game.animationstate === 2) {
          drawTile(ctx, coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2], tile1Type, tile1Special);
          drawTile(ctx, coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2], tile2Type, tile2Special);
        } else {
          drawTile(ctx, coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2], tile2Type, tile2Special);
          drawTile(ctx, coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2], tile1Type, tile1Special);
        }
      }
    };

    const getTileCoordinate = (column, row, columnoffset, rowoffset) => {
      const tilex = game.level.x + (column + columnoffset) * game.level.tilewidth;
      const tiley = game.level.y + (row + rowoffset) * game.level.tileheight;
      return { tilex, tiley };
    };

    const drawTile = (ctx, x, y, r, g, b, tileType, special) => {
      // アイコンのみ表示（背景・枠線なし）
      const centerX = x + game.level.tilewidth / 2;
      const centerY = y + game.level.tileheight / 2;

      // キャラクターのアイコン - 特殊タイルの場合は描画しない
      if (!special && tileType !== undefined && game.characters[tileType]) {
        const character = game.characters[tileType];

        // タイル画像が読み込まれていれば画像を表示、なければ絵文字
        const tileImageKeys = ['attack', 'defense', 'heal', 'trap'];
        const tileImageKey = tileImageKeys[tileType];
        const tileImage = game.tileImagesLoaded && game.tileImages[tileImageKey];

        if (tileImage) {
          // PNG画像を描画
          const iconSize = game.level.tilewidth * 0.9; // タイルサイズの90%（大きめ）
          const iconX = centerX - iconSize / 2;
          const iconY = centerY - iconSize / 2;

          // 影をつける
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          ctx.drawImage(tileImage, iconX, iconY, iconSize, iconSize);

          // 影をリセット
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else {
          // フォールバック: 絵文字を表示
          ctx.font = 'bold 48px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          ctx.fillStyle = '#ffffff';
          ctx.fillText(character.initial, centerX, centerY);

          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
      }

      // 特殊アイテムの視覚エフェクト（虹色タイル）
      if (special) {
        const tileSize = game.level.tilewidth - 4;
        const tileX = x + 2;
        const tileY = y + 2;

        if (special === 'lineBomb') {
          // specialDirectionを取得（タイル配列から）
          const tile = game.level.tiles ?
            (game.level.tiles[Math.floor((x - game.level.x) / game.level.tilewidth)] || [])[Math.floor((y - game.level.y) / game.level.tileheight)] :
            null;
          const direction = tile?.specialDirection || 'horizontal';
          const isVertical = direction === 'vertical';

          // 画像が読み込まれていれば画像を表示
          const slashImageKey = isVertical ? 'vertical' : 'horizontal';
          const slashImage = game.tileImagesLoaded && game.tileImages[slashImageKey];

          if (slashImage) {
            // PNG画像を描画
            const iconSize = tileSize * 0.9; // 少し小さめに調整
            const iconX = x + 2 + (tileSize - iconSize) / 2;
            const iconY = y + 2 + (tileSize - iconSize) / 2;

            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 15;

            ctx.drawImage(slashImage, iconX, iconY, iconSize, iconSize);

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          } else {
            // フォールバック: 虹色のペットボトル
            let bottleWidth, bottleHeight, bottleX, bottleY;

            if (isVertical) {
              bottleWidth = tileSize * 0.3;
              bottleHeight = tileSize * 0.8;
            } else {
              bottleWidth = tileSize * 0.8;
              bottleHeight = tileSize * 0.3;
            }

            bottleX = centerX - bottleWidth / 2;
            bottleY = centerY - bottleHeight / 2;

            const bottleGradient = isVertical
              ? ctx.createLinearGradient(bottleX, bottleY, bottleX, bottleY + bottleHeight)
              : ctx.createLinearGradient(bottleX, bottleY, bottleX + bottleWidth, bottleY);

            bottleGradient.addColorStop(0, '#ff0000');
            bottleGradient.addColorStop(0.17, '#ff7f00');
            bottleGradient.addColorStop(0.33, '#ffff00');
            bottleGradient.addColorStop(0.5, '#00ff00');
            bottleGradient.addColorStop(0.67, '#0000ff');
            bottleGradient.addColorStop(0.83, '#8b00ff');
            bottleGradient.addColorStop(1, '#ff00ff');

            ctx.fillStyle = bottleGradient;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 15;

            if (isVertical) {
              ctx.fillRect(bottleX, bottleY + bottleHeight * 0.15, bottleWidth, bottleHeight * 0.85);
              const capWidth = bottleWidth * 0.7;
              const capHeight = bottleHeight * 0.15;
              const capX = centerX - capWidth / 2;
              ctx.fillRect(capX, bottleY, capWidth, capHeight);

              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 3;
              ctx.shadowColor = '#ffffff';
              ctx.shadowBlur = 10;
              ctx.strokeRect(bottleX, bottleY + bottleHeight * 0.15, bottleWidth, bottleHeight * 0.85);
              ctx.strokeRect(capX, bottleY, capWidth, capHeight);

              ctx.shadowBlur = 0;
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 18px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('↓', centerX, centerY + bottleHeight * 0.15);
            } else {
              ctx.fillRect(bottleX + bottleWidth * 0.15, bottleY, bottleWidth * 0.85, bottleHeight);
              const capWidth = bottleWidth * 0.15;
              const capHeight = bottleHeight * 0.7;
              const capY = centerY - capHeight / 2;
              ctx.fillRect(bottleX, capY, capWidth, capHeight);

              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 3;
              ctx.shadowColor = '#ffffff';
              ctx.shadowBlur = 10;
              ctx.strokeRect(bottleX + bottleWidth * 0.15, bottleY, bottleWidth * 0.85, bottleHeight);
              ctx.strokeRect(bottleX, capY, capWidth, capHeight);

              ctx.shadowBlur = 0;
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 18px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('→', centerX + bottleWidth * 0.1, centerY);
            }

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }
        } else if (special === 'colorBomb') {
          // 画像が読み込まれていれば画像を表示
          const orbImage = game.tileImagesLoaded && game.tileImages.orb;

          if (orbImage) {
            // PNG画像を描画
            const iconSize = tileSize * 0.9; // 少し小さめに調整
            const iconX = x + 2 + (tileSize - iconSize) / 2;
            const iconY = y + 2 + (tileSize - iconSize) / 2;

            ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
            ctx.shadowBlur = 25;

            ctx.drawImage(orbImage, iconX, iconY, iconSize, iconSize);

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          } else {
            // フォールバック: 虹色のオーブ
            const orbRadius = tileSize * 0.42;
            const rainbowGradient = ctx.createRadialGradient(
              centerX, centerY, 0,
              centerX, centerY, orbRadius
            );
            rainbowGradient.addColorStop(0, '#ffffff');
            rainbowGradient.addColorStop(0.15, '#ff0000');
            rainbowGradient.addColorStop(0.3, '#ff7f00');
            rainbowGradient.addColorStop(0.45, '#ffff00');
            rainbowGradient.addColorStop(0.6, '#00ff00');
            rainbowGradient.addColorStop(0.75, '#0000ff');
            rainbowGradient.addColorStop(0.9, '#8b00ff');
            rainbowGradient.addColorStop(1, '#ff00ff');

            ctx.fillStyle = rainbowGradient;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }
        }
      }
    };

    const renderClusters = (ctx) => {
      for (let i = 0; i < game.clusters.length; i++) {
        const coord = getTileCoordinate(game.clusters[i].column, game.clusters[i].row, 0, 0);

        if (game.clusters[i].horizontal) {
          ctx.fillStyle = '#ffff00';
          ctx.fillRect(coord.tilex + game.level.tilewidth / 2, coord.tiley + game.level.tileheight / 2 - 4,
            (game.clusters[i].length - 1) * game.level.tilewidth, 8);
        } else {
          ctx.fillStyle = '#ffff00';
          ctx.fillRect(coord.tilex + game.level.tilewidth / 2 - 4, coord.tiley + game.level.tileheight / 2,
            8, (game.clusters[i].length - 1) * game.level.tileheight);
        }
      }
    };

    // パーティクル描画
    const renderParticles = (ctx) => {
      game.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    // キャラクター顔画像（円形サムネイル）描画
    const drawCharacterPortrait = (ctx, x, y, radius, image, borderColor, label) => {
      ctx.save();

      // 円形クリッピング
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (image && image.complete) {
        // 500×500の正方形画像をそのまま円形に表示（クロップなし）
        const size = radius * 2;
        ctx.drawImage(
          image,
          x - radius, y - radius, size, size // 描画先
        );
      } else {
        // 画像が読み込めない場合は色で代替
        ctx.fillStyle = borderColor;
        ctx.fill();

        // ラベル表示
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label[0], x, y);
      }

      ctx.restore();

      // 外枠（光る効果）
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = borderColor;
      ctx.shadowBlur = 10;
      ctx.stroke();

      // 影をリセット
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    };

    // HPバー描画
    const drawHPBar = (ctx, x, y, width, height, current, max, color) => {
      // 背景（黒）
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, width, height);

      // HPバー
      const hpPercent = Math.max(0, Math.min(1, current / max));
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width * hpPercent, height);

      // 枠線
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // テキスト（HP数値）- 黒字に白フチで視認性向上
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 白いフチ（袋文字効果）
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeText(`${Math.floor(current)} / ${max}`, x + width / 2, y + height / 2);

      // 黒い文字
      ctx.fillStyle = '#000000';
      ctx.fillText(`${Math.floor(current)} / ${max}`, x + width / 2, y + height / 2);
      ctx.textAlign = 'left';
    };

    // ゲージバー描画
    const drawGaugeBar = (ctx, x, y, width, height, current, max, color) => {
      // 背景（黒）
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, width, height);

      // NaN対策：currentが未定義の場合は0とする
      const safeCurrent = (current !== undefined && !isNaN(current)) ? current : 0;
      const safeMax = (max !== undefined && max > 0) ? max : 100;

      // ゲージバー
      const percent = Math.max(0, Math.min(1, safeCurrent / safeMax));
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width * percent, height);

      // 枠線
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // テキスト（%）- 黒字に白フチで視認性向上
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 白いフチ（袋文字効果）
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeText(`${Math.floor(safeCurrent)}%`, x + width / 2, y + height / 2);

      // 黒い文字
      ctx.fillStyle = '#000000';
      ctx.fillText(`${Math.floor(safeCurrent)}%`, x + width / 2, y + height / 2);
      ctx.textAlign = 'left';
    };

    // 戦闘ログ追加関数
    const addBattleLog = (message, color = '#ffff00') => {
      const newLog = {
        message: message,
        color: color,
        timestamp: Date.now()
      };

      game.battleLog.push(newLog);
      setBattleLog([...game.battleLog]);

      // 古いログを削除（10件以上は削除）
      if (game.battleLog.length > 10) {
        game.battleLog.shift();
      }
    };

    // イージング関数（滑らかなアニメーション用）
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOutBack = (t) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    // 特殊エフェクト描画（スマホゲーム風多段階演出 + リッチ強化）
    const renderSpecialEffects = (ctx) => {
      game.specialEffects.forEach(e => {
        const progress = e.time / e.duration;
        ctx.save();

        if (e.type === 'lineBomb') {
          // ラインボム多段階演出: 予兆(0-0.2) → スラッシュ(0.2-0.5) → ビーム(0.5-0.9) → 残光(0.9-1.0)

          if (progress < 0.2) {
            // Phase 1: 予兆（エネルギーが溜まる）
            const phaseProgress = progress / 0.2;
            const alpha = phaseProgress * 0.6;
            ctx.globalAlpha = alpha;

            // パルス状の光
            const pulseSize = 20 + Math.sin(phaseProgress * Math.PI * 4) * 10;
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 30;
            ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.lineWidth = pulseSize;

            if (e.horizontal) {
              ctx.beginPath();
              ctx.moveTo(e.x1, e.y1);
              ctx.lineTo(e.x2, e.y2);
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.moveTo(e.x1, e.y1);
              ctx.lineTo(e.x2, e.y2);
              ctx.stroke();
            }

          } else if (progress < 0.5) {
            // Phase 2: スラッシュ（白い斬撃線が走る）
            const phaseProgress = (progress - 0.2) / 0.3;
            const alpha = 1.0 - phaseProgress * 0.3;

            // 白い斬撃線（複数レイヤー）
            ctx.globalAlpha = alpha;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 80;

            // 外側の白い線
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 80;
            ctx.beginPath();
            if (e.horizontal) {
              ctx.moveTo(e.x1 + (e.x2 - e.x1) * phaseProgress, e.y1);
              ctx.lineTo(e.x1, e.y1);
            } else {
              ctx.moveTo(e.x1, e.y1 + (e.y2 - e.y1) * phaseProgress);
              ctx.lineTo(e.x1, e.y1);
            }
            ctx.stroke();

            // 内側の黄色い線
            ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.lineWidth = 40;
            ctx.beginPath();
            if (e.horizontal) {
              ctx.moveTo(e.x1 + (e.x2 - e.x1) * phaseProgress, e.y1);
              ctx.lineTo(e.x1, e.y1);
            } else {
              ctx.moveTo(e.x1, e.y1 + (e.y2 - e.y1) * phaseProgress);
              ctx.lineTo(e.x1, e.y1);
            }
            ctx.stroke();

          } else if (progress < 0.9) {
            // Phase 3: ビーム（太い光の柱）
            const phaseProgress = (progress - 0.5) / 0.4;
            const alpha = 1.0 - phaseProgress * 0.5;
            ctx.globalAlpha = alpha;

            // 虹色グラデーションビーム
            const gradient = e.horizontal
              ? ctx.createLinearGradient(e.x1, e.y1, e.x2, e.y1)
              : ctx.createLinearGradient(e.x1, e.y1, e.x1, e.y2);

            gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
            gradient.addColorStop(0.2, `rgba(255, 255, 0, ${alpha})`);
            gradient.addColorStop(0.4, `rgba(0, 255, 0, ${alpha})`);
            gradient.addColorStop(0.6, `rgba(0, 255, 255, ${alpha})`);
            gradient.addColorStop(0.8, `rgba(0, 0, 255, ${alpha})`);
            gradient.addColorStop(1, `rgba(255, 0, 255, ${alpha})`);

            ctx.fillStyle = gradient;
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 70;

            const width = e.horizontal ? e.x2 - e.x1 : 70;
            const height = e.horizontal ? 70 : e.y2 - e.y1;
            ctx.fillRect(e.x1 - (e.horizontal ? 0 : 35), e.y1 - (e.horizontal ? 35 : 0), width, height);

          } else {
            // Phase 4: 残光（光の粒が残る）
            const phaseProgress = (progress - 0.9) / 0.1;
            const alpha = (1.0 - phaseProgress) * 0.5;
            ctx.globalAlpha = alpha;

            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 40;
            ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;

            const width = e.horizontal ? e.x2 - e.x1 : 30;
            const height = e.horizontal ? 30 : e.y2 - e.y1;
            ctx.fillRect(e.x1 - (e.horizontal ? 0 : 15), e.y1 - (e.horizontal ? 15 : 0), width, height);
          }

        } else if (e.type === 'colorBomb') {
          // カラーボム多段階演出: 予兆(0-0.3) → 爆発(0.3-0.7) → 残光(0.7-1.0)

          if (progress < 0.3) {
            // Phase 1: 予兆（フレアが中心に集まる）
            const phaseProgress = progress / 0.3;

            // フレアを描画（周囲から中心へ）
            e.flares.forEach((flare, i) => {
              const t = phaseProgress;
              const x = flare.startX + (flare.targetX - flare.startX) * t;
              const y = flare.startY + (flare.targetY - flare.startY) * t;
              const size = 8 * (1 - t * 0.5);
              const alpha = 0.8;

              ctx.globalAlpha = alpha;
              ctx.fillStyle = flare.color;
              ctx.shadowColor = flare.color;
              ctx.shadowBlur = 20;
              ctx.beginPath();
              ctx.arc(x, y, size, 0, Math.PI * 2);
              ctx.fill();
            });

          } else if (progress < 0.7) {
            // Phase 2: 爆発（ホワイトアウト + レンズフレア + 白い光球 + 複数の衝撃波）
            const phaseProgress = easeOutCubic((progress - 0.3) / 0.4);

            // ホワイトアウト（画面全体フラッシュ）
            if (phaseProgress < 0.1) {
              const flashAlpha = (0.1 - phaseProgress) / 0.1 * 0.6;
              ctx.globalAlpha = flashAlpha;
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, 550, 700);
            }

            // レンズフレア（放射状の光条）
            if (phaseProgress < 0.5) {
              const flareAlpha = (0.5 - phaseProgress) / 0.5 * 0.7;
              for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 * i) / 12;
                const length = e.radius * 4 * phaseProgress;
                ctx.globalAlpha = flareAlpha;
                const gradient = ctx.createLinearGradient(
                  e.x, e.y,
                  e.x + Math.cos(angle) * length,
                  e.y + Math.sin(angle) * length
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${flareAlpha})`);
                gradient.addColorStop(0.5, `rgba(255, 200, 100, ${flareAlpha * 0.5})`);
                gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
                ctx.fillStyle = gradient;
                ctx.save();
                ctx.translate(e.x, e.y);
                ctx.rotate(angle);
                ctx.fillRect(0, -15, length, 30);
                ctx.restore();
              }
            }

            // 多重グロー（3層）
            for (let layer = 0; layer < 3; layer++) {
              const layerSize = e.radius * (0.3 + layer * 0.2) * (1 + phaseProgress);
              const layerAlpha = (1 - phaseProgress) * (0.8 - layer * 0.2);
              ctx.globalAlpha = layerAlpha;

              const layerGradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, layerSize);
              layerGradient.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha})`);
              layerGradient.addColorStop(0.3, `rgba(255, 255, 200, ${layerAlpha * 0.8})`);
              layerGradient.addColorStop(0.6, `rgba(255, 200, 100, ${layerAlpha * 0.4})`);
              layerGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

              ctx.fillStyle = layerGradient;
              ctx.shadowColor = '#ffffff';
              ctx.shadowBlur = 120 + layer * 30;
              ctx.beginPath();
              ctx.arc(e.x, e.y, layerSize, 0, Math.PI * 2);
              ctx.fill();
            }

            // 複数の衝撃波（虹色・5層に増量）
            for (let i = 0; i < 5; i++) {
              const waveDelay = i * 0.1;
              const waveProgress = Math.max(0, Math.min(1, (phaseProgress - waveDelay) / (1 - waveDelay)));
              const easedWaveProgress = easeOutCubic(waveProgress);
              const waveRadius = e.radius * easedWaveProgress * 2;
              const waveAlpha = (1 - waveProgress) * 0.7;

              if (waveProgress > 0) {
                // 外側の太い波
                ctx.globalAlpha = waveAlpha;
                ctx.strokeStyle = `hsl(${i * 40}, 100%, 60%)`;
                ctx.lineWidth = 40 - i * 6;
                ctx.shadowColor = `hsl(${i * 40}, 100%, 60%)`;
                ctx.shadowBlur = 100;
                ctx.beginPath();
                ctx.arc(e.x, e.y, waveRadius, 0, Math.PI * 2);
                ctx.stroke();

                // 内側の細い波（グロー強化）
                ctx.globalAlpha = waveAlpha * 0.6;
                ctx.strokeStyle = `hsl(${i * 40 + 20}, 100%, 80%)`;
                ctx.lineWidth = 20 - i * 3;
                ctx.shadowBlur = 60;
                ctx.beginPath();
                ctx.arc(e.x, e.y, waveRadius * 0.95, 0, Math.PI * 2);
                ctx.stroke();
              }
            }

          } else {
            // Phase 3: 残光（虹色の光の粒が飛び散る）
            const phaseProgress = (progress - 0.7) / 0.3;

            // フレアを描画（中心から外へ飛び散る）
            e.flares.forEach((flare, i) => {
              const t = phaseProgress;
              const angle = (Math.PI * 2 * i) / e.flares.length;
              const distance = e.radius * 2 * t;
              const x = e.x + Math.cos(angle) * distance;
              const y = e.y + Math.sin(angle) * distance;
              const size = 6 * (1 - t);
              const alpha = (1 - t) * 0.7;

              if (size > 0) {
                ctx.globalAlpha = alpha;
                ctx.fillStyle = flare.color;
                ctx.shadowColor = flare.color;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
              }
            });
          }
        }

        ctx.restore();
      });
    };

    // パーティクル生成
    const createParticles = (x, y, count, color) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 3 + Math.random() * 5;
        game.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          gravity: 0.3,
          size: 3 + Math.random() * 4,
          color: color || `hsl(${Math.random() * 360}, 100%, 60%)`,
          life: 0.8 + Math.random() * 0.4,
          maxLife: 1.2,
          alpha: 1
        });
      }
    };

    // バトル効果を適用（色ごと）
    const applyBattleEffects = () => {
      let totalDamage = 0;
      let totalDefense = 0;
      let totalHeal = 0;
      let totalSelfDamage = 0;
      let totalClusters = 0;

      // 色ごとの合計マッチ数を集計（L字消しなどの複数クラスター対応）
      const colorMatches = { 0: 0, 1: 0, 2: 0, 3: 0 };

      for (let i = 0; i < game.clusters.length; i++) {
        const cluster = game.clusters[i];
        const tileType = game.level.tiles[cluster.column][cluster.row].type;
        colorMatches[tileType] += cluster.length;
        totalClusters++;
      }

      // 色ごとに効果を適用
      // 👊 パンチ（攻撃）- 3個=基本値、4個=1.2倍、5個以上=特殊タイル生成のみ
      if (colorMatches[0] > 0) {
        if (colorMatches[0] === 3) totalDamage += 2;
        else if (colorMatches[0] === 4) totalDamage += Math.ceil(2 * 1.2); // 2.4 → 3
        // 5個以上は特殊タイル生成のみで直接ダメージなし
      }

      // 📱 スマホ（防御）- 2ターン持続 - 3個=基本値、4個=1.2倍、5個以上=特殊タイル生成のみ
      if (colorMatches[1] > 0) {
        if (colorMatches[1] === 3) totalDefense += 12;
        else if (colorMatches[1] === 4) totalDefense += Math.ceil(12 * 1.2); // 14.4 → 15
        // 5個以上は特殊タイル生成のみで直接防御なし
      }

      // ❤️ ハート（回復）- 3個=基本値、4個=1.2倍、5個以上=特殊タイル生成のみ
      if (colorMatches[2] > 0) {
        if (colorMatches[2] === 3) totalHeal += 3;
        else if (colorMatches[2] === 4) totalHeal += Math.ceil(3 * 1.2); // 3.6 → 4
        // 5個以上は特殊タイル生成のみで直接回復なし
      }

      // 💣 爆弾（お邪魔）- 3個のみダメージ、4個以上は回避
      if (colorMatches[3] > 0) {
        if (colorMatches[3] === 3) {
          totalSelfDamage += 5;
        }
        // 4個以上は何もしない（ダメージ回避、5個以上は特殊タイル生成）
        console.log(`💣 爆弾: 合計${colorMatches[3]}個消し ${colorMatches[3] >= 4 ? '→ 回避成功！' : '→ ダメージ'}`);
      }

      // 防御バフを適用（2ターン持続、上書き）
      if (totalDefense > 0) {
        game.defenseBonus = totalDefense; // 上書き（蓄積しない）
        game.defenseTurns = 2; // 2ターン持続
        setDefenseBonus(game.defenseBonus);
        setDefenseTurns(game.defenseTurns);
        console.log(`🛡️ 防御: ${totalDefense}%軽減（2ターン持続）`);
        addBattleLog(`🛡️ 防御${totalDefense}%UP（2ターン）`, '#44ccff');
      }

      // 攻撃ダメージを適用
      if (totalDamage > 0) {
        game.enemyHP = Math.max(0, game.enemyHP - totalDamage);
        setEnemyHP(game.enemyHP);
        console.log(`⚔ 攻撃: ${totalDamage}ダメージ！ 相手HP: ${game.enemyHP}`);
        addBattleLog(`⚔️ 攻撃！ ${totalDamage}ダメージ`, '#ff4444');

        // 画面揺れ
        game.screenShake.active = true;
        game.screenShake.intensity = totalDamage / 3;
        game.screenShake.duration = 0.2;
      }

      // HP回復
      if (totalHeal > 0) {
        game.playerHP = Math.min(game.playerMaxHP, game.playerHP + totalHeal);
        setPlayerHP(game.playerHP);
        console.log(`❤️ 回復: ${totalHeal}HP回復！`);
        addBattleLog(`❤️ ${totalHeal}HP回復`, '#44ff44');
      }

      // お邪魔ブロック（自分にダメージ）
      if (totalSelfDamage > 0) {
        game.playerHP = Math.max(0, game.playerHP - totalSelfDamage);
        setPlayerHP(game.playerHP);
        console.log(`💣 お邪魔ブロック: ${totalSelfDamage}ダメージ！`);
        addBattleLog(`💣 罠発動！ ${totalSelfDamage}ダメージ`, '#ff8c00');

        // 画面揺れ
        game.screenShake.active = true;
        game.screenShake.intensity = 12;
        game.screenShake.duration = 0.3;
      }

      // 必殺技ゲージ蓄積（4個消しのみ20%）
      if (totalClusters > 0) {
        let gaugeCharge = 0;
        for (let i = 0; i < game.clusters.length; i++) {
          const matchCount = game.clusters[i].length;
          if (matchCount === 4) gaugeCharge += 20; // 4個消しのみ
          else if (matchCount >= 5) gaugeCharge += 20; // 5個以上も20%
          // 3個消しは0%
        }

        if (gaugeCharge > 0) {
          game.playerUltimateGauge = Math.min(100, game.playerUltimateGauge + gaugeCharge);
          setPlayerUltimateGauge(game.playerUltimateGauge);
          console.log(`★ 必殺技ゲージ: +${gaugeCharge}% (合計: ${game.playerUltimateGauge}%)`);

          // プレイヤー必殺技発動チェック
          if (game.playerUltimateGauge >= 100) {
            activatePlayerUltimate();
          }
        }
      }

      // ターンカウント増加
      game.turnCount++;
      setTurnCount(game.turnCount);
    };

    // プレイヤー必殺技発動
    const activatePlayerUltimate = () => {
      console.log('★★★ プレイヤー必殺技発動！ ★★★');

      // 17.5%ダメージ（半減調整）
      const ultimateDamage = Math.floor(game.enemyMaxHP * 0.175);
      game.enemyHP = Math.max(0, game.enemyHP - ultimateDamage);
      setEnemyHP(game.enemyHP);

      // 画面揺れ（強力）
      game.screenShake.active = true;
      game.screenShake.intensity = 20;
      game.screenShake.duration = 0.6;

      // ゲージリセット
      game.playerUltimateGauge = 0;
      setPlayerUltimateGauge(0);

      console.log(`★ プレイヤー必殺技で${ultimateDamage}ダメージ（敵MaxHPの17.5%）！`);
      addBattleLog(`★ 必殺技発動！ ${ultimateDamage}ダメージ`, '#ffdd44');
    };

    // 敵必殺技発動
    const activateEnemyUltimate = () => {
      console.log('💀💀💀 敵必殺技発動！ 💀💀💀');

      // 17.5%ダメージ（防御無視）（半減調整）
      const ultimateDamage = Math.floor(game.playerMaxHP * 0.175);
      game.playerHP = Math.max(0, game.playerHP - ultimateDamage);
      setPlayerHP(game.playerHP);

      // 画面揺れ（強力）
      game.screenShake.active = true;
      game.screenShake.intensity = 25;
      game.screenShake.duration = 0.8;

      // ゲージリセット
      game.enemyUltimateGauge = 0;
      setEnemyUltimateGauge(0);

      console.log(`💀 敵必殺技で${ultimateDamage}ダメージ（プレイヤーMaxHPの17.5%）！`);
      addBattleLog(`💀 敵必殺技！ ${ultimateDamage}ダメージ`, '#ff00ff');
    };

    // 相手の攻撃
    const enemyAttack = () => {
      // 防御ターン減衰
      if (game.defenseTurns > 0) {
        game.defenseTurns--;
        setDefenseTurns(game.defenseTurns);
        if (game.defenseTurns === 0) {
          game.defenseBonus = 0;
          setDefenseBonus(0);
          console.log('🛡️ 防御効果が切れました');
        }
      }

      // 必殺技ゲージ蓄積（毎ターン12.5%、8ターンで100%）
      game.enemyUltimateGauge = Math.min(100, game.enemyUltimateGauge + 12.5);
      setEnemyUltimateGauge(game.enemyUltimateGauge);
      console.log(`💀 敵ゲージ: +12.5% (合計: ${game.enemyUltimateGauge}%)`);

      // 敵必殺技発動チェック
      if (game.enemyUltimateGauge >= 100) {
        activateEnemyUltimate();
        return; // 必殺技を使ったら通常攻撃はしない
      }

      // 2ターンに1回攻撃（50%の確率で攻撃）
      if (game.turnCount % 2 !== 0) {
        console.log('相手は様子を見ている...');
        return;
      }

      // ダメージ計算（防御バフで軽減）- 半減調整
      const baseDamage = game.enemyAttack || 8;  // 15 → 8 に半減
      const defenseMitigation = Math.min(0.8, game.defenseBonus / 100); // 最大80%軽減
      const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - defenseMitigation))); // 最低1ダメージ

      game.playerHP = Math.max(0, game.playerHP - finalDamage);
      setPlayerHP(game.playerHP);

      console.log(`💀 相手の攻撃: ${finalDamage}ダメージ！ (ベース: ${baseDamage}, 防御: -${Math.floor(baseDamage - finalDamage)})`);

      // 防御軽減があればログに表示
      if (defenseMitigation > 0) {
        const blocked = baseDamage - finalDamage;
        addBattleLog(`🛡️ 敵の攻撃！ ${finalDamage}ダメージ（${blocked}軽減）`, '#ff8c00');
      } else {
        addBattleLog(`💥 敵の攻撃！ ${finalDamage}ダメージ`, '#ff8c00');
      }

      // 画面揺れ
      game.screenShake.active = true;
      game.screenShake.intensity = 10;
      game.screenShake.duration = 0.4;
    };

    // 新しいゲーム
    const newGame = () => {
      game.gamestate = game.gamestates.ready;
      game.gameover = false;
      game.cleared = false;
      game.turnCount = 0;
      setTurnCount(0);

      createLevel();
      findMoves();
      findClusters();
    };

    const createLevel = () => {
      let done = false;

      while (!done) {
        for (let i = 0; i < game.level.columns; i++) {
          for (let j = 0; j < game.level.rows; j++) {
            game.level.tiles[i][j].type = getRandomTile();
          }
        }

        resolveClusters();
        findMoves();

        if (game.moves.length > 0) {
          done = true;
        }
      }
    };

    // 盤面をシャッフル（手詰まり時）
    const reshuffleBoard = () => {
      console.log('🔀 盤面をシャッフル中...');

      // 現在のタイルをすべて集める
      const tiles = [];
      for (let i = 0; i < game.level.columns; i++) {
        for (let j = 0; j < game.level.rows; j++) {
          tiles.push(game.level.tiles[i][j].type);
        }
      }

      // Fisher-Yatesアルゴリズムでシャッフル
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }

      // シャッフルしたタイルを盤面に配置
      let index = 0;
      for (let i = 0; i < game.level.columns; i++) {
        for (let j = 0; j < game.level.rows; j++) {
          game.level.tiles[i][j].type = tiles[index];
          game.level.tiles[i][j].special = null; // 特殊効果はリセット
          index++;
        }
      }

      // クラスターを解消
      resolveClusters();

      // 手を再検索
      findMoves();

      // もし手がまだなければ、新しいタイルで再生成
      if (game.moves.length === 0) {
        console.log('⚠ シャッフル後も手がない！再生成します...');
        createLevel();
      }

      console.log(`✅ シャッフル完了！有効な手: ${game.moves.length}個`);
    };

    const getRandomTile = () => {
      return Math.floor(Math.random() * game.tilecolors.length);
    };

    const resolveClusters = () => {
      findClusters();

      while (game.clusters.length > 0) {
        removeClusters(false);  // 初期化時は特殊タイル生成しない
        shiftTiles();
        findClusters();
      }
    };

    const findClusters = () => {
      game.clusters = [];

      // 水平クラスター
      for (let j = 0; j < game.level.rows; j++) {
        let matchlength = 1;
        for (let i = 0; i < game.level.columns; i++) {
          let checkcluster = false;

          if (i === game.level.columns - 1) {
            checkcluster = true;
          } else {
            if (game.level.tiles[i][j].type === game.level.tiles[i + 1][j].type &&
                game.level.tiles[i][j].type !== -1) {
              matchlength += 1;
            } else {
              checkcluster = true;
            }
          }

          if (checkcluster) {
            if (matchlength >= 3) {
              const cluster = {
                column: i + 1 - matchlength,
                row: j,
                length: matchlength,
                horizontal: true
              };

              // 特殊アイテム生成判定（5個以上のみ）
              if (matchlength >= 5) {
                cluster.special = 'colorBomb'; // 5個消し → カラーボム（横一線）
              }
              // 4個以下は特殊タイル生成なし

              game.clusters.push(cluster);
            }
            matchlength = 1;
          }
        }
      }

      // 垂直クラスター
      for (let i = 0; i < game.level.columns; i++) {
        let matchlength = 1;
        for (let j = 0; j < game.level.rows; j++) {
          let checkcluster = false;

          if (j === game.level.rows - 1) {
            checkcluster = true;
          } else {
            if (game.level.tiles[i][j].type === game.level.tiles[i][j + 1].type &&
                game.level.tiles[i][j].type !== -1) {
              matchlength += 1;
            } else {
              checkcluster = true;
            }
          }

          if (checkcluster) {
            if (matchlength >= 3) {
              const cluster = {
                column: i,
                row: j + 1 - matchlength,
                length: matchlength,
                horizontal: false
              };

              // 特殊アイテム生成判定（5個以上のみ）
              if (matchlength >= 5) {
                cluster.special = 'colorBomb'; // 5個消し → カラーボム（縦一線）
              }
              // 4個以下は特殊タイル生成なし

              game.clusters.push(cluster);
            }
            matchlength = 1;
          }
        }
      }

      // クラスター検出後、L字/T字を自動検出
      detectLTShapes();
    };

    // L字/T字の検出（クラスターの重なりをチェック）
    const detectLTShapes = () => {
      // 横クラスターと縦クラスターを分離
      const horizontalClusters = game.clusters.filter(c => c.horizontal);
      const verticalClusters = game.clusters.filter(c => !c.horizontal);

      // 各横クラスターと各縦クラスターの重なりをチェック
      for (let h of horizontalClusters) {
        for (let v of verticalClusters) {
          // クラスターが重なっているかチェック（同じタイルを共有）
          const hTiles = [];
          for (let i = 0; i < h.length; i++) {
            hTiles.push({ column: h.column + i, row: h.row });
          }

          const vTiles = [];
          for (let i = 0; i < v.length; i++) {
            vTiles.push({ column: v.column, row: v.row + i });
          }

          // 重なりタイルを検出
          const overlap = hTiles.filter(ht =>
            vTiles.some(vt => vt.column === ht.column && vt.row === ht.row)
          );

          if (overlap.length > 0) {
            // 重なりあり → L字/T字の可能性
            // ユニークなタイル数を計算
            const uniqueTiles = new Set();
            hTiles.forEach(t => uniqueTiles.add(`${t.column},${t.row}`));
            vTiles.forEach(t => uniqueTiles.add(`${t.column},${t.row}`));

            if (uniqueTiles.size >= 5) {
              // 5個以上 → L字/T字確定
              h.isLTShape = true;
              v.isLTShape = true;
              h.ltShapePartner = v;
              v.ltShapePartner = h;
              h.overlapTile = overlap[0]; // 重なりタイル（生成位置の参考）
              v.overlapTile = overlap[0];
              // 特殊タイル生成のために special フラグを設定（横クラスターのみ、重複防止）
              h.special = 'lineBomb';
              // v.special は設定しない（重複防止のため横クラスターだけで処理）
              console.log(`🔷 L字/T字検出: ユニークタイル${uniqueTiles.size}個 → ラインボム生成予約`);
            }
          }
        }
      }
    };

    const findMoves = () => {
      game.moves = [];

      // 水平スワップ
      for (let j = 0; j < game.level.rows; j++) {
        for (let i = 0; i < game.level.columns - 1; i++) {
          swap(i, j, i + 1, j);
          findClusters();
          swap(i, j, i + 1, j);

          if (game.clusters.length > 0) {
            game.moves.push({ column1: i, row1: j, column2: i + 1, row2: j });
          }
        }
      }

      // 垂直スワップ
      for (let i = 0; i < game.level.columns; i++) {
        for (let j = 0; j < game.level.rows - 1; j++) {
          swap(i, j, i, j + 1);
          findClusters();
          swap(i, j, i, j + 1);

          if (game.clusters.length > 0) {
            game.moves.push({ column1: i, row1: j, column2: i, row2: j + 1 });
          }
        }
      }

      game.clusters = [];
    };

    const removeClusters = (generateSpecial = true) => {
      // 特殊タイルの自動発動は無効化（クリックでのみ発動）
      // クラスター内に特殊タイルがあっても、削除せずスキップする

      // 通常のクラスター削除処理
      for (let i = 0; i < game.clusters.length; i++) {
        const cluster = game.clusters[i];
        let coffset = 0;
        let roffset = 0;

        // 特殊アイテムを生成する場合、最後にスワップした位置または中央の1つを特殊タイルとして残す
        let specialTilePos = null;
        if (generateSpecial && cluster.special) {
          // 最後にスワップした位置がこのクラスター内にあるかチェック
          const swappedCol = game.lastSwappedTile.column;
          const swappedRow = game.lastSwappedTile.row;

          let isInCluster = false;
          if (cluster.horizontal) {
            // 横クラスター：同じ行で、列がクラスターの範囲内
            if (swappedRow === cluster.row &&
                swappedCol >= cluster.column &&
                swappedCol < cluster.column + cluster.length) {
              isInCluster = true;
              specialTilePos = { column: swappedCol, row: swappedRow };
            }
          } else {
            // 縦クラスター：同じ列で、行がクラスターの範囲内
            if (swappedCol === cluster.column &&
                swappedRow >= cluster.row &&
                swappedRow < cluster.row + cluster.length) {
              isInCluster = true;
              specialTilePos = { column: swappedCol, row: swappedRow };
            }
          }

          // スワップ位置がクラスター内になければ、中央位置を使用
          if (!isInCluster) {
            const centerIndex = Math.floor(cluster.length / 2);
            if (cluster.horizontal) {
              specialTilePos = { column: cluster.column + centerIndex, row: cluster.row };
            } else {
              specialTilePos = { column: cluster.column, row: cluster.row + centerIndex };
            }
          }
        }

        for (let j = 0; j < cluster.length; j++) {
          const currentCol = cluster.column + coffset;
          const currentRow = cluster.row + roffset;
          const tile = game.level.tiles[currentCol][currentRow];

          // 既存の特殊タイルはスキップ（削除しない）
          if (tile.special === 'lineBomb' || tile.special === 'colorBomb') {
            // 特殊タイルはそのまま残す
            if (cluster.horizontal) {
              coffset++;
            } else {
              roffset++;
            }
            continue;
          }

          // 特殊タイル位置なら、特殊アイテムとして残す
          if (specialTilePos && currentCol === specialTilePos.column && currentRow === specialTilePos.row) {
            // L字/T字の場合は、スワップ方向に応じたラインボムを生成
            if (cluster.isLTShape) {
              // 既に特殊タイルが生成されていないかチェック（L字/T字は2つのクラスターで処理される）
              if (!game.level.tiles[currentCol][currentRow].special) {
                game.level.tiles[currentCol][currentRow].special = 'lineBomb';
                game.level.tiles[currentCol][currentRow].specialDirection = game.lastSwapDirection;
                console.log(`🌈 L字/T字ラインボム生成: (${currentCol}, ${currentRow}) 方向=${game.lastSwapDirection} (スワップ方向)`);
              }
            } else {
              // 通常の特殊タイル生成
              game.level.tiles[currentCol][currentRow].special = cluster.special;
              // 方向情報を保存（ラインボムの場合）
              if (cluster.special === 'lineBomb') {
                const direction = cluster.horizontal ? 'horizontal' : 'vertical';
                game.level.tiles[currentCol][currentRow].specialDirection = direction;
                console.log(`🌈 ラインボム生成: (${currentCol}, ${currentRow}) 方向=${direction} (${cluster.horizontal ? '横' : '縦'}消し)`);
              } else if (cluster.special === 'colorBomb') {
                console.log(`💎 カラーボム生成: (${currentCol}, ${currentRow}) (${cluster.horizontal ? '横' : '縦'}一線5個以上消し)`);
              }
            }
            // タイプは元のまま残す（色情報を保持）
          } else {
            game.level.tiles[currentCol][currentRow].type = -1;
          }

          if (cluster.horizontal) {
            coffset++;
          } else {
            roffset++;
          }
        }
      }

      for (let i = 0; i < game.level.columns; i++) {
        let shift = 0;
        for (let j = game.level.rows - 1; j >= 0; j--) {
          if (game.level.tiles[i][j].type === -1) {
            shift++;
            game.level.tiles[i][j].shift = 0;
          } else {
            game.level.tiles[i][j].shift = shift;
          }
        }
      }
    };

    // ラインボム発動：横または縦1列を全消去（方向固定）
    const activateLineBomb = (col, row) => {
      console.log(`⚡ ラインボム発動！ at (${col}, ${row})`);

      // タイルから方向情報を取得
      const tile = game.level.tiles[col][row];
      const direction = tile.specialDirection;
      console.log(`タイル情報: special=${tile.special}, specialDirection=${direction}`);

      if (!direction) {
        console.warn(`⚠️ 警告: specialDirectionが設定されていません！デフォルトで横に設定します。`);
      }

      const horizontal = direction === 'horizontal' || !direction; // デフォルトは横
      console.log(`発動方向: ${horizontal ? '横（→）' : '縦（↓）'}`);



      // タイル座標を取得
      const coord = getTileCoordinate(col, row, 0, 0);
      const centerX = coord.tilex + game.level.tilewidth / 2;
      const centerY = coord.tiley + game.level.tileheight / 2;

      // スラッシュ&ビームエフェクト追加（多段階: 予兆→スラッシュ→ビーム→残光）
      if (horizontal) {
        game.specialEffects.push({
          type: 'lineBomb',
          horizontal: true,
          x1: game.level.x,
          y1: centerY,
          x2: game.level.x + game.level.columns * game.level.tilewidth,
          y2: centerY,
          time: 0,
          duration: 2.0,  // 2秒の長い演出
          onComplete: () => {
            // 演出終了後に横1列削除
            for (let i = 0; i < game.level.columns; i++) {
              const tileCoord = getTileCoordinate(i, row, 0, 0);
              createParticles(
                tileCoord.tilex + game.level.tilewidth / 2,
                tileCoord.tiley + game.level.tileheight / 2,
                50,  // パーティクル増量（リッチ感UP）
                '#ffff00'
              );
              game.level.tiles[i][row].type = -1;
              game.level.tiles[i][row].special = null;
            }

            // タイルシフト情報を計算
            for (let i = 0; i < game.level.columns; i++) {
              let shift = 0;
              for (let j = game.level.rows - 1; j >= 0; j--) {
                if (game.level.tiles[i][j].type === -1) {
                  shift++;
                  game.level.tiles[i][j].shift = 0;
                } else {
                  game.level.tiles[i][j].shift = shift;
                }
              }
            }

            // タイルを実際に落として新しいタイルを補充
            shiftTiles();

            // 新しいクラスターをチェック
            findClusters();
            if (game.clusters.length > 0) {
              // 連鎖が発生する場合
              game.gamestate = game.gamestates.resolve;
              game.animationstate = 2;
              game.animationtime = 0;
            }
          }
        });
      } else {
        game.specialEffects.push({
          type: 'lineBomb',
          horizontal: false,
          x1: centerX,
          y1: game.level.y,
          x2: centerX,
          y2: game.level.y + game.level.rows * game.level.tileheight,
          time: 0,
          duration: 2.0,  // 2秒の長い演出
          onComplete: () => {
            // 演出終了後に縦1列削除
            for (let j = 0; j < game.level.rows; j++) {
              const tileCoord = getTileCoordinate(col, j, 0, 0);
              createParticles(
                tileCoord.tilex + game.level.tilewidth / 2,
                tileCoord.tiley + game.level.tileheight / 2,
                50,  // パーティクル増量（リッチ感UP）
                '#ffff00'
              );
              game.level.tiles[col][j].type = -1;
              game.level.tiles[col][j].special = null;
            }

            // タイルシフト情報を計算
            for (let i = 0; i < game.level.columns; i++) {
              let shift = 0;
              for (let j = game.level.rows - 1; j >= 0; j--) {
                if (game.level.tiles[i][j].type === -1) {
                  shift++;
                  game.level.tiles[i][j].shift = 0;
                } else {
                  game.level.tiles[i][j].shift = shift;
                }
              }
            }

            // タイルを実際に落として新しいタイルを補充
            shiftTiles();

            // 新しいクラスターをチェック
            findClusters();
            if (game.clusters.length > 0) {
              // 連鎖が発生する場合
              game.gamestate = game.gamestates.resolve;
              game.animationstate = 2;
              game.animationtime = 0;
            }
          }
        });
      }

      // ボーナスダメージ（ラインボムは強力）- 半減調整
      game.enemyHP = Math.max(0, game.enemyHP - 15);
      setEnemyHP(game.enemyHP);
      console.log(`⚡ ラインボムで15ダメージ！`);
      addBattleLog(`⚡ ラインボム！ 15ダメージ`, '#ffaa00');
    };

    // カラーボム発動：周囲3×3を爆破
    const activateColorBomb = (col, row) => {
      console.log(`💥 カラーボム発動！ at (${col}, ${row})`);

      // タイル座標を取得
      const coord = getTileCoordinate(col, row, 0, 0);
      const centerX = coord.tilex + game.level.tilewidth / 2;
      const centerY = coord.tiley + game.level.tileheight / 2;

      // 核爆発エフェクト追加（多段階: 予兆→爆発→残光）
      game.specialEffects.push({
        type: 'colorBomb',
        x: centerX,
        y: centerY,
        radius: game.level.tilewidth * 2.5,
        time: 0,
        duration: 2.8,  // 2.8秒の長い演出
        flares: [], // フレア（光の粒）を格納
        onComplete: () => {
          // 演出終了後に周囲3×3範囲を削除
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const targetCol = col + i;
              const targetRow = row + j;

              if (targetCol >= 0 && targetCol < game.level.columns &&
                  targetRow >= 0 && targetRow < game.level.rows) {
                const tileCoord = getTileCoordinate(targetCol, targetRow, 0, 0);
                createParticles(
                  tileCoord.tilex + game.level.tilewidth / 2,
                  tileCoord.tiley + game.level.tileheight / 2,
                  80,  // パーティクル大幅増量（リッチ感UP）
                  '#ff6400'
                );
                game.level.tiles[targetCol][targetRow].type = -1;
                game.level.tiles[targetCol][targetRow].special = null;
              }
            }
          }

          // タイルシフト情報を計算
          for (let i = 0; i < game.level.columns; i++) {
            let shift = 0;
            for (let j = game.level.rows - 1; j >= 0; j--) {
              if (game.level.tiles[i][j].type === -1) {
                shift++;
                game.level.tiles[i][j].shift = 0;
              } else {
                game.level.tiles[i][j].shift = shift;
              }
            }
          }

          // タイルを実際に落として新しいタイルを補充
          shiftTiles();

          // 新しいクラスターをチェック
          findClusters();
          if (game.clusters.length > 0) {
            // 連鎖が発生する場合
            game.gamestate = game.gamestates.resolve;
            game.animationstate = 2;
            game.animationtime = 0;
          }
        }
      });

      // 初期フレアを生成（中心に集まる光の粒）- 数を増やしてリッチに
      const effect = game.specialEffects[game.specialEffects.length - 1];
      for (let i = 0; i < 24; i++) {  // 16 → 24（1.5倍）
        const angle = (Math.PI * 2 * i) / 24;
        const distance = game.level.tilewidth * 3;
        effect.flares.push({
          startX: centerX + Math.cos(angle) * distance,
          startY: centerY + Math.sin(angle) * distance,
          targetX: centerX,
          targetY: centerY,
          color: `hsl(${i * 15}, 100%, 60%)`
        });
      }

      // 画面揺れ（強度を3倍、時間を2倍）
      game.screenShake.active = true;
      game.screenShake.intensity = 45;  // 30 → 45（1.5倍）
      game.screenShake.duration = 1.5;  // 1.0秒 → 1.5秒

      // ボーナスダメージ（カラーボムは超強力）- 半減調整
      game.enemyHP = Math.max(0, game.enemyHP - 25);
      setEnemyHP(game.enemyHP);
      console.log(`💥 カラーボムで25ダメージ！`);
      addBattleLog(`💥 カラーボム！ 25ダメージ`, '#ff00ff');
    };

    const shiftTiles = () => {
      for (let i = 0; i < game.level.columns; i++) {
        for (let j = game.level.rows - 1; j >= 0; j--) {
          if (game.level.tiles[i][j].type === -1) {
            game.level.tiles[i][j].type = getRandomTile();
          } else {
            const shift = game.level.tiles[i][j].shift;
            if (shift > 0) {
              swap(i, j, i, j + shift);
            }
          }

          game.level.tiles[i][j].shift = 0;
        }
      }
    };

    const swap = (x1, y1, x2, y2) => {
      // type, special, specialDirection を交換（特殊タイルの落下に必要）
      const typeswap = game.level.tiles[x1][y1].type;
      const specialswap = game.level.tiles[x1][y1].special;
      const specialDirectionSwap = game.level.tiles[x1][y1].specialDirection;

      game.level.tiles[x1][y1].type = game.level.tiles[x2][y2].type;
      game.level.tiles[x1][y1].special = game.level.tiles[x2][y2].special;
      game.level.tiles[x1][y1].specialDirection = game.level.tiles[x2][y2].specialDirection;

      game.level.tiles[x2][y2].type = typeswap;
      game.level.tiles[x2][y2].special = specialswap;
      game.level.tiles[x2][y2].specialDirection = specialDirectionSwap;
    };

    const mouseSwap = (c1, r1, c2, r2) => {
      game.currentmove = { column1: c1, row1: r1, column2: c2, row2: r2 };
      // 最後に動かしたタイルの位置を記録（c2, r2が移動先）
      game.lastSwappedTile = { column: c2, row: r2 };
      // スワップ方向を記録
      if (c1 === c2) {
        game.lastSwapDirection = 'vertical'; // 縦スワップ（同じ列）
      } else {
        game.lastSwapDirection = 'horizontal'; // 横スワップ（同じ行）
      }
      game.level.selectedtile.selected = false;
      game.animationstate = 2;
      game.animationtime = 0;
      game.gamestate = game.gamestates.resolve;
    };

    const getMouseTile = (pos) => {
      const tx = Math.floor((pos.x - game.level.x) / game.level.tilewidth);
      const ty = Math.floor((pos.y - game.level.y) / game.level.tileheight);

      if (tx >= 0 && tx < game.level.columns && ty >= 0 && ty < game.level.rows) {
        return { valid: true, x: tx, y: ty };
      }

      return { valid: false, x: 0, y: 0 };
    };

    const canSwap = (x1, y1, x2, y2) => {
      return (Math.abs(x1 - x2) === 1 && y1 === y2) ||
             (Math.abs(y1 - y2) === 1 && x1 === x2);
    };

    const getMousePos = (canvas, e) => {
      const rect = canvas.getBoundingClientRect();
      // 論理サイズ（表示サイズ）に基づいて座標を計算
      const logicalWidth = 550;
      const logicalHeight = 700;
      return {
        x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * logicalWidth),
        y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * logicalHeight)
      };
    };

    // マウスイベント
    const onMouseDown = (e) => {
      if (game.gamestate !== game.gamestates.ready) return;

      const pos = getMousePos(canvas, e);
      const mt = getMouseTile(pos);

      if (mt.valid) {
        const clickedTile = game.level.tiles[mt.x][mt.y];

        // 特殊タイルをクリックした場合、即座に発動
        if (clickedTile.special === 'lineBomb') {
          console.log('🧃 レインボードリンクをクリック！');
          activateLineBomb(mt.x, mt.y);
          // 選択をクリア
          game.level.selectedtile.selected = false;
          // タイルシフトと連鎖チェックのためにresolve状態へ
          game.animationstate = 1; // シフト状態
          game.animationtime = 0;
          game.gamestate = game.gamestates.resolve;
          return;
        } else if (clickedTile.special === 'colorBomb') {
          console.log('⚛️ レインボーオーブをクリック！');
          activateColorBomb(mt.x, mt.y);
          // 選択をクリア
          game.level.selectedtile.selected = false;
          // タイルシフトと連鎖チェックのためにresolve状態へ
          game.animationstate = 1; // シフト状態
          game.animationtime = 0;
          game.gamestate = game.gamestates.resolve;
          return;
        }

        // 通常タイルの処理
        // すでに選択されているタイルをクリックした場合
        if (game.level.selectedtile.selected) {
          if (mt.x === game.level.selectedtile.column && mt.y === game.level.selectedtile.row) {
            // 同じタイルを再クリック → 選択解除
            game.level.selectedtile.selected = false;
            return;
          } else if (canSwap(mt.x, mt.y, game.level.selectedtile.column, game.level.selectedtile.row)) {
            // 隣接タイルをクリック → スワップ実行（クリック&クリック方式）
            mouseSwap(mt.x, mt.y, game.level.selectedtile.column, game.level.selectedtile.row);
            return;
          } else {
            // 隣接していないタイルをクリック → 新しい選択に切り替え
            game.level.selectedtile.column = mt.x;
            game.level.selectedtile.row = mt.y;
            game.level.selectedtile.selected = true;
          }
        } else {
          // 初回選択
          game.level.selectedtile.column = mt.x;
          game.level.selectedtile.row = mt.y;
          game.level.selectedtile.selected = true;
        }

        // ドラッグ開始
        game.drag = true;
        game.dragStartX = mt.x;
        game.dragStartY = mt.y;
      } else {
        game.level.selectedtile.selected = false;
      }
    };

    const onMouseMove = (e) => {
      if (!game.drag || game.gamestate !== game.gamestates.ready) return;

      const pos = getMousePos(canvas, e);
      const mt = getMouseTile(pos);

      // ドラッグ中に隣接タイルへ移動したらスワップ（ドラッグ方式）
      if (mt.valid && game.dragStartX !== undefined && game.dragStartY !== undefined) {
        if ((mt.x !== game.dragStartX || mt.y !== game.dragStartY) &&
            canSwap(mt.x, mt.y, game.dragStartX, game.dragStartY)) {
          // ドラッグでスワップ実行
          mouseSwap(mt.x, mt.y, game.dragStartX, game.dragStartY);
          game.drag = false; // スワップ後はドラッグ終了
          game.dragStartX = undefined;
          game.dragStartY = undefined;
        }
      }
    };

    const onMouseUp = () => {
      game.drag = false;
      game.dragStartX = undefined;
      game.dragStartY = undefined;
    };

    const onMouseOut = () => {
      game.drag = false;
      game.dragStartX = undefined;
      game.dragStartY = undefined;
    };

    init();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseout', onMouseOut);
    };
  }, [onClear, onGameOver, stage]);

  // コンテニュー処理
  const handleContinue = () => {
    if (!saveData || !updateSaveData) {
      console.error('セーブデータが利用できません');
      return;
    }

    // 現在のキャラクターのコンテニュー回数を取得
    const continueKey = `${selectedCharacter}_continues`;
    const currentContinues = saveData[continueKey] || 0;

    if (currentContinues >= 3) {
      // 3回使い切った場合、ステージ1にリセット
      alert('コンテニュー回数を使い切りました。ステージ1からやり直します。');
      const updatedSaveData = {
        ...saveData,
        [continueKey]: 0 // コンテニュー回数をリセット
      };
      updateSaveData(updatedSaveData);

      // ステージ1にリセット
      if (onResetToStage1) {
        onResetToStage1();
      }
      return;
    }

    // コンテニュー回数を増やす
    const updatedSaveData = {
      ...saveData,
      [continueKey]: currentContinues + 1
    };
    updateSaveData(updatedSaveData);

    console.log(`コンテニュー使用: ${currentContinues + 1}/3回目`);

    // HP全回復してゲーム再開
    const game = gameStateRef.current;
    game.playerHP = playerMaxHP;
    game.enemyHP = game.enemyMaxHP;
    game.gameover = false;
    setPlayerHP(playerMaxHP);
    setEnemyHP(game.enemyMaxHP);
    setShowGameOverDialog(false);
  };

  // タイトルに戻る
  const handleReturnToTitle = () => {
    setShowGameOverDialog(false);
    onGameOver();
  };

  // コンテニュー残り回数を計算
  const continueKey = `${selectedCharacter}_continues`;
  const currentContinues = saveData ? (saveData[continueKey] || 0) : 0;
  const remainingContinues = 3 - currentContinues;

  return (
    <div className="match3-puzzle-container">
      <div className="match3-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="match3-canvas"
        />
      </div>

      {/* ゲームオーバーダイアログ */}
      {showGameOverDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#2d1b1b',
            border: '3px solid #DC143C',
            borderRadius: '15px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '400px',
            boxShadow: '0 0 30px rgba(220, 20, 60, 0.5)'
          }}>
            <h2 style={{
              color: '#ff4444',
              fontSize: '32px',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              敗北...
            </h2>

            <p style={{
              color: '#ffffff',
              fontSize: '16px',
              marginBottom: '10px'
            }}>
              意識を奪われてしまった...
            </p>

            {remainingContinues > 0 ? (
              <p style={{
                color: '#ffdd44',
                fontSize: '14px',
                marginBottom: '30px'
              }}>
                残りコンテニュー: {remainingContinues}回
              </p>
            ) : (
              <p style={{
                color: '#ff4444',
                fontSize: '14px',
                marginBottom: '30px',
                fontWeight: 'bold'
              }}>
                ⚠ コンテニュー回数を使い切りました ⚠
              </p>
            )}

            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleReturnToTitle}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#555555',
                  color: '#ffffff',
                  border: '2px solid #888888',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minWidth: '140px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#666666';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#555555';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                タイトルに戻る
              </button>

              <button
                onClick={handleContinue}
                disabled={remainingContinues <= 0}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: remainingContinues > 0 ? '#44ff44' : '#333333',
                  color: remainingContinues > 0 ? '#000000' : '#666666',
                  border: `2px solid ${remainingContinues > 0 ? '#00ff00' : '#555555'}`,
                  borderRadius: '8px',
                  cursor: remainingContinues > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  minWidth: '140px',
                  opacity: remainingContinues > 0 ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (remainingContinues > 0) {
                    e.target.style.backgroundColor = '#55ff55';
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (remainingContinues > 0) {
                    e.target.style.backgroundColor = '#44ff44';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                コンテニュー
                <br />
                <span style={{ fontSize: '12px' }}>（HP全回復）</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Match3Puzzle;
