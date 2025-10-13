import React, { useRef, useEffect, useState } from 'react';
import './Match3Puzzle.css';

/**
 * Match-3 Puzzle Game (Candy Crush風)
 * Based on: rembound/Match-3-Game-HTML5 (GPL v3)
 * Customized for: Shanghai-swap game
 */

function Match3Puzzle({ onClear, onGameOver, stage = 1 }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(30);
  const [targetScore, setTargetScore] = useState(1000);
  const gameStateRef = useRef({
    level: {
      x: 50,
      y: 100,
      columns: 8,
      rows: 8,
      tilewidth: 50,
      tileheight: 50,
      tiles: [],
      selectedtile: { selected: false, column: 0, row: 0 }
    },
    tilecolors: [
      [220, 20, 60],    // Ruby (ルビー) - 深紅
      [0, 201, 87],     // Emerald (エメラルド) - 深緑
      [15, 82, 186],    // Sapphire (サファイア) - 青
      [255, 200, 0],    // Topaz (トパーズ) - 黄金
      [153, 50, 204],   // Amethyst (アメジスト) - 紫
      [127, 255, 212],  // Aquamarine (アクアマリン) - 青緑
      [230, 230, 250]   // Diamond (ダイヤモンド) - 白
    ],
    gemNames: ['Ruby', 'Emerald', 'Sapphire', 'Topaz', 'Amethyst', 'Aquamarine', 'Diamond'],
    clusters: [],
    moves: [],
    currentmove: { column1: 0, row1: 0, column2: 0, row2: 0 },
    gamestates: { init: 0, ready: 1, resolve: 2 },
    gamestate: 0,
    score: 0,
    movesLeft: 30,
    targetScore: 1000,
    animationstate: 0,
    animationtime: 0,
    animationtimetotal: 0.3,
    drag: false,
    gameover: false,
    cleared: false
  });

  useEffect(() => {
    // ステージごとの難易度設定
    const stageDifficulty = {
      1: { moves: 30, targetScore: 1000, timeEstimate: '3分' },
      2: { moves: 28, targetScore: 1500, timeEstimate: '4分' },
      3: { moves: 26, targetScore: 2000, timeEstimate: '5分' },
      4: { moves: 24, targetScore: 2500, timeEstimate: '6分' },
      5: { moves: 22, targetScore: 3000, timeEstimate: '8分' },
      6: { moves: 20, targetScore: 4000, timeEstimate: '10分' }
    };

    const difficulty = stageDifficulty[Math.min(stage, 6)] || stageDifficulty[1];
    setMovesLeft(difficulty.moves);
    setTargetScore(difficulty.targetScore);
    gameStateRef.current.movesLeft = difficulty.moves;
    gameStateRef.current.targetScore = difficulty.targetScore;

    console.log(`Stage ${stage} 難易度:`, difficulty);
  }, [stage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    const game = gameStateRef.current;
    let lastframe = 0;
    let animationId;

    // 初期化
    const init = () => {
      // タイル配列初期化
      for (let i = 0; i < game.level.columns; i++) {
        game.level.tiles[i] = [];
        for (let j = 0; j < game.level.rows; j++) {
          game.level.tiles[i][j] = { type: 0, shift: 0 };
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
      if (game.gamestate === game.gamestates.ready) {
        // ゲームオーバーチェック
        if (game.movesLeft <= 0 && !game.cleared) {
          game.gameover = true;
        }

        // クリアチェック
        if (game.score >= game.targetScore && !game.cleared) {
          game.cleared = true;
          setTimeout(() => onClear(), 1000);
        }
      } else if (game.gamestate === game.gamestates.resolve) {
        game.animationtime += dt;

        if (game.animationstate === 0) {
          // クラスター検出
          if (game.animationtime > game.animationtimetotal) {
            findClusters();

            if (game.clusters.length > 0) {
              // スコア加算
              for (let i = 0; i < game.clusters.length; i++) {
                game.score += 100 * (game.clusters[i].length - 2);
              }
              setScore(game.score);

              removeClusters();
              game.animationstate = 1;
            } else {
              game.gamestate = game.gamestates.ready;
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
              game.gamestate = game.gamestates.ready;
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
      // 背景
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ヘッダー
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, 80);

      // タイトル
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Match-3 Puzzle', 20, 35);

      // ステージ表示
      ctx.font = '16px sans-serif';
      ctx.fillText(`Stage ${stage}`, 20, 60);

      // スコア表示
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Score: ${game.score} / ${game.targetScore}`, 250, 35);

      // 残り手数
      ctx.fillText(`Moves: ${game.movesLeft}`, 250, 60);

      // レベル背景
      const levelwidth = game.level.columns * game.level.tilewidth;
      const levelheight = game.level.rows * game.level.tileheight;
      ctx.fillStyle = '#000000';
      ctx.fillRect(game.level.x - 4, game.level.y - 4, levelwidth + 8, levelheight + 8);

      // タイル描画
      renderTiles(ctx);

      // クラスター描画
      renderClusters(ctx);

      // ゲームオーバー/クリア表示
      if (game.gameover) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(game.level.x, game.level.y, levelwidth, levelheight);

        ctx.fillStyle = '#ff4444';
        ctx.font = '36px sans-serif';
        const text = 'Game Over!';
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, game.level.x + (levelwidth - textWidth) / 2, game.level.y + levelheight / 2);

        if (!game.cleared) {
          setTimeout(() => onGameOver(), 2000);
        }
      }

      if (game.cleared) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.fillRect(game.level.x, game.level.y, levelwidth, levelheight);

        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 36px sans-serif';
        const text = 'Stage Clear!';
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, game.level.x + (levelwidth - textWidth) / 2, game.level.y + levelheight / 2);
      }
    };

    // タイル描画
    const renderTiles = (ctx) => {
      for (let i = 0; i < game.level.columns; i++) {
        for (let j = 0; j < game.level.rows; j++) {
          const shift = game.level.tiles[i][j].shift;
          const coord = getTileCoordinate(i, j, 0, (game.animationtime / game.animationtimetotal) * shift);

          if (game.level.tiles[i][j].type >= 0) {
            const col = game.tilecolors[game.level.tiles[i][j].type];
            drawTile(ctx, coord.tilex, coord.tiley, col[0], col[1], col[2]);
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

        const coord1 = getTileCoordinate(game.currentmove.column1, game.currentmove.row1, 0, 0);
        const coord1shift = getTileCoordinate(game.currentmove.column1, game.currentmove.row1,
          (game.animationtime / game.animationtimetotal) * shiftx,
          (game.animationtime / game.animationtimetotal) * shifty);
        const col1 = game.tilecolors[game.level.tiles[game.currentmove.column1][game.currentmove.row1].type];

        const coord2 = getTileCoordinate(game.currentmove.column2, game.currentmove.row2, 0, 0);
        const coord2shift = getTileCoordinate(game.currentmove.column2, game.currentmove.row2,
          (game.animationtime / game.animationtimetotal) * -shiftx,
          (game.animationtime / game.animationtimetotal) * -shifty);
        const col2 = game.tilecolors[game.level.tiles[game.currentmove.column2][game.currentmove.row2].type];

        drawTile(ctx, coord1.tilex, coord1.tiley, 0, 0, 0);
        drawTile(ctx, coord2.tilex, coord2.tiley, 0, 0, 0);

        if (game.animationstate === 2) {
          drawTile(ctx, coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
          drawTile(ctx, coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
        } else {
          drawTile(ctx, coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
          drawTile(ctx, coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
        }
      }
    };

    const getTileCoordinate = (column, row, columnoffset, rowoffset) => {
      const tilex = game.level.x + (column + columnoffset) * game.level.tilewidth;
      const tiley = game.level.y + (row + rowoffset) * game.level.tileheight;
      return { tilex, tiley };
    };

    const drawTile = (ctx, x, y, r, g, b) => {
      // 宝石（ダイヤモンド型）の描画
      const centerX = x + game.level.tilewidth / 2;
      const centerY = y + game.level.tileheight / 2;
      const size = game.level.tilewidth * 0.85;

      // 影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // ダイヤモンド本体のパス
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - size / 2.2);          // 上
      ctx.lineTo(centerX + size / 2.5, centerY);          // 右
      ctx.lineTo(centerX, centerY + size / 2.2);          // 下
      ctx.lineTo(centerX - size / 2.5, centerY);          // 左
      ctx.closePath();

      // メイングラデーション（上から下）
      const mainGradient = ctx.createLinearGradient(centerX, centerY - size / 2, centerX, centerY + size / 2);
      mainGradient.addColorStop(0, `rgb(${Math.min(r + 60, 255)}, ${Math.min(g + 60, 255)}, ${Math.min(b + 60, 255)})`);
      mainGradient.addColorStop(0.5, `rgb(${r}, ${g}, ${b})`);
      mainGradient.addColorStop(1, `rgb(${Math.floor(r * 0.6)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 0.6)})`);

      ctx.fillStyle = mainGradient;
      ctx.fill();

      // 影をリセット
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 枠線
      ctx.strokeStyle = `rgb(${Math.floor(r * 0.4)}, ${Math.floor(g * 0.4)}, ${Math.floor(b * 0.4)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // カット面の表現（内側の三角形）
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - size / 2.2);
      ctx.lineTo(centerX, centerY);
      ctx.lineTo(centerX + size / 2.5, centerY);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, 0.15)`;
      ctx.fill();

      // ハイライト（上部の光沢）
      ctx.beginPath();
      ctx.arc(centerX - size / 8, centerY - size / 6, size / 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();

      // 小さなハイライト
      ctx.beginPath();
      ctx.arc(centerX + size / 10, centerY - size / 8, size / 15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
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

    // 新しいゲーム
    const newGame = () => {
      game.score = 0;
      game.gamestate = game.gamestates.ready;
      game.gameover = false;
      game.cleared = false;
      setScore(0);

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
              game.clusters.push({
                column: i + 1 - matchlength,
                row: j,
                length: matchlength,
                horizontal: true
              });
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
              game.clusters.push({
                column: i,
                row: j + 1 - matchlength,
                length: matchlength,
                horizontal: false
              });
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
      for (let i = 0; i < game.clusters.length; i++) {
        const cluster = game.clusters[i];
        let coffset = 0;
        let roffset = 0;
        for (let j = 0; j < cluster.length; j++) {
          game.level.tiles[cluster.column + coffset][cluster.row + roffset].type = -1;

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

      // 手数を減らす
      game.movesLeft--;
      setMovesLeft(game.movesLeft);
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
      return {
        x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
        y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
      };
    };

    // マウスイベント
    const onMouseDown = (e) => {
      if (game.gamestate !== game.gamestates.ready) return;

      const pos = getMousePos(canvas, e);
      const mt = getMouseTile(pos);

      if (mt.valid) {
        let swapped = false;
        if (game.level.selectedtile.selected) {
          if (mt.x === game.level.selectedtile.column && mt.y === game.level.selectedtile.row) {
            game.level.selectedtile.selected = false;
            return;
          } else if (canSwap(mt.x, mt.y, game.level.selectedtile.column, game.level.selectedtile.row)) {
            mouseSwap(mt.x, mt.y, game.level.selectedtile.column, game.level.selectedtile.row);
            swapped = true;
          }
        }

        if (!swapped) {
          game.level.selectedtile.column = mt.x;
          game.level.selectedtile.row = mt.y;
          game.level.selectedtile.selected = true;
        }
      } else {
        game.level.selectedtile.selected = false;
      }

      game.drag = true;
    };

    const onMouseMove = (e) => {
      if (game.drag && game.level.selectedtile.selected && game.gamestate === game.gamestates.ready) {
        const pos = getMousePos(canvas, e);
        const mt = getMouseTile(pos);

        if (mt.valid) {
          if (canSwap(mt.x, mt.y, game.level.selectedtile.column, game.level.selectedtile.row)) {
            mouseSwap(mt.x, mt.y, game.level.selectedtile.column, game.level.selectedtile.row);
          }
        }
      }
    };

    const onMouseUp = () => {
      game.drag = false;
    };

    const onMouseOut = () => {
      game.drag = false;
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
          width={500}
          height={600}
          className="match3-canvas"
        />
      </div>
    </div>
  );
}

export default Match3Puzzle;
