import React, { useRef, useEffect, useState } from 'react';
import './Match3Puzzle.css';

/**
 * Match-3 Puzzle Game (Time Attack Version)
 * Based on: rembound/Match-3-Game-HTML5 (GPL v3)
 * Customized for: Shanghai-swap game - Time Limit System
 */

// 🎨 背景画像選択（ABテスト用）
const CHARACTER_BG = 'キャラ背景2.png';

function Match3Puzzle({ onClear, onGameOver, stage = 1, selectedCharacter = 'airi', saveData, updateSaveData, onResetToStage1 }) {
  const canvasRef = useRef(null);

  // タイマー・ゴールカウンター用ステート
  const [timeRemaining, setTimeRemaining] = useState(180); // 180秒（3分）
  const timeRemainingRef = useRef(180); // Canvas描画用のリアルタイム参照
  const [hypnosisCount, setHypnosisCount] = useState(0); // ハート揃えカウント
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showCutin, setShowCutin] = useState(true); // カットイン表示フラグ（初回は即表示）
  const [cutinType, setCutinType] = useState('start'); // カットインの種類（初回はstart）
  const [retryCount, setRetryCount] = useState(0); // リトライ回数
  const [gameKey, setGameKey] = useState(0); // ゲームリセット用キー
  const [gameStarted, setGameStarted] = useState(false); // ゲーム開始フラグ
  const [warning30Played, setWarning30Played] = useState(false); // 30秒警告再生済みフラグ
  const [startButtonClicked, setStartButtonClicked] = useState(false); // STARTボタンクリック済みフラグ

  // 🎮 チートコード関連
  const [keySequence, setKeySequence] = useState([]); // 入力されたキーシーケンス
  const [cheatModeActive, setCheatModeActive] = useState(false); // 救済ボタン表示フラグ
  const CHEAT_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 's', 'w', 'a', 'p'];

  // 🔊 効果音管理用ref
  const soundsRef = useRef({
    swap: null,            // スワップ音（決定ボタンを押す33）
    invalidSwap: null,     // 無効なスワップ音
    match3: null,          // 3個マッチ音
    match4plus: null,      // 4個以上マッチ音
    heart5: null,          // ハート5個揃え音
    tileFall: null,        // タイル落下音
    cutin: null,           // カットイン音
    countdownStart: null,  // カウントダウン開始音
    gameoverSound: null,   // ゲームオーバー効果音
    girlFirstHeart: null,  // 女の子の声（1回目）「あれ？なんか気持ちよくなってきた」
    girlSecondHeart: null, // 女の子の声（2回目）「あぁきもちいい」
    firstHeartVoice: null, // 1回目ハート成功セリフ「よしあと一回のみ」
    clearVoice: null,      // クリア時セリフ「ひひひ！やったぜいれかわりだ！」
    gameoverVoice: null,   // ゲームオーバー時セリフ「次こそは必ずいれかわってやる！」
    warning30sec: null,    // 30秒警告音
    shuffleWarning: null,  // シャッフル警告音
    buttonClick: null      // ボタンクリック音
  });

  const gameStateRef = useRef({
    level: {
      x: 47,
      y: 360,
      columns: 7,
      rows: 5,
      tilewidth: 65,
      tileheight: 65,
      tiles: [],
      selectedtile: { selected: false, column: 0, row: 0 }
    },
    tilecolors: [
      [255, 100, 150],  // ハートタイル（ピンク）
      [100, 180, 255],  // ブランクキノコ（青）
      [255, 200, 80],   // 時計タイル（黄色）
      [255, 68, 68],    // ドクロタイル（赤）
      [200, 200, 200]   // ブランク星（グレー）
    ],
    characters: [
      { name: 'ハート', initial: '❤️', description: 'ゴールカウンター+1' },
      { name: 'キノコ', initial: '🍄', description: 'ブランク（効果なし）' },
      { name: '時計', initial: '⏰', description: '時間回復' },
      { name: 'ドクロ', initial: '💀', description: '時間減少' },
      { name: '星', initial: '⭐', description: 'ブランク（効果なし）' }
    ],
    clusters: [],
    moves: [],
    currentmove: { column1: 0, row1: 0, column2: 0, row2: 0 },
    lastSwappedTile: { column: -1, row: -1 },
    lastSwapDirection: 'horizontal',
    gamestates: { init: 0, ready: 1, resolve: 2 },
    gamestate: 0,
    animationstate: 0,
    animationtime: 0,
    animationtimetotal: 0.3,
    drag: false,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartTileX: -1,
    dragStartTileY: -1,
    gameover: false,
    cleared: false,
    isShuffling: false,
    particles: [],
    floatingTexts: [], // タイム増減のポップアップ用
    // キャラクター画像
    playerImage: null,
    enemyImage: null,
    characterBgImage: null,
    cutinImage: null,
    startCutinImage: null,
    excellentCutinImage: null,
    clearCompleteCutinImage: null,
    gameplayBackgroundImage: null, // ゲームプレイエリア背景画像
    imagesLoaded: false,
    // タイルアイコン画像
    tileImages: {
      heart: null,
      blank_mushroom: null,
      clock: null,
      skull: null,
      blank_star: null
    },
    tileImagesLoaded: false
  });

  // キャラクター画像とタイルアイコン画像の読み込み
  useEffect(() => {
    const game = gameStateRef.current;
    let loadedCount = 0;
    const totalImages = 13; // 主人公 + 相手キャラ + キャラ背景 + ゲームプレイ背景 + タイル5種 + カットイン4種

    // 主人公の画像（500×500の正方形画像）
    const playerImg = new Image();
    playerImg.src = '/assets/characters/player_portrait.png';
    playerImg.onload = () => {
      game.playerImage = playerImg;
      loadedCount++;
      checkImagesLoaded();
    };
    playerImg.onerror = () => {
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

    // 相手キャラの画像
    const enemyImg = new Image();
    enemyImg.src = `/assets/characters/${selectedCharacter}/${selectedCharacter}_battle.png`;
    enemyImg.onload = () => {
      game.enemyImage = enemyImg;
      loadedCount++;
      checkImagesLoaded();
    };
    enemyImg.onerror = () => {
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

    // キャラ背景画像の読み込み
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

    // カットイン画像の読み込み（4種類）
    const cutinImages = {
      cutin: { path: '/assets/ui/cutin.png', prop: 'cutinImage', name: '1回目ハート' },
      start: { path: '/assets/ui/start.png', prop: 'startCutinImage', name: 'スタート' },
      excellent: { path: '/assets/ui/excellent.png', prop: 'excellentCutinImage', name: 'Excellent' },
      clearComplete: { path: '/assets/ui/clear_complete.png', prop: 'clearCompleteCutinImage', name: '解除完了' }
    };

    Object.values(cutinImages).forEach(({ path, prop, name }) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        game[prop] = img;
        loadedCount++;
        checkImagesLoaded();
        console.log(`✅ ${name}カットイン画像読み込み完了`);
      };
      img.onerror = () => {
        console.warn(`${name}カットイン画像の読み込み失敗: ${path}`);
        loadedCount++;
        checkImagesLoaded();
      };
    });

    // ゲームプレイ背景画像の読み込み（キャラクター別）
    const gameplayBgImg = new Image();
    gameplayBgImg.src = `/assets/backgrounds/classroom_${selectedCharacter}.png`;
    gameplayBgImg.onload = () => {
      game.gameplayBackgroundImage = gameplayBgImg;
      loadedCount++;
      checkImagesLoaded();
      console.log(`✅ ゲームプレイ背景読み込み完了: classroom_${selectedCharacter}.png`);
    };
    gameplayBgImg.onerror = () => {
      console.warn(`ゲームプレイ背景画像の読み込み失敗: classroom_${selectedCharacter}.png`);
      loadedCount++;
      checkImagesLoaded();
    };

    // タイルアイコン画像の読み込み（新しいパス）
    const tileImagePaths = {
      heart: '/assets/tiles/heart.png',
      blank_mushroom: '/assets/tiles/blank_mushroom.png',
      clock: '/assets/tiles/clock.png',
      skull: '/assets/tiles/skull.png',
      blank_star: '/assets/tiles/blank_star.png'
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

  // 🔊 効果音読み込み
  useEffect(() => {
    soundsRef.current = {
      swap: new Audio('/assets/sounds/swap.mp3'),
      invalidSwap: new Audio('/assets/sounds/invalid_swap.mp3'),
      match3: new Audio('/assets/sounds/match3.mp3'),
      match4plus: new Audio('/assets/sounds/match4plus.mp3'),
      heart5: new Audio('/assets/sounds/heart5.mp3'),
      tileFall: new Audio('/assets/sounds/tile_fall.mp3'),
      cutin: new Audio('/assets/sounds/cutin.mp3'),
      countdownStart: new Audio('/assets/sounds/countdown_start.mp3'),
      gameoverSound: new Audio('/assets/sounds/gameover_sound.mp3'),
      girlFirstHeart: new Audio('/assets/sounds/girl_first_heart.mp3'),
      girlSecondHeart: new Audio('/assets/sounds/girl_second_heart.mp3'),
      firstHeartVoice: new Audio('/assets/sounds/first_heart_voice.mp3'),
      clearVoice: new Audio('/assets/sounds/clear_voice.mp3'),
      gameoverVoice: new Audio('/assets/sounds/gameover_voice.mp3'),
      warning30sec: new Audio('/assets/sounds/warning_30sec.mp3'),
      shuffleWarning: new Audio('/assets/sounds/shuffle_warning.mp3'),
      buttonClick: new Audio('/assets/sounds/button_click.mp3')
    };

    // 音量設定（0.0～1.0）
    Object.values(soundsRef.current).forEach(audio => {
      if (audio) audio.volume = 0.7;
    });

    console.log('🔊 効果音読み込み完了（SE + ボイス 17種類）');
  }, []);

  // 効果音再生ヘルパー関数
  const playSound = (soundName) => {
    const sound = soundsRef.current[soundName];
    if (sound) {
      sound.currentTime = 0; // 再生位置をリセット
      sound.play().catch(err => console.warn(`効果音再生失敗: ${soundName}`, err));
    }
  };

  // 🎵 フェードイン/フェードアウト付き音声再生
  const playSoundWithFade = (soundName, fadeDuration = 300) => {
    const sound = soundsRef.current[soundName];
    if (!sound) return;

    sound.currentTime = 0;
    sound.volume = 0; // フェードイン用に0から開始

    const fadeInSteps = 20; // フェードインのステップ数
    const fadeInInterval = fadeDuration / fadeInSteps;
    const volumeStep = 0.7 / fadeInSteps; // 最終音量0.7まで

    // フェードイン
    let currentStep = 0;
    const fadeInTimer = setInterval(() => {
      currentStep++;
      sound.volume = Math.min(0.7, volumeStep * currentStep);

      if (currentStep >= fadeInSteps) {
        clearInterval(fadeInTimer);
      }
    }, fadeInInterval);

    // 再生開始
    sound.play().catch(err => console.warn(`効果音再生失敗: ${soundName}`, err));

    // フェードアウト（音声終了の少し前から）
    sound.onended = null; // 既存のイベントリスナーをクリア
    const duration = sound.duration * 1000; // ミリ秒に変換

    if (duration > fadeDuration * 2) {
      setTimeout(() => {
        const fadeOutSteps = 20;
        const fadeOutInterval = fadeDuration / fadeOutSteps;
        let fadeOutStep = 0;

        const fadeOutTimer = setInterval(() => {
          fadeOutStep++;
          sound.volume = Math.max(0, 0.7 - (volumeStep * fadeOutStep));

          if (fadeOutStep >= fadeOutSteps) {
            clearInterval(fadeOutTimer);
            sound.volume = 0.7; // 次回再生用に音量をリセット
          }
        }, fadeOutInterval);
      }, duration - fadeDuration - 100); // 終了前にフェードアウト開始
    }
  };

  // 🔊 スタートカットイン表示時に音声再生
  useEffect(() => {
    if (showCutin && cutinType === 'start') {
      // スタートカットイン表示時にカットイン音を再生（フェード付き）
      playSoundWithFade('cutin', 200);
      console.log('🔊 スタートカットイン音再生（フェード付き）');
    }
  }, [showCutin, cutinType]);

  // ゲームリセット時の処理（初回マウント時は gameKey=0 なのでスキップ)
  useEffect(() => {
    if (gameKey > 0) {
      // リトライ時のみ実行
      setTimeRemaining(180);
      timeRemainingRef.current = 180;
      setHypnosisCount(0);
      setCutinType('start');
      setShowCutin(true);
      setWarning30Played(false); // 30秒警告フラグリセット
      setStartButtonClicked(false); // STARTボタンフラグリセット
      console.log('🔄 ゲームリセット - スタートカットイン表示');
    }
  }, [gameKey]);

  // 🔊 30秒警告音
  useEffect(() => {
    if (timeRemaining === 30 && !warning30Played && !gameStateRef.current.gameover && !gameStateRef.current.cleared) {
      playSound('warning30sec');
      setWarning30Played(true);
      console.log('🔊 30秒警告音再生');
    }
  }, [timeRemaining, warning30Played]);

  // タイマー処理（1秒ごとにカウントダウン）
  useEffect(() => {
    console.log('⏱️ タイマー useEffect 起動', {
      gameKey,
      showCutin,
      cutinType,
      gameover: gameStateRef.current.gameover,
      cleared: gameStateRef.current.cleared
    });

    // スタートカットイン表示中はタイマーを開始しない
    if (showCutin && cutinType === 'start') {
      console.log('⏱️ スタートカットイン表示中のためタイマー起動しない');
      return;
    }

    if (gameStateRef.current.gameover || gameStateRef.current.cleared) {
      console.log('⏱️ ゲーム終了状態のためタイマー起動しない');
      return; // ゲームオーバーまたはクリア時はタイマー起動しない
    }

    console.log('⏱️ タイマー setInterval 開始');
    const timer = setInterval(() => {
      console.log('⏱️ タイマーチック', { gameover: gameStateRef.current.gameover, cleared: gameStateRef.current.cleared });
      if (!gameStateRef.current.gameover && !gameStateRef.current.cleared) {
        setTimeRemaining(prev => {
          const newTime = prev <= 0 ? 0 : prev - 1;
          timeRemainingRef.current = newTime; // Refも同時更新
          console.log('⏱️ タイムカウントダウン', prev, '->', newTime);
          return newTime;
        });
      }
    }, 1000);

    return () => {
      console.log('⏱️ タイマー clearInterval');
      clearInterval(timer);
    };
  }, [gameKey, showCutin, cutinType]); // スタートカットインの状態も監視

  // タイムアップチェック
  useEffect(() => {
    // ⏰ refも確認して滑り込み時計を正しく判定
    if (timeRemaining <= 0 && timeRemainingRef.current <= 0 && !gameStateRef.current.gameover && !gameStateRef.current.cleared) {
      gameStateRef.current.gameover = true;
      console.log('⏱️ タイムアップ！ゲームオーバー');
      // 🔊 ゲームオーバー効果音を即座に再生
      playSound('gameoverSound');
      setTimeout(() => {
        setShowGameOverDialog(true);
        // 🔊 ゲームオーバー時セリフ「次こそは必ずいれかわってやる！」（フェード付き）
        playSoundWithFade('gameoverVoice', 300);
      }, 1000);
    }
  }, [timeRemaining]);

  // 催眠カウント達成チェック
  useEffect(() => {
    if (hypnosisCount === 1 && !gameStateRef.current.cleared) {
      // 1回目のハート揃え成功時
      // 新しい順序：カットイン表示 → カットイン音 + 「よしあと一回のみ」→「あれ？なんか気持ちよくなってきた」
      setCutinType('first');
      setShowCutin(true);

      // 🔊 カットイン音再生（フェード付きで音割れ防止）
      playSoundWithFade('cutin', 200);

      // カットイン音の0.3秒後にセリフ「よしあと一回のみ」（フェード付き）
      setTimeout(() => {
        playSoundWithFade('firstHeartVoice', 300);

        // 「よしあと一回のみ」の再生時間を取得して、終了後に女の子の声を再生
        const firstHeartVoiceSound = soundsRef.current.firstHeartVoice;
        if (firstHeartVoiceSound) {
          const voiceDuration = firstHeartVoiceSound.duration * 1000; // ミリ秒に変換

          // 音声終了後に女の子の声「あれ？なんか気持ちよくなってきた」を再生（フェード付き）
          setTimeout(() => {
            playSoundWithFade('girlFirstHeart', 300);
          }, voiceDuration + 200); // 音声終了 + 0.2秒の間隔
        }
      }, 300);

      // 2.5秒後にカットイン非表示
      setTimeout(() => setShowCutin(false), 2500);
    }

    if (hypnosisCount === 2 && !gameStateRef.current.cleared) {
      // 2回目のハート揃え成功時、即座にクリアフラグを立ててタイマーを停止
      gameStateRef.current.cleared = true;
      console.log('🎉 クリア判定！タイマー停止');

      // 🔊 女の子の声「あぁきもちいい」を即座に再生（フェード付き）
      playSoundWithFade('girlSecondHeart', 300);

      // 0.8秒後にExcellentカットイン表示
      setTimeout(() => {
        setCutinType('excellent');
        setShowCutin(true);
        // 🔊 カットイン音再生（フェード付き）
        playSoundWithFade('cutin', 200);

        setTimeout(() => {
          setShowCutin(false);
          // Excellent表示後、解除完了カットインを表示
          setTimeout(() => {
            setCutinType('clearComplete');
            setShowCutin(true);
            // 🔊 カットイン音 + セリフ「ひひひ！やったぜいれかわりだ！」（フェード付き）
            playSoundWithFade('cutin', 200);
            setTimeout(() => {
              playSoundWithFade('clearVoice', 300); // フェード付き
            }, 300); // カットイン音の後、0.3秒後にセリフ再生
            setTimeout(() => {
              setShowCutin(false);
              // 解除完了表示後、次のシーンへ
              onClear();
            }, 2500);
          }, 500);
        }, 2500);
      }, 800); // 女の子の声の後、0.8秒後にExcellentカットイン表示
    }
  }, [hypnosisCount, onClear]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High DPI対応
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
      // パーティクル更新
      game.particles = game.particles.filter(p => {
        p.life -= dt;
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.vy += p.gravity * dt * 60;
        p.alpha = Math.max(0, p.life / p.maxLife);
        return p.life > 0;
      });

      // フローティングテキスト更新
      game.floatingTexts = game.floatingTexts.filter(t => {
        t.life -= dt;
        t.y -= dt * 30; // 上に浮かぶ
        t.alpha = Math.max(0, t.life / t.maxLife);
        return t.life > 0;
      });

      if (game.gamestate === game.gamestates.ready) {
        // 手詰まりチェック
        if (game.moves.length === 0 && !game.isShuffling) {
          game.isShuffling = true;
          console.log('⚠ 手詰まり検出！シャッフルします...');

          // 🔊 シャッフル警告音再生
          playSound('shuffleWarning');

          // ペナルティ: 10秒減少（即座にrefも更新）
          timeRemainingRef.current = Math.max(0, timeRemainingRef.current - 10);
          setTimeRemaining(prev => Math.max(0, prev - 10));
          addFloatingText(game.level.x + (game.level.columns * game.level.tilewidth) / 2,
                         game.level.y + (game.level.rows * game.level.tileheight) / 2,
                         '-10秒', '#ff4444');

          // シャッフル実行
          setTimeout(() => {
            reshuffleBoard();
            game.isShuffling = false;
          }, 600);
        }
      } else if (game.gamestate === game.gamestates.resolve) {
        game.animationtime += dt;

        if (game.animationstate === 0) {
          // クラスター検出
          if (game.animationtime > game.animationtimetotal) {
            findClusters();

            if (game.clusters.length > 0) {
              // タイル効果を適用
              applyTileEffects();
              removeClusters();
              game.animationstate = 1;
            } else {
              // クラスターがなければ ready に戻る
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
              // 連鎖終了
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
            // 🔊 無効なスワップ音再生
            playSound('invalidSwap');
          }
        }

        findMoves();
        findClusters();
      }
    };

    // 描画
    const render = (ctx) => {
      const logicalWidth = 550;
      const logicalHeight = 700;
      const headerHeight = 100; // ヘッダー高さ削減

      // 背景
      ctx.fillStyle = '#1a0a0a';
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // ヘッダー
      ctx.fillStyle = '#2d1b1b';
      ctx.fillRect(0, 0, logicalWidth, headerHeight);

      // タイマー表示（中央）
      const currentTime = timeRemainingRef.current; // Refから最新値を取得
      const isWarning = currentTime <= 30;
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px sans-serif';

      const minutes = Math.floor(currentTime / 60);
      const seconds = currentTime % 60;
      const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      if (isWarning) {
        // 30秒以下で赤色点滅
        const blink = Math.floor(Date.now() / 500) % 2 === 0;
        ctx.fillStyle = blink ? '#ff0000' : '#ff6666';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
      } else {
        ctx.fillStyle = '#ffffff';
      }

      ctx.fillText(timeText, logicalWidth / 2, 35);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // ゴールカウンター表示（右）
      ctx.textAlign = 'right';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = hypnosisCount >= 2 ? '#00ff00' : '#ffffff';
      ctx.fillText(`スワップ完了まで: ${hypnosisCount}/2`, logicalWidth - 30, 35);

      // 説明文（左）
      ctx.textAlign = 'left';
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#cccccc';
      ctx.fillText('❤️を5個揃えよう！', 30, 70);

      ctx.textAlign = 'left';

      // 立ち絵エリア
      const portraitAreaY = headerHeight;
      const portraitAreaHeight = 240; // 160 → 240に拡大（+80px、隙間を埋める）

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

      // 背景画像を立ち絵エリア全体に描画
      if (game.characterBgImage && game.characterBgImage.complete) {
        ctx.drawImage(
          game.characterBgImage,
          0, portraitAreaY, logicalWidth, portraitAreaHeight
        );
      }

      // 相手立ち絵（中央に大きく表示）
      if (game.enemyImage && game.enemyImage.complete) {
        const portraitHeight = portraitAreaHeight;
        const portraitWidth = portraitHeight;
        const enemyX = (logicalWidth - portraitWidth) / 2;
        const enemyY = portraitAreaY;

        ctx.save();
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 20;
        ctx.drawImage(
          game.enemyImage,
          enemyX, enemyY, portraitWidth, portraitHeight
        );
        ctx.restore();
      }

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // ゲームプレイエリア背景画像（立ち絵エリアの下、不透明度60%）
      const gameplayBgStartY = portraitAreaY + portraitAreaHeight + 10; // 立ち絵終端 + 10px隙間
      const gameplayBgHeight = logicalHeight - gameplayBgStartY; // 画面下まで

      if (game.gameplayBackgroundImage && game.gameplayBackgroundImage.complete) {
        ctx.save();
        ctx.globalAlpha = 0.2; // 不透明度20%（80%透過）- 教室背景を薄く表示
        ctx.drawImage(
          game.gameplayBackgroundImage,
          0, gameplayBgStartY, logicalWidth, gameplayBgHeight
        );
        ctx.restore();
      }

      // レベル背景（完全削除 - 教室背景を表示するため）
      const levelwidth = game.level.columns * game.level.tilewidth;
      const levelheight = game.level.rows * game.level.tileheight;
      // ctx.fillStyle = '#000000';
      // ctx.fillRect(game.level.x - 4, game.level.y - 4, levelwidth + 8, levelheight + 8);

      // タイル描画
      renderTiles(ctx);

      // クラスター描画
      renderClusters(ctx);

      // パーティクル描画
      renderParticles(ctx);

      // フローティングテキスト描画
      renderFloatingTexts(ctx);

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
        ctx.fillText('タイムアップ...', game.level.x + levelwidth / 2, game.level.y + levelheight / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.fillText('時間切れです...', game.level.x + levelwidth / 2, game.level.y + levelheight / 2 + 20);
        ctx.textAlign = 'left';
      }

      if (game.cleared) {
        ctx.fillStyle = 'rgba(255, 20, 147, 0.85)';
        ctx.fillRect(game.level.x, game.level.y, levelwidth, levelheight);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff69b4';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('クリア！', game.level.x + levelwidth / 2, game.level.y + levelheight / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.fillText('ハート2回揃えに成功！', game.level.x + levelwidth / 2, game.level.y + levelheight / 2 + 20);
        ctx.textAlign = 'left';
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
            drawTile(ctx, coord.tilex, coord.tiley, col[0], col[1], col[2], tileType);
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

        drawTile(ctx, coord1.tilex, coord1.tiley, 0, 0, 0, -1);
        drawTile(ctx, coord2.tilex, coord2.tiley, 0, 0, 0, -1);

        if (game.animationstate === 2) {
          drawTile(ctx, coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2], tile1Type);
          drawTile(ctx, coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2], tile2Type);
        } else {
          drawTile(ctx, coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2], tile2Type);
          drawTile(ctx, coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2], tile1Type);
        }
      }
    };

    const getTileCoordinate = (column, row, columnoffset, rowoffset) => {
      const tilex = game.level.x + (column + columnoffset) * game.level.tilewidth;
      const tiley = game.level.y + (row + rowoffset) * game.level.tileheight;
      return { tilex, tiley };
    };

    const drawTile = (ctx, x, y, r, g, b, tileType) => {
      const centerX = x + game.level.tilewidth / 2;
      const centerY = y + game.level.tileheight / 2;

      if (tileType !== undefined && tileType >= 0 && game.characters[tileType]) {
        const character = game.characters[tileType];

        // タイル画像が読み込まれていれば画像を表示
        const tileImageKeys = ['heart', 'blank_mushroom', 'clock', 'skull', 'blank_star'];
        const tileImageKey = tileImageKeys[tileType];
        const tileImage = game.tileImagesLoaded && game.tileImages[tileImageKey];

        if (tileImage) {
          // PNG画像を描画
          const iconSize = game.level.tilewidth * 0.9;
          const iconX = centerX - iconSize / 2;
          const iconY = centerY - iconSize / 2;

          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          ctx.drawImage(tileImage, iconX, iconY, iconSize, iconSize);

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

    // フローティングテキスト描画
    const renderFloatingTexts = (ctx) => {
      game.floatingTexts.forEach(t => {
        ctx.save();
        ctx.globalAlpha = t.alpha;
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px sans-serif';

        // 白いフチ
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeText(t.text, t.x, t.y);

        // 本体
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y);
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

    // フローティングテキスト追加
    const addFloatingText = (x, y, text, color) => {
      game.floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color,
        life: 1.5,
        maxLife: 1.5,
        alpha: 1
      });
    };

    // タイル効果を適用
    const applyTileEffects = () => {
      // 色ごとの合計マッチ数を集計
      const colorMatches = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
      let maxClusterLength = 0;

      for (let i = 0; i < game.clusters.length; i++) {
        const cluster = game.clusters[i];
        const tileType = game.level.tiles[cluster.column][cluster.row].type;
        colorMatches[tileType] += cluster.length;
        maxClusterLength = Math.max(maxClusterLength, cluster.length);
      }

      // ハートタイル（type 0）: 5個マッチでゴールカウンター+1
      const isHeart5Match = colorMatches[0] >= 5;

      // 🔊 マッチ音再生
      if (isHeart5Match) {
        // ハート5個揃えの時は専用の効果音のみ再生
        playSound('heart5');
      } else {
        // 通常のマッチ音再生
        if (maxClusterLength >= 4) {
          playSound('match4plus');
        } else if (maxClusterLength === 3) {
          playSound('match3');
        }
      }

      // ハート5個成功時の処理
      if (isHeart5Match) {
        setHypnosisCount(prev => prev + 1);
        addFloatingText(
          game.level.x + (game.level.columns * game.level.tilewidth) / 2,
          game.level.y + (game.level.rows * game.level.tileheight) / 2,
          `ハート成功！ ${hypnosisCount + 1}/2`,
          '#ff69b4'
        );
        console.log('❤️ ハート成功！');
      }

      // 時計タイル（type 2）: 時間回復
      if (colorMatches[2] >= 3) {
        const timeBonus = colorMatches[2] >= 4 ? 6 : 3;
        // ⏰ 即座にrefを更新して滑り込み時計を反映
        timeRemainingRef.current = timeRemainingRef.current + timeBonus;
        setTimeRemaining(prev => prev + timeBonus);
        addFloatingText(
          game.level.x + (game.level.columns * game.level.tilewidth) / 2,
          game.level.y + (game.level.rows * game.level.tileheight) / 2,
          `+${timeBonus}秒`,
          '#00ff00'
        );
        console.log(`⏰ 時間回復: +${timeBonus}秒 (即座反映: ${timeRemainingRef.current}秒)`);
      }

      // ドクロタイル（type 3）: 時間減少（3個のみペナルティ、4個以上はペナルティなし）
      if (colorMatches[3] === 3) {
        // 💀 即座にrefを更新
        timeRemainingRef.current = Math.max(0, timeRemainingRef.current - 10);
        setTimeRemaining(prev => Math.max(0, prev - 10));
        addFloatingText(
          game.level.x + (game.level.columns * game.level.tilewidth) / 2,
          game.level.y + (game.level.rows * game.level.tileheight) / 2,
          '-10秒',
          '#ff4444'
        );
        console.log(`💀 ドクロペナルティ: -10秒 (即座反映: ${timeRemainingRef.current}秒)`);
      } else if (colorMatches[3] >= 4) {
        addFloatingText(
          game.level.x + (game.level.columns * game.level.tilewidth) / 2,
          game.level.y + (game.level.rows * game.level.tileheight) / 2,
          '回避！',
          '#ffff00'
        );
        console.log('💀 ドクロ4個以上：ペナルティ回避');
      }

      // ブランクキノコ（type 1）とブランク星（type 4）: 効果なし
    };

    // 新しいゲーム
    const newGame = () => {
      game.gamestate = game.gamestates.init;

      // ランダムなタイルでレベルを埋める
      for (let i = 0; i < game.level.columns; i++) {
        for (let j = 0; j < game.level.rows; j++) {
          game.level.tiles[i][j].type = getRandomTile();
        }
      }

      // 初期マッチを削除
      do {
        findClusters();
        for (let i = 0; i < game.clusters.length; i++) {
          const cluster = game.clusters[i];
          for (let j = 0; j < cluster.length; j++) {
            game.level.tiles[cluster.column + (cluster.horizontal ? j : 0)][cluster.row + (cluster.horizontal ? 0 : j)].type = getRandomTile();
          }
        }
      } while (game.clusters.length > 0);

      findMoves();
      game.gamestate = game.gamestates.ready;
    };

    const getRandomTile = () => {
      return Math.floor(Math.random() * 5);
    };

    // クラスター検出
    const findClusters = () => {
      game.clusters = [];

      // 横方向
      for (let j = 0; j < game.level.rows; j++) {
        let matchlength = 1;
        for (let i = 0; i < game.level.columns; i++) {
          let checkcluster = false;

          if (i === game.level.columns - 1) {
            checkcluster = true;
          } else {
            if (game.level.tiles[i][j].type === game.level.tiles[i + 1][j].type &&
              game.level.tiles[i][j].type !== -1) {
              matchlength++;
            } else {
              checkcluster = true;
            }
          }

          if (checkcluster) {
            if (matchlength >= 3) {
              game.clusters.push({
                column: i + 1 - matchlength, row: j,
                length: matchlength, horizontal: true
              });
            }
            matchlength = 1;
          }
        }
      }

      // 縦方向
      for (let i = 0; i < game.level.columns; i++) {
        let matchlength = 1;
        for (let j = 0; j < game.level.rows; j++) {
          let checkcluster = false;

          if (j === game.level.rows - 1) {
            checkcluster = true;
          } else {
            if (game.level.tiles[i][j].type === game.level.tiles[i][j + 1].type &&
              game.level.tiles[i][j].type !== -1) {
              matchlength++;
            } else {
              checkcluster = true;
            }
          }

          if (checkcluster) {
            if (matchlength >= 3) {
              game.clusters.push({
                column: i, row: j + 1 - matchlength,
                length: matchlength, horizontal: false
              });
            }
            matchlength = 1;
          }
        }
      }
    };

    // クラスター削除
    const removeClusters = () => {
      for (let i = 0; i < game.clusters.length; i++) {
        const cluster = game.clusters[i];

        for (let j = 0; j < cluster.length; j++) {
          const col = cluster.column + (cluster.horizontal ? j : 0);
          const row = cluster.row + (cluster.horizontal ? 0 : j);

          const coord = getTileCoordinate(col, row, 0, 0);
          const tileType = game.level.tiles[col][row].type;

          // タイルタイプが有効な場合のみパーティクルを生成
          if (tileType >= 0 && tileType < game.tilecolors.length) {
            createParticles(
              coord.tilex + game.level.tilewidth / 2,
              coord.tiley + game.level.tileheight / 2,
              8,
              `rgb(${game.tilecolors[tileType].join(',')})`
            );
          }

          game.level.tiles[col][row].type = -1;
        }
      }

      game.clusters = [];
    };

    // タイルシフト
    const shiftTiles = () => {
      let hasFallen = false;
      for (let i = 0; i < game.level.columns; i++) {
        let shift = 0;
        for (let j = game.level.rows - 1; j >= 0; j--) {
          if (game.level.tiles[i][j].type === -1) {
            shift++;
            game.level.tiles[i][j].shift = 0;
          } else {
            if (shift > 0) {
              game.level.tiles[i][j].shift = shift;
              const temp = game.level.tiles[i][j].type;
              game.level.tiles[i][j].type = game.level.tiles[i][j + shift].type;
              game.level.tiles[i][j + shift].type = temp;
              hasFallen = true;
            }
            game.level.tiles[i][j].shift = 0;
          }
        }

        for (let j = 0; j < shift; j++) {
          game.level.tiles[i][j].type = getRandomTile();
          game.level.tiles[i][j].shift = 0;
          hasFallen = true;
        }
      }

      // 🔊 タイル落下音再生（タイルが落下した場合のみ）
      if (hasFallen) {
        playSound('tileFall');
      }
    };

    // 可能な手を見つける
    const findMoves = () => {
      game.moves = [];

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

    // タイルをスワップ
    const swap = (x1, y1, x2, y2) => {
      const typeswap = game.level.tiles[x1][y1].type;
      game.level.tiles[x1][y1].type = game.level.tiles[x2][y2].type;
      game.level.tiles[x2][y2].type = typeswap;
    };

    // 盤面シャッフル
    const reshuffleBoard = () => {
      const types = [];
      for (let i = 0; i < game.level.columns; i++) {
        for (let j = 0; j < game.level.rows; j++) {
          types.push(game.level.tiles[i][j].type);
        }
      }

      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }

      let index = 0;
      for (let i = 0; i < game.level.columns; i++) {
        for (let j = 0; j < game.level.rows; j++) {
          game.level.tiles[i][j].type = types[index++];
        }
      }

      findMoves();
    };

    // マウスイベント
    const getMousePos = (canvas, evt) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    };

    const onMouseDown = (e) => {
      const pos = getMousePos(canvas, e);

      if (game.gamestate === game.gamestates.ready) {
        const tx = Math.floor((pos.x - game.level.x) / game.level.tilewidth);
        const ty = Math.floor((pos.y - game.level.y) / game.level.tileheight);

        if (tx >= 0 && tx < game.level.columns && ty >= 0 && ty < game.level.rows) {
          // ドラッグ開始位置を記録
          game.dragStartX = pos.x;
          game.dragStartY = pos.y;
          game.dragStartTileX = tx;
          game.dragStartTileY = ty;
          game.isDragging = false;

          if (game.level.selectedtile.selected) {
            const dx = Math.abs(tx - game.level.selectedtile.column);
            const dy = Math.abs(ty - game.level.selectedtile.row);

            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
              game.currentmove = {
                column1: game.level.selectedtile.column,
                row1: game.level.selectedtile.row,
                column2: tx,
                row2: ty
              };
              game.level.selectedtile.selected = false;
              game.gamestate = game.gamestates.resolve;
              game.animationstate = 2;
              game.animationtime = 0;

              // 🔊 スワップ音再生
              playSound('swap');
            } else {
              game.level.selectedtile.column = tx;
              game.level.selectedtile.row = ty;
            }
          } else {
            game.level.selectedtile.selected = true;
            game.level.selectedtile.column = tx;
            game.level.selectedtile.row = ty;
          }
        } else {
          game.level.selectedtile.selected = false;
        }
      }

      game.drag = true;
    };

    const onMouseMove = (e) => {
      if (!game.drag || game.gamestate !== game.gamestates.ready) return;
      if (game.dragStartTileX === -1 || game.dragStartTileY === -1) return;
      if (game.isDragging) return; // 既にスワップ実行済み

      const pos = getMousePos(canvas, e);
      const DRAG_THRESHOLD = 20; // ドラッグと判定する最小距離（ピクセル）

      const deltaX = pos.x - game.dragStartX;
      const deltaY = pos.y - game.dragStartY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance >= DRAG_THRESHOLD) {
        // 方向を判定（より大きい軸を優先）
        let targetTileX = game.dragStartTileX;
        let targetTileY = game.dragStartTileY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // 横方向
          if (deltaX > 0) {
            targetTileX = game.dragStartTileX + 1; // 右
          } else {
            targetTileX = game.dragStartTileX - 1; // 左
          }
        } else {
          // 縦方向
          if (deltaY > 0) {
            targetTileY = game.dragStartTileY + 1; // 下
          } else {
            targetTileY = game.dragStartTileY - 1; // 上
          }
        }

        // 範囲チェック
        if (targetTileX >= 0 && targetTileX < game.level.columns &&
            targetTileY >= 0 && targetTileY < game.level.rows) {
          // スワップ実行
          game.currentmove = {
            column1: game.dragStartTileX,
            row1: game.dragStartTileY,
            column2: targetTileX,
            row2: targetTileY
          };
          game.level.selectedtile.selected = false;
          game.gamestate = game.gamestates.resolve;
          game.animationstate = 2;
          game.animationtime = 0;
          game.isDragging = true; // ドラッグスワップ実行済みフラグ

          // 🔊 スワップ音再生
          playSound('swap');

          console.log(`🎮 ドラッグスワップ: (${game.dragStartTileX},${game.dragStartTileY}) → (${targetTileX},${targetTileY})`);
        }
      }
    };

    const onMouseUp = (e) => {
      game.drag = false;
      game.isDragging = false;
      game.dragStartTileX = -1;
      game.dragStartTileY = -1;
    };

    const onMouseOut = (e) => {
      game.drag = false;
      game.isDragging = false;
      game.dragStartTileX = -1;
      game.dragStartTileY = -1;
    };

    init();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseout', onMouseOut);
    };
  }, [hypnosisCount, gameKey]);

  // リトライ処理
  const handleRetry = () => {
    if (retryCount < 3) {
      // 🔊 ボタンクリック音再生
      playSound('buttonClick');
      setRetryCount(prev => prev + 1);
      setShowGameOverDialog(false);
      gameStateRef.current.gameover = false;
      gameStateRef.current.cleared = false;
      setGameKey(prev => prev + 1); // ゲームリセット
    }
  };

  // タイトルへボタン処理
  const handleGoToTitle = () => {
    // 🔊 ボタンクリック音再生
    playSound('buttonClick');
    onGameOver();
  };

  // スタートボタンクリック処理
  const handleStartClick = () => {
    // 連打防止：既にクリック済みなら無視
    if (startButtonClicked) {
      console.log('🎮 STARTボタン - 既にクリック済みのため無視');
      return;
    }

    console.log('🎮 STARTボタンクリック - カウントダウン開始！');
    setStartButtonClicked(true); // フラグを立てる

    // 🔊 カウントダウン開始音再生
    playSound('countdownStart');

    // 3秒のカウントダウン後にゲーム開始
    setTimeout(() => {
      console.log('🎮 カウントダウン完了 - ゲーム開始！');
      // カットインを閉じる（これによりタイマーが自動的に開始される）
      setShowCutin(false);
    }, 3000); // 3秒待機
  };

  // 🎮 チートコード検出用キーボードリスナー
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ゲーム開始後のみチートコード入力を受付
      if (!gameStarted && showCutin) return;

      // 入力されたキーをシーケンスに追加
      setKeySequence(prev => {
        const newSequence = [...prev, e.key];

        // シーケンスが長すぎる場合は古いものを削除（最大12個）
        if (newSequence.length > CHEAT_CODE.length) {
          newSequence.shift();
        }

        // チートコードと一致するかチェック
        const isMatch = CHEAT_CODE.every((key, index) => newSequence[index] === key);

        if (isMatch && newSequence.length === CHEAT_CODE.length) {
          console.log('🎮 チートコード発動！救済ボタン出現！');
          setCheatModeActive(true);
          playSound('heart5'); // 成功音
          return []; // シーケンスをリセット
        }

        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, showCutin]);

  // 🎮 救済ボタン（即座にクリア）
  const handleCheatClear = () => {
    console.log('🎮 救済ボタンクリック - 即座にリワード画面へ！');
    playSound('buttonClick');

    // 演出なしで即座にクリア処理を実行してリワード画面へ遷移
    gameStateRef.current.cleared = true;
    setCheatModeActive(false); // ボタンを非表示

    // 次のシーン（リワード画面）へ即座に遷移
    setTimeout(() => {
      onClear();
    }, 500); // 0.5秒後に遷移
  };

  return (
    <div className="match3-container">
      <canvas ref={canvasRef} className="match3-canvas" />

      {/* 🎮 救済ボタン（チートモード時のみ表示） */}
      {cheatModeActive && !gameStateRef.current.cleared && !gameStateRef.current.gameover && (
        <button className="cheat-clear-button" onClick={handleCheatClear}>
          ✨ 救済クリア ✨
        </button>
      )}

      {/* カットイン表示 */}
      {showCutin && (() => {
        const game = gameStateRef.current;
        let cutinImageSrc = null;
        let cutinImage = null;

        switch (cutinType) {
          case 'start':
            cutinImage = game.startCutinImage;
            cutinImageSrc = '/assets/ui/start.png';
            break;
          case 'first':
            cutinImage = game.cutinImage;
            cutinImageSrc = '/assets/ui/cutin.png';
            break;
          case 'excellent':
            cutinImage = game.excellentCutinImage;
            cutinImageSrc = '/assets/ui/excellent.png';
            break;
          case 'clearComplete':
            cutinImage = game.clearCompleteCutinImage;
            cutinImageSrc = '/assets/ui/clear_complete.png';
            break;
          default:
            return null;
        }

        // 画像読み込み完了を待たずにオーバーレイを即座に表示
        return (
          <div className="cutin-overlay">
            <div className="cutin-image-wrapper">
              <img
                src={cutinImageSrc}
                alt={`カットイン_${cutinType}`}
                className={`cutin-image ${cutinType === 'clearComplete' ? 'clear-complete' : ''}`}
              />
              {/* スタートカットイン時のみSTARTボタンを画像の中央に表示 */}
              {cutinType === 'start' && (
                <button
                  className="start-button"
                  onClick={handleStartClick}
                >
                  START
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {showGameOverDialog && (
        <div className="game-over-dialog">
          <h2>タイムアップ</h2>
          <p>時間切れです。{retryCount < 3 ? 'もう一度挑戦しますか？' : 'リトライ回数が上限に達しました。'}</p>
          <p style={{ fontSize: '14px', color: '#aaa' }}>リトライ回数: {retryCount}/3</p>
          {retryCount < 3 && (
            <button onClick={handleRetry}>リトライ（残り{3 - retryCount}回）</button>
          )}
          <button onClick={handleGoToTitle}>タイトルへ</button>
        </div>
      )}
    </div>
  );
}

export default Match3Puzzle;
