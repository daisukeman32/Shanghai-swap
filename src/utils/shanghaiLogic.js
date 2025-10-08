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
 * @returns {Array} 牌配列
 */
export function generateTutorialLayout() {
  const tiles = [];
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

  // 牌を配置
  patterns.forEach((pattern, layer) => {
    pattern.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          tiles.push({
            id: id++,
            type: TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)],
            x,
            y,
            layer,
            isRemoved: false
          });
        }
      });
    });
  });

  // ペアになるように調整（すべての牌を2枚ずつ）
  const adjustedTiles = [];
  const halfCount = Math.floor(tiles.length / 2);

  for (let i = 0; i < halfCount; i++) {
    const type = TILE_TYPES[i % TILE_TYPES.length];
    if (tiles[i * 2]) {
      tiles[i * 2].type = type;
      adjustedTiles.push(tiles[i * 2]);
    }
    if (tiles[i * 2 + 1]) {
      tiles[i * 2 + 1].type = type;
      adjustedTiles.push(tiles[i * 2 + 1]);
    }
  }

  return adjustedTiles;
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
