/**
 * CSV読み込みユーティリティ
 * BOM付きUTF-8対応
 */

/**
 * CSVファイルを読み込む
 * @param {string} filePath - CSVファイルのパス
 * @returns {Promise<Array>} パース済みのCSVデータ
 */
export async function loadCSV(filePath) {
  try {
    const response = await fetch(filePath);
    let text = await response.text();

    // BOM（\uFEFF）を削除
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }

    // CSVをパース
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return [];

    // ヘッダー行を取得
    const headers = parseCSVLine(lines[0]);

    // データ行をパース
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }

    return data;
  } catch (error) {
    console.error(`CSV読み込みエラー: ${filePath}`, error);
    return [];
  }
}

/**
 * CSV行をパース（カンマ区切り、ダブルクォート対応）
 * @param {string} line - CSV行
 * @returns {Array<string>} パース済みの値配列
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // エスケープされたダブルクォート
        current += '"';
        i++;
      } else {
        // クォートの開始/終了
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 区切り文字
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * すべてのゲームデータCSVを読み込む
 * @returns {Promise<Object>} ゲームデータオブジェクト
 */
export async function loadGameData() {
  try {
    const [
      characters,
      dialogues,
      choices,
      scenes
    ] = await Promise.all([
      loadCSV('/data/characters.csv'),
      loadCSV('/data/dialogues.csv'),
      loadCSV('/data/choices.csv'),
      loadCSV('/data/scenes.csv')
    ]);

    return {
      characters,
      dialogues,
      choices,
      scenes
    };
  } catch (error) {
    console.error('ゲームデータ読み込みエラー:', error);
    // エラー時はダミーデータを返す
    return getDummyGameData();
  }
}

/**
 * ダミーゲームデータ（CSV読み込み失敗時用）
 */
function getDummyGameData() {
  return {
    characters: [
      {
        character_id: 'airi',
        character_name: '星野 愛莉',
        age: '17',
        description: 'クラスで一番人気の美少女'
      }
    ],
    dialogues: [
      {
        dialogue_id: '1',
        scene_id: 'opening',
        character_id: 'airi',
        emotion: 'smile',
        text: 'こんにちは！今日も良い天気だね',
        next_dialogue_id: '2'
      },
      {
        dialogue_id: '2',
        scene_id: 'opening',
        character_id: 'airi',
        emotion: 'normal',
        text: 'ねえ、ちょっとお願いがあるんだけど…',
        next_dialogue_id: '3'
      },
      {
        dialogue_id: '3',
        scene_id: 'opening',
        character_id: 'airi',
        emotion: 'shy',
        text: '今度のテスト、一緒に勉強してくれない？',
        next_dialogue_id: 'choice_1'
      }
    ],
    choices: [
      {
        choice_id: 'choice_1_1',
        scene_id: 'opening',
        choice_text: 'もちろん！何でも手伝うよ！',
        next_dialogue_id: '4',
        is_correct: 'true'
      },
      {
        choice_id: 'choice_1_2',
        scene_id: 'opening',
        choice_text: '忙しいから無理かな…',
        next_dialogue_id: 'bad_end_1',
        is_correct: 'false'
      },
      {
        choice_id: 'choice_1_3',
        scene_id: 'opening',
        choice_text: '勉強苦手なんだよね…',
        next_dialogue_id: 'bad_end_2',
        is_correct: 'false'
      }
    ],
    scenes: [
      {
        scene_id: 'opening',
        scene_name: 'オープニング',
        background_image: '',
        bgm_file: '',
        description: '放課後の教室'
      }
    ]
  };
}

/**
 * BOM付きUTF-8でCSVを保存（開発用）
 * @param {string} filename - ファイル名
 * @param {Array<Object>} data - データ配列
 */
export function saveCSVWithBOM(filename, data) {
  if (data.length === 0) return;

  const BOM = '\uFEFF';
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
