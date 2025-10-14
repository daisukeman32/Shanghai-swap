import React, { useRef, useEffect, useState } from 'react';
import './Match3Puzzle.css';

/**
 * Match-3 Puzzle Game (Candy Crush風)
 * Based on: rembound/Match-3-Game-HTML5 (GPL v3)
 * Customized for: Shanghai-swap game
 */

function Match3Puzzle({ onClear, onGameOver, stage = 1, selectedCharacter = 'airi' }) {
  const canvasRef = useRef(null);

  // バトル用ステート
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(80);
  const [playerMaxHP] = useState(100);
  const [enemyMaxHP, setEnemyMaxHP] = useState(80);
  const [defenseBonus, setDefenseBonus] = useState(0); // 防御バフ（%）
  const [ultimateGauge, setUltimateGauge] = useState(0); // 必殺技ゲージ（0-100）
  const [turnCount, setTurnCount] = useState(0);
  const [battleLog, setBattleLog] = useState([]);

  const gameStateRef = useRef({
    level: {
      x: 62,
      y: 265,
      columns: 5,
      rows: 5,
      tilewidth: 85,
      tileheight: 85,
      tiles: [],
      selectedtile: { selected: false, column: 0, row: 0 }
    },
    tilecolors: [
      [255, 60, 60],    // 🔴 赤（攻撃）
      [60, 140, 255],   // 🔵 青（防御）
      [60, 220, 100],   // 🟢 緑（回復）
      [255, 220, 60],   // 🟡 黄（スキル）
      [240, 240, 240]   // ⚪ 白（必殺技）
    ],
    characters: [
      { name: '攻撃', initial: '⚔', description: '相手にダメージ' },
      { name: '防御', initial: '🛡', description: '防御バフ' },
      { name: '回復', initial: '❤', description: 'HP回復' },
      { name: 'スキル', initial: '⚡', description: 'コンボ倍率UP' },
      { name: '必殺技', initial: '★', description: '必殺技ゲージ' }
    ],
    clusters: [],
    moves: [],
    currentmove: { column1: 0, row1: 0, column2: 0, row2: 0 },
    gamestates: { init: 0, ready: 1, resolve: 2, enemyTurn: 3 },
    gamestate: 0,
    playerHP: 100,
    playerMaxHP: 100,
    enemyHP: 80,
    enemyMaxHP: 80,
    defenseBonus: 0,
    ultimateGauge: 0,
    turnCount: 0,
    comboMultiplier: 1.0,
    animationstate: 0,
    animationtime: 0,
    animationtimetotal: 0.3,
    drag: false,
    gameover: false,
    cleared: false,
    particles: [],
    specialEffects: [],
    screenShake: { active: false, intensity: 0, duration: 0 },
    battleLog: [],
    // キャラクター画像
    playerImage: null,
    enemyImage: null,
    imagesLoaded: false
  });

  // キャラクター画像の読み込み
  useEffect(() => {
    const game = gameStateRef.current;

    // 主人公の画像
    const playerImg = new Image();
    playerImg.src = '/assets/characters/protagonist/protagonist_default.png';
    playerImg.onload = () => {
      game.playerImage = playerImg;
      checkImagesLoaded();
    };
    playerImg.onerror = () => {
      console.warn('主人公画像の読み込み失敗');
      checkImagesLoaded();
    };

    // 相手キャラの画像
    const enemyImg = new Image();
    enemyImg.src = `/assets/characters/${selectedCharacter}/${selectedCharacter}_default.png`;
    enemyImg.onload = () => {
      game.enemyImage = enemyImg;
      checkImagesLoaded();
    };
    enemyImg.onerror = () => {
      console.warn('相手キャラ画像の読み込み失敗');
      checkImagesLoaded();
    };

    function checkImagesLoaded() {
      game.imagesLoaded = true;
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
          game.level.tiles[i][j] = { type: 0, shift: 0, special: null };
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

      // 特殊エフェクト更新
      game.specialEffects = game.specialEffects.filter(e => {
        e.time += dt;
        return e.time < e.duration;
      });

      // 画面揺れ更新
      if (game.screenShake.active) {
        game.screenShake.duration -= dt;
        if (game.screenShake.duration <= 0) {
          game.screenShake.active = false;
        }
      }

      if (game.gamestate === game.gamestates.ready) {
        // ゲームオーバーチェック（プレイヤーHP0以下）
        if (game.playerHP <= 0 && !game.gameover) {
          game.gameover = true;
          setTimeout(() => onGameOver(), 2000);
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
      const headerHeight = 245; // 35%

      // 背景（ダークテーマ）
      ctx.fillStyle = '#1a0a0a';
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // ヘッダー（35%）
      ctx.fillStyle = '#2d1b1b';
      ctx.fillRect(0, 0, logicalWidth, headerHeight);

      // タイトル（中央上部）
      ctx.fillStyle = '#DC143C';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('スワップバトル', logicalWidth / 2, 25);
      ctx.textAlign = 'left';

      // 色説明（タイトル下）
      ctx.font = '11px sans-serif';
      const legendY = 50;
      const legendSpacing = 55;
      ctx.fillStyle = '#ff4444';
      ctx.textAlign = 'center';
      ctx.fillText('⚔攻撃', logicalWidth / 2 - legendSpacing * 2, legendY);
      ctx.fillStyle = '#44aaff';
      ctx.fillText('🛡防御', logicalWidth / 2 - legendSpacing, legendY);
      ctx.fillStyle = '#44ff88';
      ctx.fillText('❤回復', logicalWidth / 2, legendY);
      ctx.fillStyle = '#ffdd44';
      ctx.fillText('⚡技', logicalWidth / 2 + legendSpacing, legendY);
      ctx.fillStyle = '#eeeeee';
      ctx.fillText('★必殺', logicalWidth / 2 + legendSpacing * 2, legendY);
      ctx.textAlign = 'left';

      // 【左側】相手キャラクター表示
      const enemyPortraitX = 60;
      const enemyPortraitY = 105;
      const portraitRadius = 40;

      drawCharacterPortrait(ctx, enemyPortraitX, enemyPortraitY, portraitRadius, game.enemyImage, '#ff4444', '相手');

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('相手', 110, 80);

      // 相手HPバー（横長）
      drawHPBar(ctx, 110, 95, 180, 20, game.enemyHP, game.enemyMaxHP, '#ff4444');

      // 【右側】プレイヤーキャラクター表示
      const playerPortraitX = logicalWidth - 60;
      const playerPortraitY = 105;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('あなた', logicalWidth - 110, 80);
      ctx.textAlign = 'left';

      // プレイヤーHPバー（横長）
      drawHPBar(ctx, logicalWidth - 290, 95, 180, 20, game.playerHP, game.playerMaxHP, '#44ff44');

      drawCharacterPortrait(ctx, playerPortraitX, playerPortraitY, portraitRadius, game.playerImage, '#44ff44', 'あなた');

      // 【中央】ターン表示
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`TURN ${game.turnCount}`, logicalWidth / 2, 105);
      ctx.textAlign = 'left';

      // 【下部】必殺技ゲージ（中央大きく）
      const gaugeX = logicalWidth / 2 - 120;
      const gaugeY = 150;
      ctx.fillStyle = '#ffdd44';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('必殺技ゲージ', logicalWidth / 2, gaugeY - 5);
      ctx.textAlign = 'left';
      drawGaugeBar(ctx, gaugeX, gaugeY, 240, 18, game.ultimateGauge, 100, '#ffdd44');

      // ステータス表示（ゲージ下）
      const statusY = 190;
      ctx.textAlign = 'center';

      if (game.defenseBonus > 0) {
        ctx.fillStyle = '#44ccff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`🛡 防御: +${Math.floor(game.defenseBonus)}%`, logicalWidth / 2 - 80, statusY);
      }

      if (game.comboMultiplier > 1.0) {
        ctx.fillStyle = '#ffdd44';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`⚡ コンボ: x${game.comboMultiplier.toFixed(1)}`, logicalWidth / 2 + 80, statusY);
      }

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

      // ゲームオーバー/クリア表示
      if (game.gameover) {
        ctx.fillStyle = 'rgba(139, 0, 0, 0.9)';
        ctx.fillRect(game.level.x, game.level.y, levelwidth, levelheight);

        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 36px sans-serif';
        const text = '敗北...';
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, game.level.x + (levelwidth - textWidth) / 2, game.level.y + levelheight / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        const text2 = '意識を奪われた...';
        const textWidth2 = ctx.measureText(text2).width;
        ctx.fillText(text2, game.level.x + (levelwidth - textWidth2) / 2, game.level.y + levelheight / 2 + 20);
      }

      if (game.cleared) {
        ctx.fillStyle = 'rgba(0, 100, 0, 0.85)';
        ctx.fillRect(game.level.x, game.level.y, levelwidth, levelheight);

        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 36px sans-serif';
        const text = '勝利！';
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, game.level.x + (levelwidth - textWidth) / 2, game.level.y + levelheight / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        const text2 = '入れ替わりに成功した...';
        const textWidth2 = ctx.measureText(text2).width;
        ctx.fillText(text2, game.level.x + (levelwidth - textWidth2) / 2, game.level.y + levelheight / 2 + 20);
      }
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
      // キャラクタータイル（円形+大きなアイコン）の描画
      const centerX = x + game.level.tilewidth / 2;
      const centerY = y + game.level.tileheight / 2;
      const radius = game.level.tilewidth * 0.45; // 少し大きく

      // 外側の光彩エフェクト（より強力に）
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 外側のグロー（3層）
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + (i * 3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 - i * 0.1})`;
        ctx.fill();
      }

      // 影をリセット
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // 影（ドロップシャドウ）
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;

      // 円形の背景
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

      // より鮮やかなグラデーション（4段階）
      const gradient = ctx.createRadialGradient(
        centerX - radius / 2,
        centerY - radius / 2,
        radius / 10,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, `rgb(${Math.min(r + 100, 255)}, ${Math.min(g + 100, 255)}, ${Math.min(b + 100, 255)})`);
      gradient.addColorStop(0.2, `rgb(${Math.min(r + 60, 255)}, ${Math.min(g + 60, 255)}, ${Math.min(b + 60, 255)})`);
      gradient.addColorStop(0.6, `rgb(${r}, ${g}, ${b})`);
      gradient.addColorStop(1, `rgb(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 0.5)})`);

      ctx.fillStyle = gradient;
      ctx.fill();

      // 影をリセット
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 外側の枠線（濃いめ・太め）
      ctx.strokeStyle = `rgb(${Math.floor(r * 0.3)}, ${Math.floor(g * 0.3)}, ${Math.floor(b * 0.3)})`;
      ctx.lineWidth = 4;
      ctx.stroke();

      // 内側の枠線（光沢効果）
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // ハイライト（左上の光沢・強化）
      ctx.beginPath();
      ctx.arc(centerX - radius / 2.5, centerY - radius / 2.5, radius / 3, 0, Math.PI * 2);
      const highlightGradient = ctx.createRadialGradient(
        centerX - radius / 2.5,
        centerY - radius / 2.5,
        0,
        centerX - radius / 2.5,
        centerY - radius / 2.5,
        radius / 3
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.fill();

      // キャラクターの絵文字アイコン（大きく）
      if (tileType !== undefined && game.characters[tileType]) {
        const character = game.characters[tileType];
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.font = 'bold 42px sans-serif'; // タイルサイズに合わせて拡大
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // テキストの影（強化）
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.fillText(character.initial, centerX, centerY);

        // 影をリセット
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      // 特殊アイテムの視覚エフェクト
      if (special) {
        if (special === 'lineBomb') {
          // ラインボム: 十字線
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
          ctx.lineWidth = 3;
          ctx.shadowColor = 'rgba(255, 255, 0, 0.6)';
          ctx.shadowBlur = 5;

          // 横線
          ctx.beginPath();
          ctx.moveTo(centerX - radius * 0.6, centerY);
          ctx.lineTo(centerX + radius * 0.6, centerY);
          ctx.stroke();

          // 縦線
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - radius * 0.6);
          ctx.lineTo(centerX, centerY + radius * 0.6);
          ctx.stroke();

          // 影をリセット
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        } else if (special === 'colorBomb') {
          // カラーボム: 爆発マーク（星型）
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
          ctx.shadowBlur = 8;

          // 星型を描画
          const spikes = 8;
          const outerRadius = radius * 0.5;
          const innerRadius = radius * 0.25;

          ctx.beginPath();
          for (let i = 0; i < spikes * 2; i++) {
            const rad = (Math.PI * 2 * i) / (spikes * 2);
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const px = centerX + Math.cos(rad) * r;
            const py = centerY + Math.sin(rad) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();

          // 影をリセット
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
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
        // 画像の上部45%（顔部分）を切り取って描画
        const imgWidth = image.width;
        const imgHeight = image.height;

        // 顔部分を切り取る設定（上部45%の正方形領域）
        const sHeight = imgHeight * 0.45; // 高さの上45%
        const sWidth = sHeight; // 正方形にする
        const sx = (imgWidth - sWidth) / 2; // 中央寄せ
        const sy = 0; // 上端から

        // 円形に合わせて描画
        const size = radius * 2;
        ctx.drawImage(
          image,
          sx, sy, sWidth, sHeight, // 元画像の切り取り領域
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

      // テキスト（HP数値）
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.floor(current)} / ${max}`, x + width / 2, y + height / 2);
      ctx.textAlign = 'left';
    };

    // ゲージバー描画
    const drawGaugeBar = (ctx, x, y, width, height, current, max, color) => {
      // 背景（黒）
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, width, height);

      // ゲージバー
      const percent = Math.max(0, Math.min(1, current / max));
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width * percent, height);

      // 枠線
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // テキスト（%）
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.floor(current)}%`, x + width / 2, y + height / 2);
      ctx.textAlign = 'left';
    };

    // 特殊エフェクト描画
    const renderSpecialEffects = (ctx) => {
      game.specialEffects.forEach(e => {
        const progress = e.time / e.duration;
        ctx.save();

        if (e.type === 'lineBomb') {
          // ラインボムエフェクト（ビーム）
          const alpha = 1 - progress;
          ctx.globalAlpha = alpha;

          const gradient = e.horizontal
            ? ctx.createLinearGradient(e.x1, e.y1, e.x2, e.y1)
            : ctx.createLinearGradient(e.x1, e.y1, e.x1, e.y2);

          gradient.addColorStop(0, 'rgba(255, 255, 0, 0)');
          gradient.addColorStop(0.5, `rgba(255, 255, 0, ${alpha})`);
          gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

          ctx.fillStyle = gradient;
          ctx.shadowColor = '#ffff00';
          ctx.shadowBlur = 20;

          const width = e.horizontal ? e.x2 - e.x1 : 30;
          const height = e.horizontal ? 30 : e.y2 - e.y1;
          ctx.fillRect(e.x1 - (e.horizontal ? 0 : 15), e.y1 - (e.horizontal ? 15 : 0), width, height);

        } else if (e.type === 'colorBomb') {
          // カラーボムエフェクト（爆発波）
          const radius = e.radius * progress;
          const alpha = 1 - progress;
          ctx.globalAlpha = alpha;

          // 外側の波
          ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
          ctx.lineWidth = 10;
          ctx.shadowColor = '#ff6400';
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
          ctx.stroke();

          // 内側の波
          if (progress > 0.3) {
            const innerRadius = e.radius * (progress - 0.3) / 0.7;
            ctx.strokeStyle = `rgba(255, 200, 0, ${alpha * 0.7})`;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(e.x, e.y, innerRadius, 0, Math.PI * 2);
            ctx.stroke();
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
      let comboBoost = 0;
      let ultimateCharge = 0;

      // 各クラスターの効果を集計
      for (let i = 0; i < game.clusters.length; i++) {
        const cluster = game.clusters[i];
        const tileType = game.level.tiles[cluster.column][cluster.row].type;
        const matchCount = cluster.length;

        switch (tileType) {
          case 0: // 🔴 赤（攻撃）
            if (matchCount === 3) totalDamage += 15;
            else if (matchCount === 4) totalDamage += 25;
            else totalDamage += 40;
            break;

          case 1: // 🔵 青（防御）
            if (matchCount === 3) totalDefense += 30;
            else if (matchCount === 4) totalDefense += 50;
            else totalDefense += 80;
            break;

          case 2: // 🟢 緑（回復）
            if (matchCount === 3) totalHeal += 10;
            else if (matchCount === 4) totalHeal += 20;
            else totalHeal += 35;
            break;

          case 3: // 🟡 黄（スキル）
            if (matchCount === 3) comboBoost += 0.5;
            else if (matchCount === 4) comboBoost += 1.0;
            else comboBoost += 1.5;
            break;

          case 4: // ⚪ 白（必殺技）
            if (matchCount === 3) ultimateCharge += 20;
            else if (matchCount === 4) ultimateCharge += 40;
            else ultimateCharge += 70;
            break;
        }
      }

      // 防御バフを適用
      game.defenseBonus += totalDefense;
      setDefenseBonus(game.defenseBonus);

      // コンボ倍率を適用
      game.comboMultiplier = Math.min(3.0, 1.0 + comboBoost);

      // 攻撃ダメージを計算（コンボ倍率適用）
      totalDamage = Math.floor(totalDamage * game.comboMultiplier);

      if (totalDamage > 0) {
        game.enemyHP = Math.max(0, game.enemyHP - totalDamage);
        setEnemyHP(game.enemyHP);
        console.log(`⚔ 攻撃: ${totalDamage}ダメージ！ 相手HP: ${game.enemyHP}`);

        // 画面揺れ
        game.screenShake.active = true;
        game.screenShake.intensity = totalDamage / 3;
        game.screenShake.duration = 0.2;
      }

      // HP回復
      if (totalHeal > 0) {
        game.playerHP = Math.min(game.playerMaxHP, game.playerHP + totalHeal);
        setPlayerHP(game.playerHP);
        console.log(`❤ 回復: ${totalHeal}HP回復！`);
      }

      // 必殺技ゲージ蓄積
      if (ultimateCharge > 0) {
        game.ultimateGauge = Math.min(100, game.ultimateGauge + ultimateCharge);
        setUltimateGauge(game.ultimateGauge);
        console.log(`★ 必殺技ゲージ: ${ultimateCharge}%チャージ！`);
      }

      // ターンカウント増加
      game.turnCount++;
      setTurnCount(game.turnCount);
    };

    // 相手の攻撃
    const enemyAttack = () => {
      // 2ターンに1回攻撃（50%の確率で攻撃）
      if (game.turnCount % 2 !== 0) {
        console.log('相手は様子を見ている...');
        return;
      }

      // ダメージ計算（防御バフで軽減）
      const baseDamage = game.enemyAttack || 15;
      const defenseMitigation = Math.min(0.8, game.defenseBonus / 100); // 最大80%軽減
      const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - defenseMitigation))); // 最低1ダメージ

      game.playerHP = Math.max(0, game.playerHP - finalDamage);
      setPlayerHP(game.playerHP);

      console.log(`💀 相手の攻撃: ${finalDamage}ダメージ！ (ベース: ${baseDamage}, 防御: -${Math.floor(baseDamage - finalDamage)})`);

      // 防御バフを減衰
      game.defenseBonus = Math.max(0, game.defenseBonus - 20);
      setDefenseBonus(game.defenseBonus);

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
      game.comboMultiplier = 1.0;
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

    const getRandomTile = () => {
      return Math.floor(Math.random() * game.tilecolors.length);
    };

    const resolveClusters = () => {
      findClusters();

      while (game.clusters.length > 0) {
        removeClusters();
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

              // 特殊アイテム生成判定
              if (matchlength >= 5) {
                cluster.special = 'colorBomb'; // 5個消し → カラーボム
              } else if (matchlength === 4) {
                cluster.special = 'lineBomb'; // 4個消し → ラインボム
              }

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

              // 特殊アイテム生成判定
              if (matchlength >= 5) {
                cluster.special = 'colorBomb'; // 5個消し → カラーボム
              } else if (matchlength === 4) {
                cluster.special = 'lineBomb'; // 4個消し → ラインボム
              }

              game.clusters.push(cluster);
            }
            matchlength = 1;
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

    const removeClusters = () => {
      // まず特殊アイテムの発動をチェック
      for (let i = 0; i < game.clusters.length; i++) {
        const cluster = game.clusters[i];
        let coffset = 0;
        let roffset = 0;

        // クラスター内に既存の特殊アイテムがあるかチェック
        for (let j = 0; j < cluster.length; j++) {
          const currentCol = cluster.column + coffset;
          const currentRow = cluster.row + roffset;
          const tile = game.level.tiles[currentCol][currentRow];

          // 既存の特殊アイテムを発動
          if (tile.special === 'lineBomb') {
            activateLineBomb(currentCol, currentRow);
          } else if (tile.special === 'colorBomb') {
            activateColorBomb(currentCol, currentRow);
          }

          if (cluster.horizontal) {
            coffset++;
          } else {
            roffset++;
          }
        }
      }

      // 次に通常のクラスター削除処理
      for (let i = 0; i < game.clusters.length; i++) {
        const cluster = game.clusters[i];
        let coffset = 0;
        let roffset = 0;

        // 特殊アイテムを生成する場合、中央の1つを特殊タイルとして残す
        let specialTilePos = null;
        if (cluster.special) {
          // クラスターの中央位置を計算
          const centerIndex = Math.floor(cluster.length / 2);
          if (cluster.horizontal) {
            specialTilePos = { column: cluster.column + centerIndex, row: cluster.row };
          } else {
            specialTilePos = { column: cluster.column, row: cluster.row + centerIndex };
          }
        }

        for (let j = 0; j < cluster.length; j++) {
          const currentCol = cluster.column + coffset;
          const currentRow = cluster.row + roffset;

          // 特殊タイル位置なら、特殊アイテムとして残す
          if (specialTilePos && currentCol === specialTilePos.column && currentRow === specialTilePos.row) {
            game.level.tiles[currentCol][currentRow].special = cluster.special;
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

    // ラインボム発動：横または縦1列を全消去
    const activateLineBomb = (col, row) => {
      console.log(`⚡ ラインボム発動！ at (${col}, ${row})`);

      // ランダムで横または縦を決定
      const horizontal = Math.random() < 0.5;

      // タイル座標を取得
      const coord = getTileCoordinate(col, row, 0, 0);
      const centerX = coord.tilex + game.level.tilewidth / 2;
      const centerY = coord.tiley + game.level.tileheight / 2;

      // ビームエフェクト追加
      if (horizontal) {
        game.specialEffects.push({
          type: 'lineBomb',
          horizontal: true,
          x1: game.level.x,
          y1: centerY,
          x2: game.level.x + game.level.columns * game.level.tilewidth,
          y2: centerY,
          time: 0,
          duration: 0.4
        });

        // 横1列削除
        for (let i = 0; i < game.level.columns; i++) {
          const tileCoord = getTileCoordinate(i, row, 0, 0);
          createParticles(
            tileCoord.tilex + game.level.tilewidth / 2,
            tileCoord.tiley + game.level.tileheight / 2,
            8,
            '#ffff00'
          );
          game.level.tiles[i][row].type = -1;
          game.level.tiles[i][row].special = null;
        }
      } else {
        game.specialEffects.push({
          type: 'lineBomb',
          horizontal: false,
          x1: centerX,
          y1: game.level.y,
          x2: centerX,
          y2: game.level.y + game.level.rows * game.level.tileheight,
          time: 0,
          duration: 0.4
        });

        // 縦1列削除
        for (let j = 0; j < game.level.rows; j++) {
          const tileCoord = getTileCoordinate(col, j, 0, 0);
          createParticles(
            tileCoord.tilex + game.level.tilewidth / 2,
            tileCoord.tiley + game.level.tileheight / 2,
            8,
            '#ffff00'
          );
          game.level.tiles[col][j].type = -1;
          game.level.tiles[col][j].special = null;
        }
      }

      // ボーナスダメージ（ラインボムは強力）
      game.enemyHP = Math.max(0, game.enemyHP - 30);
      setEnemyHP(game.enemyHP);
      console.log(`⚡ ラインボムで30ダメージ！`);
    };

    // カラーボム発動：周囲3×3を爆破
    const activateColorBomb = (col, row) => {
      console.log(`💥 カラーボム発動！ at (${col}, ${row})`);

      // タイル座標を取得
      const coord = getTileCoordinate(col, row, 0, 0);
      const centerX = coord.tilex + game.level.tilewidth / 2;
      const centerY = coord.tiley + game.level.tileheight / 2;

      // 爆発エフェクト追加
      game.specialEffects.push({
        type: 'colorBomb',
        x: centerX,
        y: centerY,
        radius: game.level.tilewidth * 2.5,
        time: 0,
        duration: 0.6
      });

      // 画面揺れ
      game.screenShake.active = true;
      game.screenShake.intensity = 15;
      game.screenShake.duration = 0.5;

      // 周囲3×3範囲を削除
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
              12,
              '#ff6400'
            );
            game.level.tiles[targetCol][targetRow].type = -1;
            game.level.tiles[targetCol][targetRow].special = null;
          }
        }
      }

      // ボーナスダメージ（カラーボムは超強力）
      game.enemyHP = Math.max(0, game.enemyHP - 50);
      setEnemyHP(game.enemyHP);
      console.log(`💥 カラーボムで50ダメージ！`);
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
      const typeswap = game.level.tiles[x1][y1].type;
      game.level.tiles[x1][y1].type = game.level.tiles[x2][y2].type;
      game.level.tiles[x2][y2].type = typeswap;
    };

    const mouseSwap = (c1, r1, c2, r2) => {
      game.currentmove = { column1: c1, row1: r1, column2: c2, row2: r2 };
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

  return (
    <div className="match3-puzzle-container">
      <div className="match3-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="match3-canvas"
        />
      </div>
    </div>
  );
}

export default Match3Puzzle;
