/**
 * 上海パズルロジック
 * 3層・40-50枚の簡易レイアウト
 */

// 牌の種類（簡易版）
const TILE_TYPES = [
  '1m', '2m', '3m', '4m', '5m', // 萬子
  '1p', '2p', '3p', '4p', '5p', // 筒子
  '1s', '2s', '3s', '4s', '5s', // 索子
  'east', 'south', 'west', 'north', // 風牌
  'white', 'green', 'red' // 三元牌
];

/**
 * 簡易レイアウト（3層・48枚）を生成
 * 簡易版：レイヤー優先配置で手詰まりを最小化
 * @returns {Array} 牌配列
 */
export function generateTutorialLayout() {
  let id = 0;

  // レイヤー0（最下層）- 24枚
  const layer0Pattern = [
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0]
  ];

  // レイヤー1（中層）- 16枚
  const layer1Pattern = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0]
  ];

  // レイヤー2（最上層）- 8枚
  const layer2Pattern = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0]
  ];

  const patterns = [layer0Pattern, layer1Pattern, layer2Pattern];

  // レイヤーごとにスロットを収集
  const slotsByLayer = [[], [], []];
  patterns.forEach((pattern, layer) => {
    pattern.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          slotsByLayer[layer].push({ x, y, layer });
        }
      });
    });
  });

  // 各レイヤーをシャッフル
  slotsByLayer.forEach(slots => shuffleArray(slots));

  // ペアリストを作成
  const totalSlots = slotsByLayer.flat().length;
  const pairCount = Math.floor(totalSlots / 2);
  const pairs = [];
  for (let i = 0; i < pairCount; i++) {
    pairs.push(TILE_TYPES[i % TILE_TYPES.length]);
  }
  shuffleArray(pairs);

  // レイヤー2 → 1 → 0 の順で配置（上層から）
  const tiles = [];
  let pairIndex = 0;

  for (let layer = 2; layer >= 0; layer--) {
    const layerSlots = slotsByLayer[layer];
    const layerPairCount = Math.floor(layerSlots.length / 2);

    for (let i = 0; i < layerPairCount && pairIndex < pairs.length; i++) {
      const pairType = pairs[pairIndex++];
      const slot1 = layerSlots[i * 2];
      const slot2 = layerSlots[i * 2 + 1];

      if (slot1 && slot2) {
        tiles.push({
          id: id++,
          type: pairType,
          x: slot1.x,
          y: slot1.y,
          layer: slot1.layer,
          isRemoved: false
        });
        tiles.push({
          id: id++,
          type: pairType,
          x: slot2.x,
          y: slot2.y,
          layer: slot2.layer,
          isRemoved: false
        });
      }
    }
  }

  return tiles;
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
