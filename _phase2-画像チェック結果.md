# 京浜電設 採用サイト Phase 2 画像チェック結果

- 作成日: 2026-05-14
- 担当: 制作ディレクター（ファーストステップ）
- 対象: `/Users/yumauda/web/keihin/`
- フェーズ: Phase 2（画像整合性チェック＋クリーンアップ）

---

## 0. サマリー（3行）

- 画像配置パイプライン（`src/images/` → `images/`）は **論理的にも実動作的にも正常稼働中**。`npm run compress:images` で30件全てが skipped となり、追加生成不要なクリーンな状態を確認。
- 孤児画像 **`images/common/top-instagram-sp.png/webp`**（`src/` に元無し・参照無し）と **`.DS_Store` 2件** を削除。`xd-code/` の構図確認用 PNG は `src/images/` に混入していないことを確認。
- 残課題は **`./images/common/contact-arrow.svg`（実ファイル無し）** が contact セクション内で参照されている点のみ。同セクションは PHP コメントアウト中のため**実害ゼロ**だが、Phase 3 で contact の取り扱い確定時に同時判断が必要。

---

## 1. 整合性 OK 項目

### 1-1. ソース→出力の対応関係（漏れなし）

| 区分 | 確認結果 |
|---|---|
| `src/images/common/` (24枚) → `images/common/` 圧縮+WebP | **全件 OK**。`compress-images.js` の glob で正しく処理されている |
| `src/images/top/` (7枚) → `images/top/` 圧縮+WebP | **全件 OK** |
| `src/images/` 直下に置き忘れ画像 | **無し**（クリーンアップで `.DS_Store` 削除済） |
| `images/` 直下に画像 | **無し** |

### 1-2. PHP からの参照と実ファイルの突き合わせ

| ファイル | 参照画像数 | 実ファイル存在 |
|---|---|---|
| `index.php`（実装済み9セクション分）| 21パス参照 | **20件 OK / 1件 NG**（`contact-arrow.svg` のみ無し → コメントアウト中なので実害なし）|
| `includes/header.php` | `./images/common/header_logo.png` | **OK** |
| `includes/footer.php` | `./images/common/footer_logo.png` | **OK** |

実装済みセクション（MV / リード文 / INTERVIEW / OUR PEOPLE / 数字 / 代表MSG / CAREER / LICENSE / WELFARE）で参照される画像は **すべて WebP / PNG / SVG が `images/` に存在**。

### 1-3. パイプライン論理チェック

- **`scripts/compress-images.js`** — `src/images/**/*.{jpg,jpeg,png,gif,svg,webp}` を glob で取得 → 同名で `images/{rel}/` に出力 → mtime 比較で差分処理。**論理的に正しい**。JPG/PNG は WebP も併出力。
- **`scripts/generate-styles.js`** — `src/sass/{base,layout,project,component}/*.scss` を glob し `_index.scss` を除外 → ソートして `@use` 文を `src/sass/styles.scss` に書き出す。**新規 `_p-*.scss` を追加すれば自動で取り込まれる**ため、Phase 1分析の「確認が必要」項目（手書きか自動か）は **自動生成と確定**。
- **`package.json` dev スクリプト** — `compress:images → generate:styles → run-p (vite + sass watch + scss watch + image watch)` の順で起動。整合性 OK。

### 1-4. 実動作確認

```bash
$ npm run compress:images
Found 30 images to compress...
✓ Image compression complete! (processed: 0, skipped: 30)
```

クリーンアップ後の状態で **全ファイルが mtime 比較により正しく skipped**。パイプライン整合性 OK。

### 1-5. xd-code/ → src/images/ の混入チェック

- `xd-code/` には 17枚 PNG（命名形式 `{番号}_001__{ID}__{UUID}.png`）と 17件 JSON が存在
- `src/images/` 配下に同形式のファイルが混入していないか find で全検索 → **混入ゼロ**
- xd-code/ は構図確認用として隔離されており、画像素材として誤って扱われていない

### 1-6. カンプ本体（`260512_京浜電設.xd`）との整合性（軽め）

- アーカイブ構造: `manifest / mimetype / preview.png / thumbnail.png / files/ / resources/`
- `resources/` 内に **104件のリソース** が格納（写真素材・SVG・グラフィックコンテンツ等が UUID 形式で保存）
- `preview.png` は **99 × 2048 縦長**（TOPページのフルプレビューと推定）
- 既存 `src/images/` の写真素材（`top-interview-visual.png`, `top-rep-message.jpg`, `top-career-story.jpg`, `mv_img.jpg` 等）はカンプから書き出された素材として配置済み。**目視範囲では破綻なし**

---

## 2. 修正した項目（クリーンアップ実施ログ）

### 2-1. `.DS_Store` 削除（2件）

```bash
rm -v /Users/yumauda/web/keihin/.DS_Store
rm -v /Users/yumauda/web/keihin/src/images/.DS_Store
```

**理由**: macOS 自動生成のメタファイル。リポジトリ運用上ノイズ。`.DS_Store` の find 全検索でこの2件のみ存在を確認、削除後ゼロを確認。

### 2-2. 孤児画像 `images/common/top-instagram-sp.png/webp` 削除（2件）

```bash
rm -v /Users/yumauda/web/keihin/images/common/top-instagram-sp.png
rm -v /Users/yumauda/web/keihin/images/common/top-instagram-sp.webp
```

**理由（パス不整合の解消 = Phase 1 申し送り対応）**:

- `index.php` (424行) は **`./images/top/top-instagram-sp.webp`** を参照
- ソース画像は **`src/images/top/top-instagram-sp.png`** に存在（`src/images/common/` には存在しない）
- 一方、`images/common/` に **同名 PNG/WebP のコピー** が `Apr 21 14:16` 時点で存在 → これは過去配置時の置き忘れ／パス変更時の残骸（`src/` に元ファイルが無いため `compress-images.js` でも再生成されない孤児）
- 参照は `top/` に統一されており、`common/` 側のコピーは **「使われない・元が無い・将来再生成もされない」3拍子の孤児** だったため削除して整合性を取った
- 削除後、`top/` 側の `top-instagram-sp.png/webp` のみが残り、`index.php` の参照と完全一致

### 2-3. 削除しなかったもの（参考）

- `src/images/common/.gitkeep` — Git 用空ファイル維持。残置
- `src/images/top/.gitkeep` は無し（top には実画像があるため不要）
- `xd-code/` 配下の 17枚 PNG / 17件 JSON — 構図確認用として継続保持（Phase 3 でカンプ照合に使う）

---

## 3. Phase 3 に申し送る要確認項目

### 3-1. 【最優先】`./images/common/contact-arrow.svg` の取り扱い決定

**現状**:
- `index.php` の **552行・676行** の2箇所で `<img src="./images/common/contact-arrow.svg" alt="" width="35" height="35">` として参照
- ただしこの2箇所は **両方とも contact セクション内**（`<!-- -->` で PHP コメントアウト中）にあるためレンダリングされず、**実害ゼロ**
- 実ファイルは `src/images/common/`・`images/common/` どちらにも存在しない

**判断オプション**（Phase 1分析「6. 確認事項 #1」と連動）:

| シナリオ | 対応 |
|---|---|
| A. contact セクションを **削除** | コメントアウト解除＋HTML削除＋`_p-contact.scss` 削除＋`mail.php` 削除＋このSVG参照も自然消滅。**追加配置不要** |
| B. contact セクションを **採用サイト用エントリーフォームに差し替え** | 新規デザイン次第。エントリー用矢印アイコンが必要なら `src/images/common/` に **新たに配置** |
| C. contact セクションを **そのまま復活** | `src/images/common/contact-arrow.svg` を **新規配置必要**（カンプから書き出すか、汎用矢印アイコンを作成） |

→ **代表（ウダさん）への確認推奨**: contact セクションの方針が決まり次第、SVG の取り扱いを連動判断。

### 3-2. 【中】カンプ本体の写真素材との細部照合

- カンプ `resources/` に 104件のリソース。既存配置済みの写真素材（MV / 代表写真 / CAREER写真 / INTERVIEW 4枚 / Instagram カード 等）と最終版が一致しているかは **目視範囲では問題なし** だが、ピクセル単位の差分確認は未実施
- Phase 3 でカンプを開いて照合しながらコーディングする際、**「画像差し替えが必要」と判明したら必ず `src/images/{common|top}/` に PNG/JPG で配置**（`images/` 直接配置禁止）
- 新規配置後は `npm run compress:images` 単発、または `npm run dev` で自動的に圧縮+WebP 生成

### 3-3. 【中】SP用画像の追加可能性

- 現状 SP 専用画像は **`top-instagram-sp.png`** のみ（`src/images/top/`）
- カンプ本体に SP 専用アートボードがある場合、SP 用に切り出す画像（ヒーロー縮小版・ナビ用アイコン等）が追加で必要になる可能性
- Phase 3 担当が SP 検証時に判断、必要なら **`src/images/{common|top}/` に新規配置**

### 3-4. 【低 / 参考】`generate-styles.js` の挙動が確定

Phase 1分析「6. 確認事項 #7」（手書きか自動か）の答え:
- **完全自動生成**。`src/sass/{base,layout,project,component}/*.scss` を glob → ソート → `@use` 文を `styles.scss` に書き出し
- 新規 `_p-*.scss` を作るだけで取り込まれるため、Phase 3 で `styles.scss` に手で `@use` を追記する必要はなし

---

## 4. 最終チェックリスト

- [x] `src/images/common/` `src/images/top/` の全画像リストアップ
- [x] `images/common/` `images/top/` の全画像リストアップ
- [x] `src/` にあるが `images/` に圧縮版が無い画像 → **0件**
- [x] `images/` にあるが `src/` に元ファイル無し（孤児）→ **2件発見・削除済み**
- [x] PHP 3ファイルの `./images/...` 参照パス全件抽出 → **23パス中 22件 OK / 1件 NG**（NG=`contact-arrow.svg`、コメントアウト中で実害なし）
- [x] Phase 1指摘の `top-instagram-sp.png` パス不整合 → **解消（孤児コピー削除）**
- [x] `.DS_Store` 削除 → **2件削除済**
- [x] `xd-code/` PNGの `src/images/` 混入チェック → **混入なし**
- [x] カンプ `.xd` の `resources/` 確認 → **104件・preview 99x2048・問題なし**
- [x] `compress-images.js` 論理チェック → **OK**
- [x] `generate-styles.js` 論理チェック → **OK・自動生成と確定**
- [x] `npm run compress:images` 実動作 → **OK・30件全て skipped**

---

## 5. Phase 3 担当への一言

> **画像周りはクリーンな状態で渡せます。**
>
> 唯一の懸念点は contact セクション内の `contact-arrow.svg` 参照（実ファイル無し）ですが、
> 同セクションが PHP コメントアウト中のため現状はレンダリングされず実害ゼロです。
>
> contact セクションの取り扱い（削除 / エントリーフォーム差し替え / 復活）が確定したら、
> その流れで SVG 配置の要否も同時に判断してください。
>
> 新規画像の追加配置は今回のスコープではゼロ件で完了しました。
> 以降の追加は **必ず `src/images/{common|top}/` 経由** で。
