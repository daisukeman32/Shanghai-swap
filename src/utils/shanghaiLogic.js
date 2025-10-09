/**
 * 上海パズルロジック
 * 複数レイアウトパターン対応 + 堅牢なシャッフル機能
 */

import { LAYOUT_PATTERNS, LAYOUT_KEYS, pickRandomLayoutKey, patternToSlots } from '../data/layoutPatterns';

// 牌の種類（全34種類）
const TILE_TYPES = [
  // 萬子（Characters）
  '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m',
  // 筒子（Dots）
  '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p',
  // 索子（Bamboo）
  '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s',
  // 字牌（Honors）
  'east', 'south', 'west', 'north', // 風牌
  'white', 'red' // 三元牌（中・白）
];

// 牌タイプから画像ファイル名へのマッピング
const TILE_IMAGE_MAP = {
  // 萬子
  '1m': 'p_ms1_1.gif', '2m': 'p_ms2_1.gif', '3m': 'p_ms3_1.gif',
  '4m': 'p_ms4_1.gif', '5m': 'p_ms5_1.gif', '6m': 'p_ms6_1.gif',
  '7m': 'p_ms7_1.gif', '8m': 'p_ms8_1.gif', '9m': 'p_ms9_1.gif',
  // 筒子
  '1p': 'p_ps1_1.gif', '2p': 'p_ps2_1.gif', '3p': 'p_ps3_1.gif',
  '4p': 'p_ps4_1.gif', '5p': 'p_ps5_1.gif', '6p': 'p_ps6_1.gif',
  '7p': 'p_ps7_1.gif', '8p': 'p_ps8_1.gif', '9p': 'p_ps9_1.gif',
  // 索子
  '1s': 'p_ss1_1.gif', '2s': 'p_ss2_1.gif', '3s': 'p_ss3_1.gif',
  '4s': 'p_ss4_1.gif', '5s': 'p_ss5_1.gif', '6s': 'p_ss6_1.gif',
  '7s': 'p_ss7_1.gif', '8s': 'p_ss8_1.gif', '9s': 'p_ss9_1.gif',
  // 字牌
  'east': 'p_ji_e_1.gif', 'south': 'p_ji_s_1.gif',
  'west': 'p_ji_w_1.gif', 'north': 'p_ji_n_1.gif',
  'white': 'p_ji_h_1.gif', 'red': 'p_ji_c_1.gif'
};

/**
 * 牌タイプから画像パスを取得
 */
export function getTileImagePath(tileType) {
  const fileName = TILE_IMAGE_MAP[tileType] || 'p_no_1.gif';
  return `/assets/tiles/${fileName}`;
}

/**
 * 外部から現在利用可能なレイアウトキー一覧を取得
 */
export function getLayoutKeys() {
  return [...LAYOUT_KEYS];
}

/**
 * レイアウトを生成（逆順生成方式）
 * @param {string} layoutKey - レイアウトパターンのキー
 * @param {number} retryCount - 内部リトライカウンタ
 * @returns {Array} 牌配列
 */
export function generateLayout(layoutKey, retryCount = 0) {
  const MAX_RETRIES = 10;

  if (retryCount >= MAX_RETRIES) {
    console.error(`レイアウト生成が${MAX_RETRIES}回失敗しました。シンプルなレイアウトにフォールバックします。`);
    // フォールバック: tutorialBasicを強制的に使用
    return generateSimpleFallback();
  }

  const key = layoutKey && LAYOUT_PATTERNS[layoutKey] ? layoutKey : pickRandomLayoutKey();
  const pattern = LAYOUT_PATTERNS[key];
  const allSlots = patternToSlots(pattern);

  const pairCount = Math.floor(allSlots.length / 2);
  const pairs = [];

  for (let i = 0; i < pairCount; i++) {
    pairs.push(TILE_TYPES[i % TILE_TYPES.length]);
  }
  shuffleArray(pairs);

  let idCounter = 0;
  const placedTiles = [];

  for (let i = 0; i < pairs.length; i++) {
    const type = pairs[i];
    const availableSlots = findSelectableSlots(allSlots, placedTiles);

    if (availableSlots.length < 2) {
      console.warn(`レイアウト ${key} で配置可能スロット不足（リトライ ${retryCount + 1}/${MAX_RETRIES}）`);
      return generateLayout(key, retryCount + 1);
    }

    shuffleArray(availableSlots);
    const slotA = availableSlots.pop();
    const slotB = availableSlots.pop();

    const tileA = { id: idCounter++, type, ...slotA, isRemoved: false };
    const tileB = { id: idCounter++, type, ...slotB, isRemoved: false };

    placedTiles.push(tileA, tileB);
  }

  return placedTiles;
}

/**
 * フォールバック用のシンプルなレイアウト生成
 */
function generateSimpleFallback() {
  const pattern = LAYOUT_PATTERNS.tutorialBasic;
  const allSlots = patternToSlots(pattern);

  // シンプルな方法: スロットをシャッフルして順番に配置
  shuffleArray(allSlots);

  const pairCount = Math.floor(allSlots.length / 2);
  const pairs = [];
  for (let i = 0; i < pairCount; i++) {
    pairs.push(TILE_TYPES[i % TILE_TYPES.length]);
  }

  const tiles = [];
  let idCounter = 0;

  for (let i = 0; i < pairCount; i++) {
    const type = pairs[i];
    const slot1 = allSlots[i * 2];
    const slot2 = allSlots[i * 2 + 1];

    tiles.push(
      { id: idCounter++, type, ...slot1, isRemoved: false },
      { id: idCounter++, type, ...slot2, isRemoved: false }
    );
  }

  return tiles;
}

/**
 * チュートリアル用レイアウト生成（後方互換性維持）
 */
export function generateTutorialLayout(layoutKey) {
  return generateLayout(layoutKey);
}

/**
 * 堅牢なシャッフル処理（手詰まりループ防止）
 * @param {Array} originalTiles - 元の牌配列
 * @param {number} maxAttempts - 最大試行回数
 * @returns {Array} シャッフル後の牌配列
 */
export function safeShuffleTiles(originalTiles, maxAttempts = 25) {
  const tiles = originalTiles.map(tile => ({ ...tile }));
  const remaining = tiles.filter(tile => !tile.isRemoved);
  if (remaining.length < 2) {
    return tiles;
  }

  const baseTypes = remaining.map(tile => tile.type);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffledTypes = [...baseTypes];
    shuffleArray(shuffledTypes);

    let index = 0;
    const candidateTiles = tiles.map(tile => {
      if (tile.isRemoved) return tile;
      return { ...tile, type: shuffledTypes[index++] };
    });

    if (findHint(candidateTiles)) {
      return candidateTiles;
    }
  }

  // フォールバック: 残存スロット位置で新規に solvable な並びを再生成
  const activeSlots = tiles
    .filter(tile => !tile.isRemoved)
    .map(tile => ({ x: tile.x, y: tile.y, layer: tile.layer }));

  const rebuiltActive = rebuildFromSlots(activeSlots);
  const rebuiltIterator = rebuiltActive.values();

  return tiles.map(tile => {
    if (tile.isRemoved) return tile;
    const rebuilt = rebuiltIterator.next().value;
    return { ...tile, type: rebuilt.type };
  });
}

/**
 * スロットから逆順生成で牌を再構築
 * @param {Array} slots - スロット配列
 * @returns {Array} 再構築された牌配列
 */
function rebuildFromSlots(slots) {
  const pairCount = Math.floor(slots.length / 2);
  const pairs = [];
  for (let i = 0; i < pairCount; i++) {
    pairs.push(TILE_TYPES[i % TILE_TYPES.length]);
  }
  shuffleArray(pairs);

  const placed = [];
  let idCounter = 0;

  for (const type of pairs) {
    const availableSlots = findSelectableSlots(slots, placed);

    if (availableSlots.length < 2) {
      return rebuildFromSlots(slots);
    }

    shuffleArray(availableSlots);
    const slotA = availableSlots.pop();
    const slotB = availableSlots.pop();

    placed.push(
      { id: idCounter++, type, ...slotA, isRemoved: false },
      { id: idCounter++, type, ...slotB, isRemoved: false }
    );
  }

  return placed;
}

/**
 * 配列をシャッフル（Fisher-Yates algorithm）
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * 空きスロットの中で、現在の盤面状態で「選択可能」なスロットを検索
 * @param {Array} allSlots - 全スロット定義
 * @param {Array} placedTiles - 既に配置済みの牌
 * @returns {Array} 選択可能なスロット配列
 */
function findSelectableSlots(allSlots, placedTiles) {
  // 空いているスロット（まだ牌が配置されていない）
  const emptySlots = allSlots.filter(slot =>
    !placedTiles.some(t => t.x === slot.x && t.y === slot.y && t.layer === slot.layer)
  );

  // 各空きスロットに仮の牌を置いてみて、それが選択可能かチェック
  const selectableSlots = emptySlots.filter(slot => {
    const tempTile = {
      id: -1,
      type: 'temp',
      x: slot.x,
      y: slot.y,
      layer: slot.layer,
      isRemoved: false
    };
    const tempTiles = [...placedTiles, tempTile];
    return isSelectable(tempTile, tempTiles);
  });

  return selectableSlots;
}

/**
 * 牌が選択可能かチェック
 * @param {Object} tile - 対象の牌
 * @param {Array} allTiles - すべての牌
 * @returns {boolean} 選択可能ならtrue
 */
export function isSelectable(tile, allTiles) {
  if (tile.isRemoved) return false;

  // 上に牌があるかチェック
  const hasBlockingTileAbove = allTiles.some(t =>
    !t.isRemoved &&
    t.layer === tile.layer + 1 &&
    isOverlapping(t, tile)
  );

  if (hasBlockingTileAbove) return false;

  // 左右チェック
  const leftBlocked = allTiles.some(t =>
    !t.isRemoved &&
    t.layer === tile.layer &&
    t.x === tile.x - 1 &&
    t.y === tile.y
  );

  const rightBlocked = allTiles.some(t =>
    !t.isRemoved &&
    t.layer === tile.layer &&
    t.x === tile.x + 1 &&
    t.y === tile.y
  );

  return !leftBlocked || !rightBlocked;
}

/**
 * 2つの牌が重なっているかチェック
 * @param {Object} tile1 - 牌1
 * @param {Object} tile2 - 牌2
 * @returns {boolean} 重なっていればtrue
 */
function isOverlapping(tile1, tile2) {
  return Math.abs(tile1.x - tile2.x) < 1 && Math.abs(tile1.y - tile2.y) < 1;
}

/**
 * 2つの牌がペアになるかチェック
 * @param {Object} tile1 - 牌1
 * @param {Object} tile2 - 牌2
 * @param {Array} allTiles - すべての牌
 * @returns {boolean} ペアならtrue
 */
export function canMatch(tile1, tile2, allTiles) {
  if (!tile1 || !tile2) return false;
  if (tile1.id === tile2.id) return false;
  if (tile1.isRemoved || tile2.isRemoved) return false;
  if (tile1.type !== tile2.type) return false;

  return isSelectable(tile1, allTiles) && isSelectable(tile2, allTiles);
}

/**
 * ヒント（マッチング可能なペア）を検索
 * @param {Array} tiles - すべての牌
 * @returns {Array|null} ペア配列、見つからない場合はnull
 */
export function findHint(tiles) {
  const selectableTiles = tiles.filter(t =>
    !t.isRemoved && isSelectable(t, tiles)
  );

  for (let i = 0; i < selectableTiles.length; i++) {
    for (let j = i + 1; j < selectableTiles.length; j++) {
      if (selectableTiles[i].type === selectableTiles[j].type) {
        return [selectableTiles[i], selectableTiles[j]];
      }
    }
  }

  return null;
}

/**
 * ゲームクリア判定
 * @param {Array} tiles - すべての牌
 * @returns {boolean} すべて削除済みならtrue
 */
export function isGameCleared(tiles) {
  return tiles.every(t => t.isRemoved);
}

/**
 * 手詰まり判定
 * @param {Array} tiles - すべての牌
 * @returns {boolean} 手詰まりならtrue
 */
export function isStuck(tiles) {
  return findHint(tiles) === null && !isGameCleared(tiles);
}
