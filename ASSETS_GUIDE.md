# 🎨 アセット管理ガイド - Shanghai-swap

このドキュメントは、音楽、画像、立ち絵などのアセットをプロジェクトに追加する際の「連絡ボックス」です。
**全てのアセットはこのガイドに従って配置してください。**

---

## 📁 ディレクトリ構造

```
Shanghai-swap/
├── public/
│   ├── assets/
│   │   ├── tiles/          # パズルタイル画像
│   │   ├── characters/     # キャラクター画像（立ち絵）
│   │   ├── backgrounds/    # 背景画像
│   │   ├── ui/            # UI素材（ボタン、アイコンなど）
│   │   ├── audio/         # 音楽・効果音
│   │   │   ├── bgm/       # BGM（背景音楽）
│   │   │   └── se/        # SE（効果音）
│   │   └── videos/        # 動画ファイル（ご褒美シーン用）
```

---

## 🎮 1. パズルタイル画像

### 📂 配置場所
`public/assets/tiles/`

### 🖼️ 必要なファイル
| ファイル名 | 用途 | 推奨サイズ | フォーマット |
|-----------|------|-----------|------------|
| `hypnosis.png` | 催眠タイル（5個揃えると催眠成功） | 128x128px | PNG（透過） |
| `mushroom.png` | マッシュルームタイル（効果なし） | 128x128px | PNG（透過） |
| `clock.png` | 時計タイル（時間延長+3秒/+6秒） | 128x128px | PNG（透過） |
| `skull.png` | ドクロタイル（時間減少-10秒） | 128x128px | PNG（透過） |

### ✅ 現状
- ✅ `hypnosis.png` 配置済み
- ✅ `mushroom.png` 配置済み
- ✅ `clock.png` 配置済み
- ✅ `skull.png` 配置済み

---

## 👤 2. キャラクター画像（立ち絵）

### 📂 配置場所
`public/assets/characters/{キャラクターID}/`

各キャラクターごとにフォルダを作成してください。

### 🖼️ 必要なファイル
各キャラクターフォルダに以下を配置：

| ファイル名 | 用途 | 推奨サイズ | フォーマット |
|-----------|------|-----------|------------|
| `{キャラID}_battle.png` | パズル画面の立ち絵 | 500x500px | PNG（透過推奨） |
| `{キャラID}_portrait.png` | サムネイル/ポートレート | 500x500px | PNG（透過推奨） |
| `{キャラID}_reward.png` | ご褒美シーン用画像 | 1920x1080px | PNG/JPG |

### 📋 キャラクターID一覧
- `airi` - 愛莉（あいり）
- `naho` - 夏帆（なほ）
- `mitsuki` - 美月（みつき）

### 例: 愛莉のファイル構成
```
public/assets/characters/airi/
├── airi_battle.png      # パズル画面用立ち絵（500x500px）
├── airi_portrait.png    # ポートレート（500x500px）
└── airi_reward.png      # ご褒美シーン画像（1920x1080px）
```

### ✅ 現状
- ✅ `airi/airi_battle.png` 配置済み

---

## 🖼️ 3. 背景画像

### 📂 配置場所
`public/assets/backgrounds/`

### 🖼️ 必要なファイル
| ファイル名 | 用途 | 推奨サイズ | フォーマット |
|-----------|------|-----------|------------|
| `title_bg.png` | タイトル画面背景 | 1920x1080px | PNG/JPG |
| `conversation_bg_{シーンID}.png` | 会話シーン背景 | 1920x1080px | PNG/JPG |
| `puzzle_bg.png` | パズル画面背景（オプション） | 1920x1080px | PNG/JPG |

### ✅ 現状
- ⚠️ 背景画像は未配置

---

## 🎨 4. UI素材

### 📂 配置場所
`public/assets/ui/`

### 🖼️ 必要なファイル
| ファイル名 | 用途 | 推奨サイズ | フォーマット |
|-----------|------|-----------|------------|
| `キャラ背景1.png` | 立ち絵背景（カラフル版） | 任意 | PNG/JPG |
| `キャラ背景2.png` | 立ち絵背景（落ち着いた版） | 任意 | PNG/JPG |
| `button_start.png` | スタートボタン | 200x60px | PNG（透過） |
| `button_continue.png` | コンティニューボタン | 200x60px | PNG（透過） |
| `icon_time.png` | タイマーアイコン | 64x64px | PNG（透過） |
| `icon_goal.png` | ゴールカウンターアイコン | 64x64px | PNG（透過） |

### ✅ 現状
- ✅ `キャラ背景1.png` 配置済み
- ✅ `キャラ背景2.png` 配置済み

---

## 🎵 5. 音楽・効果音

### 📂 配置場所
- **BGM**: `public/assets/audio/bgm/`
- **SE**: `public/assets/audio/se/`

### 🎵 BGM（背景音楽）
| ファイル名 | 用途 | フォーマット | ループ |
|-----------|------|------------|-------|
| `title.mp3` | タイトル画面BGM | MP3/OGG | ループ |
| `conversation.mp3` | 会話シーンBGM | MP3/OGG | ループ |
| `puzzle.mp3` | パズルゲームBGM | MP3/OGG | ループ |
| `reward.mp3` | ご褒美シーンBGM | MP3/OGG | ループ |

### 🔊 SE（効果音）
| ファイル名 | 用途 | フォーマット |
|-----------|------|------------|
| `tile_match.mp3` | タイル消去音 | MP3/OGG |
| `hypnosis_success.mp3` | 催眠成功音 | MP3/OGG |
| `time_bonus.mp3` | 時間延長音 | MP3/OGG |
| `time_penalty.mp3` | 時間減少音 | MP3/OGG |
| `timer_warning.mp3` | タイマー警告音（30秒以下） | MP3/OGG |
| `game_clear.mp3` | クリア音 | MP3/OGG |
| `game_over.mp3` | ゲームオーバー音 | MP3/OGG |
| `button_click.mp3` | ボタンクリック音 | MP3/OGG |
| `shuffle.mp3` | 盤面シャッフル音 | MP3/OGG |

### ✅ 現状
- ⚠️ 音楽・効果音は未配置

---

## 🎬 6. 動画ファイル（ご褒美シーン用）

### 📂 配置場所
`public/assets/videos/`

### 🎥 必要なファイル
| ファイル名 | 用途 | 推奨解像度 | フォーマット |
|-----------|------|-----------|------------|
| `reward_{キャラID}_stage{N}.mp4` | ステージN報酬動画 | 1920x1080px | MP4/WebM |

### 例
```
public/assets/videos/
├── reward_airi_stage1.mp4
├── reward_airi_stage2.mp4
├── reward_naho_stage1.mp4
└── reward_mitsuki_stage1.mp4
```

### ✅ 現状
- ⚠️ 動画ファイルは未配置

---

## 📝 ファイル命名規則

### 一般原則
1. **小文字とアンダースコア**: `airi_battle.png`（OK）、`AiriBattle.png`（NG）
2. **日本語ファイル名は避ける**: `愛莉.png`（NG）、`airi.png`（OK）
3. **連番は2桁**: `stage01.png`（OK）、`stage1.png`（微妙）

### キャラクターID
- `airi` - 愛莉
- `naho` - 夏帆
- `mitsuki` - 美月

---

## ✅ アセット提出チェックリスト

### パズルタイル画像
- [x] hypnosis.png（催眠タイル）
- [x] mushroom.png（マッシュルームタイル）
- [x] clock.png（時計タイル）
- [x] skull.png（ドクロタイル）

### キャラクター画像
- [x] airi_battle.png（愛莉・パズル画面用）
- [ ] airi_portrait.png（愛莉・ポートレート）
- [ ] airi_reward.png（愛莉・ご褒美シーン）
- [ ] naho_battle.png（夏帆・パズル画面用）
- [ ] naho_portrait.png（夏帆・ポートレート）
- [ ] naho_reward.png（夏帆・ご褒美シーン）
- [ ] mitsuki_battle.png（美月・パズル画面用）
- [ ] mitsuki_portrait.png（美月・ポートレート）
- [ ] mitsuki_reward.png（美月・ご褒美シーン）

### 背景画像
- [ ] title_bg.png（タイトル画面）
- [ ] conversation_bg_*.png（会話シーン）

### UI素材
- [x] キャラ背景1.png
- [x] キャラ背景2.png
- [ ] button_start.png
- [ ] button_continue.png

### BGM
- [ ] title.mp3
- [ ] conversation.mp3
- [ ] puzzle.mp3
- [ ] reward.mp3

### SE
- [ ] tile_match.mp3
- [ ] hypnosis_success.mp3
- [ ] time_bonus.mp3
- [ ] time_penalty.mp3
- [ ] timer_warning.mp3
- [ ] game_clear.mp3
- [ ] game_over.mp3
- [ ] button_click.mp3
- [ ] shuffle.mp3

### 動画
- [ ] reward_airi_stage*.mp4
- [ ] reward_naho_stage*.mp4
- [ ] reward_mitsuki_stage*.mp4

---

## 📮 アセット提出方法

### 方法1: 直接配置
上記のディレクトリ構造に従って、ファイルを直接配置してください。

### 方法2: 一括提出
全てのアセットをZIPファイルにまとめて提出する場合は、以下の構造でお願いします：

```
assets.zip/
├── tiles/
├── characters/
├── backgrounds/
├── ui/
├── audio/
│   ├── bgm/
│   └── se/
└── videos/
```

---

## ⚠️ 注意事項

1. **画像フォーマット**: PNG（透過が必要な場合）またはJPG
2. **音声フォーマット**: MP3またはOGG（ブラウザ互換性のため）
3. **動画フォーマット**: MP4（H.264コーデック推奨）
4. **ファイルサイズ**: 各ファイル10MB以下推奨（動画は除く）
5. **著作権**: 使用権のあるアセットのみ使用してください

---

## 🔧 アセット追加後の確認方法

アセットを追加したら、以下のコマンドでゲームを起動して確認してください：

```bash
npm start
```

ブラウザのコンソール（F12）で画像読み込みエラーがないか確認してください。

---

## 📞 サポート

アセット配置に関する質問や不明点があれば、このドキュメントを参照してください。
それでも解決しない場合は、開発者（Claude）にお尋ねください。

---

**最終更新**: 2025-10-16
**作成者**: Claude Code
