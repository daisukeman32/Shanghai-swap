/**
 * Mahjong Solitaire - 組み込み用モジュール
 * Original by ScriptRaccoon (MIT License)
 * Modified for embedding in novel games
 */

class MahjongSolitaire {
    constructor() {
        this.container = null;
        this.options = {};
        this.selectedCoord = null;
        this.currentCoords = [];
        this.hintCoord = null;
        this.images = [];
        this.tiles = new Map();
        this.gameEndCallback = null;
        this.isGameRunning = false;

        // 定数
        this.TILE_WIDTH = 56;
        this.TILE_HEIGHT = 80;
        this.TILE_DEPTH = 7;
        this.TOTAL_OFFSET_TOP = 30;
        this.TOTAL_OFFSET_LEFT = 80;
        this.TILE_ROUNDNESS = 7;

        this.initializeCoordinates();
        this.initializeImages();
    }

    /**
     * 初期化
     * @param {HTMLElement} containerElement - ゲームを表示するコンテナ
     * @param {Object} options - オプション設定
     */
    init(containerElement, options = {}) {
        this.container = containerElement;
        this.options = {
            imagePath: options.imagePath || '/mahjong-solitaire/img/',
            showHint: options.showHint !== false,
            showRestart: options.showRestart !== false,
            autoStart: options.autoStart !== false,
            minimalUI: options.minimalUI || false,
            ...options
        };

        // コンテナのクラス追加
        this.container.classList.add('mahjong-container');

        // UI構築
        this.buildUI();

        // 自動開始
        if (this.options.autoStart) {
            this.start();
        }

        return this;
    }

    /**
     * UI構築
     */
    buildUI() {
        // ゲームエリア
        const gameArea = document.createElement('div');
        gameArea.className = 'mahjong-game-area';
        gameArea.style.opacity = '0';
        this.gameArea = gameArea;

        // コントロール（最小限UIの場合は非表示）
        if (!this.options.minimalUI) {
            const controls = document.createElement('div');
            controls.className = 'mahjong-controls';

            const statusText = document.createElement('span');
            statusText.className = 'mahjong-status';
            this.statusText = statusText;

            const buttons = document.createElement('span');
            buttons.className = 'mahjong-buttons';

            if (this.options.showHint) {
                const hintBtn = document.createElement('button');
                hintBtn.textContent = 'ヒント';
                hintBtn.className = 'mahjong-btn';
                hintBtn.addEventListener('click', () => this.showHint());
                buttons.appendChild(hintBtn);
            }

            if (this.options.showRestart) {
                const restartBtn = document.createElement('button');
                restartBtn.textContent = '再開';
                restartBtn.className = 'mahjong-btn';
                restartBtn.addEventListener('click', () => this.reset());
                buttons.appendChild(restartBtn);
            }

            controls.appendChild(statusText);
            controls.appendChild(buttons);
            this.container.appendChild(controls);
        } else {
            // 最小限UIの場合はステータステキストのみ
            const statusText = document.createElement('div');
            statusText.className = 'mahjong-status-minimal';
            statusText.style.display = 'none';
            this.statusText = statusText;
            this.container.appendChild(statusText);
        }

        this.container.appendChild(gameArea);
    }

    /**
     * ゲーム開始
     */
    start() {
        this.isGameRunning = true;
        this.currentCoords = [...this.COORDINATES];
        this.selectedCoord = null;
        this.hintCoord = null;

        // 画像シャッフル
        this.shuffleArray(this.images);

        // タイル生成
        this.createTiles();

        // 移動可能チェック
        this.checkMovePossible('ゲーム準備中...');

        // フェードイン
        setTimeout(() => {
            this.gameArea.style.opacity = '1';
        }, 100);
    }

    /**
     * ゲーム終了時のコールバック設定
     * @param {Function} callback - コールバック関数（引数: {won: boolean, remainingTiles: number}）
     */
    onGameEnd(callback) {
        this.gameEndCallback = callback;
        return this;
    }

    /**
     * ゲーム状態取得
     * @returns {Object} ゲーム状態
     */
    getStatus() {
        return {
            isRunning: this.isGameRunning,
            totalTiles: this.COORDINATES.length,
            remainingTiles: this.currentCoords.length,
            selectedCoord: this.selectedCoord,
            hasHint: this.hintCoord !== null
        };
    }

    /**
     * リセット
     */
    reset() {
        this.gameArea.style.opacity = '0';
        setTimeout(() => {
            this.clearTiles();
            this.start();
        }, 200);
    }

    /**
     * タイルクリア
     */
    clearTiles() {
        this.gameArea.innerHTML = '';
        this.tiles.clear();
    }

    /**
     * タイル生成
     */
    createTiles() {
        for (let counter = 0; counter < this.COORDINATES.length; counter++) {
            const coord = this.COORDINATES[counter];
            const [x, y, z] = coord;
            const image = this.images[counter];

            // タイルコンテナ
            const tile = document.createElement('div');
            tile.className = 'mahjong-tile';
            tile.style.left = `${x * this.TILE_WIDTH + this.TILE_DEPTH * z + this.TOTAL_OFFSET_LEFT}px`;
            tile.style.top = `${y * this.TILE_HEIGHT + this.TILE_DEPTH * z + this.TOTAL_OFFSET_TOP}px`;
            tile.style.zIndex = z;
            tile.dataset.coord = coord.toString();
            tile.dataset.type = image.type;

            // タイル背面
            const tileBack = document.createElement('div');
            tileBack.className = 'mahjong-tile-back';
            tileBack.style.width = `${this.TILE_WIDTH + this.TILE_DEPTH}px`;
            tileBack.style.height = `${this.TILE_HEIGHT + this.TILE_DEPTH}px`;
            tileBack.style.top = `-${this.TILE_DEPTH}px`;
            tileBack.style.left = `-${this.TILE_DEPTH}px`;
            tileBack.style.borderRadius = `${this.TILE_ROUNDNESS}px ${2 * this.TILE_DEPTH}px ${this.TILE_ROUNDNESS}px ${2 * this.TILE_DEPTH}px`;

            // タイル前面
            const tileFront = document.createElement('div');
            tileFront.className = 'mahjong-tile-front';
            tileFront.style.width = `${this.TILE_WIDTH}px`;
            tileFront.style.height = `${this.TILE_HEIGHT}px`;
            tileFront.style.borderRadius = `${this.TILE_ROUNDNESS}px`;
            tileFront.dataset.coord = coord.toString();

            // 画像
            const img = document.createElement('img');
            img.src = `${this.options.imagePath}${image.src}`;
            img.style.width = `${this.TILE_WIDTH}px`;
            img.style.height = `${this.TILE_HEIGHT}px`;

            tileFront.appendChild(img);
            tileFront.addEventListener('click', () => this.clickTileAt(coord));

            tile.appendChild(tileBack);
            tile.appendChild(tileFront);
            this.gameArea.appendChild(tile);

            this.tiles.set(coord.toString(), { tile, tileFront, tileBack });
        }
    }

    /**
     * タイルクリック処理
     */
    clickTileAt(coord) {
        if (!this.isOpen(coord, this.currentCoords)) return;

        if (this.selectedCoord) {
            if (coord.toString() === this.selectedCoord.toString()) {
                this.unselectTileAt(coord);
                return;
            } else {
                const tile = this.getTileElement(coord);
                const selectedTile = this.getTileElement(this.selectedCoord);

                if (tile.dataset.type === selectedTile.dataset.type) {
                    this.executeMove(tile, selectedTile, coord, this.selectedCoord);
                    return;
                }
            }
        }

        this.selectTileAt(coord);
    }

    /**
     * 移動実行
     */
    executeMove(tile, selectedTile, coord, coord2) {
        this.selectedCoord = null;
        this.hintCoord = null;

        // アニメーション
        selectedTile.style.transition = 'opacity 0.2s';
        tile.style.transition = 'opacity 0.2s';
        selectedTile.style.opacity = '0';
        tile.style.opacity = '0';

        setTimeout(() => {
            selectedTile.style.display = 'none';
            tile.style.display = 'none';

            this.remove(coord, this.currentCoords);
            this.remove(coord2, this.currentCoords);

            if (this.currentCoords.length === 0) {
                this.writeStatus('クリア！ 🎉');
                this.isGameRunning = false;
                if (this.gameEndCallback) {
                    this.gameEndCallback({ won: true, remainingTiles: 0 });
                }
            } else {
                this.checkMovePossible('計算中...');
            }
        }, 200);
    }

    /**
     * タイル選択
     */
    selectTileAt(coord) {
        if (!coord) return;
        this.unselectTileAt(this.selectedCoord);
        this.selectedCoord = coord;
        const tileData = this.tiles.get(coord.toString());
        if (tileData) {
            tileData.tileFront.classList.add('mahjong-selected');
        }
    }

    /**
     * タイル選択解除
     */
    unselectTileAt(coord) {
        if (!coord) return;
        const tileData = this.tiles.get(coord.toString());
        if (tileData) {
            tileData.tileFront.classList.remove('mahjong-selected');
        }
        this.selectedCoord = null;
    }

    /**
     * 移動可能チェック
     */
    async checkMovePossible(message) {
        this.writeStatus(message);
        await this.sleep(50);

        const moves = [];
        for (let i = 0; i < this.currentCoords.length; i++) {
            for (let j = i + 1; j < this.currentCoords.length; j++) {
                const p = this.currentCoords[i];
                const q = this.currentCoords[j];

                if (p.toString() !== q.toString()) {
                    const pTile = this.getTileElement(p);
                    const qTile = this.getTileElement(q);

                    if (pTile.dataset.type === qTile.dataset.type &&
                        this.isOpen(p, this.currentCoords) &&
                        this.isOpen(q, this.currentCoords)) {
                        moves.push([p, q]);
                    }
                }
            }
        }

        this.updateStatus(moves);
        if (moves.length > 0) {
            this.hintCoord = this.randEl(this.randEl(moves));
        } else {
            this.isGameRunning = false;
            if (this.gameEndCallback) {
                this.gameEndCallback({ won: false, remainingTiles: this.currentCoords.length });
            }
        }
    }

    /**
     * ステータス更新
     */
    updateStatus(moves) {
        if (moves.length === 0) {
            this.writeStatus('移動不可。ゲームオーバー。🚧');
        } else if (moves.length === 1) {
            this.writeStatus('<strong>1</strong>つの移動が可能です');
        } else {
            this.writeStatus(`<strong>${moves.length}</strong>個の移動が可能です`);
        }
    }

    /**
     * ヒント表示
     */
    showHint() {
        if (!this.hintCoord) return;

        const tileData = this.tiles.get(this.hintCoord.toString());
        if (!tileData) return;

        let toggleNumber = 6;
        let toggleDelay = 200;

        for (let i = 0; i < toggleNumber; i++) {
            setTimeout(() => {
                tileData.tileFront.classList.toggle('mahjong-alert');
            }, toggleDelay * i);
        }

        setTimeout(() => {
            this.selectTileAt(this.hintCoord);
        }, toggleDelay * toggleNumber);
    }

    /**
     * ステータステキスト書き込み
     */
    writeStatus(text) {
        if (this.statusText) {
            this.statusText.innerHTML = text;
        }
    }

    /**
     * タイル要素取得
     */
    getTileElement(coord) {
        const tileData = this.tiles.get(coord.toString());
        return tileData ? tileData.tile : null;
    }

    // ===== ユーティリティ関数 =====

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    remove(element, list) {
        const i = list.findIndex(search => search.toString() === element.toString());
        if (i !== -1) list.splice(i, 1);
    }

    randEl(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== 座標関連 =====

    initializeCoordinates() {
        const interval = (a, b, mapfunction) => {
            return new Array(b - a + 1).fill(0).map((el, index) =>
                mapfunction ? mapfunction(a + index) : a + index
            );
        };

        const matrixInterval = (a, b, c, d, mapfunction) => {
            return interval(c, d, y => interval(a, b, x => mapfunction(x, y))).flat(1);
        };

        const level0 = [
            ...interval(1, 12, x => [x, 0, 0]),
            ...interval(3, 10, x => [x, 1, 0]),
            ...interval(2, 11, x => [x, 2, 0]),
            [0, 3.5, 0],
            ...interval(1, 12, x => [x, 3, 0]),
            ...interval(1, 12, x => [x, 4, 0]),
            [13, 3.5, 0],
            [14, 3.5, 0],
            ...interval(2, 11, x => [x, 5, 0]),
            ...interval(3, 10, x => [x, 6, 0]),
            ...interval(1, 12, x => [x, 7, 0]),
        ].reverse();

        const level1 = matrixInterval(4, 9, 1, 6, (x, y) => [x, y, 1]).reverse();
        const level2 = matrixInterval(5, 8, 2, 5, (x, y) => [x, y, 2]).reverse();
        const level3 = matrixInterval(6, 7, 3, 4, (x, y) => [x, y, 3]).reverse();
        const level4 = [[6.5, 3.5, 4]];

        this.COORDINATES = [...level0, ...level1, ...level2, ...level3, ...level4];
    }

    leftNeighbors(coord) {
        if (coord.toString() === [1, 3, 0].toString() ||
            coord.toString() === [1, 4, 0].toString()) {
            return [[0, 3.5, 0]];
        }
        if (coord.toString() === [13, 3.5, 0].toString()) {
            return [[12, 3, 0], [12, 4, 0]];
        }
        const [x, y, z] = coord;
        return [[x - 1, y, z]];
    }

    rightNeighbors(coord) {
        if (coord.toString() === [0, 3.5, 0].toString()) {
            return [[1, 3, 0], [1, 4, 0]];
        }
        if (coord.toString() === [12, 3, 0].toString() ||
            coord.toString() === [12, 4, 0].toString()) {
            return [[13, 3.5, 0]];
        }
        const [x, y, z] = coord;
        return [[x + 1, y, z]];
    }

    disjoint(list1, list2) {
        return list1.every(a => list2.every(b => a.toString() !== b.toString()));
    }

    isOpen(coord, currentCoords) {
        if (this.disjoint([coord], currentCoords)) return false;

        const [x, y, z] = coord;
        if (currentCoords.some(([a, b, c]) => a === x && b === y && c > z) ||
            (z === 3 && currentCoords.some(([a, b, c]) => c === 4))) {
            return false;
        }

        return this.disjoint(this.leftNeighbors(coord), currentCoords) ||
               this.disjoint(this.rightNeighbors(coord), currentCoords);
    }

    // ===== 画像初期化 =====

    initializeImages() {
        const types = [
            { name: 'dots', number: 9, multiplicity: 4 },
            { name: 'bamboo', number: 9, multiplicity: 4 },
            { name: 'character', number: 9, multiplicity: 4 },
            { name: 'wind', number: 4, multiplicity: 4 },
            { name: 'dragon', number: 3, multiplicity: 4 },
            { name: 'flower', number: 4, multiplicity: 1 },
            { name: 'season', number: 4, multiplicity: 1 },
        ];

        for (const type of types) {
            for (let j = 1; j <= type.number; j++) {
                for (let i = 1; i <= type.multiplicity; i++) {
                    this.images.push({
                        src: `${type.name}${j}.png`,
                        type: type.multiplicity > 1 ? `${type.name}${j}` : type.name
                    });
                }
            }
        }
    }
}

// グローバルに公開
window.MahjongSolitaire = MahjongSolitaire;
