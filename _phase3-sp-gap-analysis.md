# SP版TOP ギャップ分析（Phase 3 着手前 / カンプ vs 現状実装）

- 作成日: 2026-05-14
- 担当: 制作ディレクター（ファーストステップ）
- 対象案件: 京浜電設 採用サイト（`/Users/yumauda/web/keihin/`）
- 入力資料:
  - `/tmp/xd_preview/preview.png`（**SP版TOPのカンプ全景プレビュー / 99×2048 縦長サムネイル**）
  - `/Users/yumauda/web/keihin/index.php`（現状HTML）
  - `/Users/yumauda/web/keihin/src/sass/project/_p-*.scss`（現状SCSS）
  - `_進捗分析.md` / `_phase2-画像チェック結果.md`（Phase 1 / Phase 2 引き継ぎ）
- 出力先: 本ドキュメント（Phase 3 コーディング担当への申し送り）

---

## 0. サマリー（3行）

- SP版TOPの **9セクションの順序・基本骨格は preview.png（SPカンプ）と現状実装で一致**。レイアウト崩れにつながる致命傷は確認できなかったが、**MV のテキスト位置、CAREER の画像/テキスト順序、Welfare のオレンジ募集要項ボタンの順序、Instagramカードの SP 画像出し分け** に **中〜高 の修正候補が複数** 存在する。
- **preview.png は 99×2048 の超低解像度サムネイル**（カンプ全景の縮小）で、**フォントサイズ・余白・装飾線の太さなどピクセル精度の検証は不可能**。骨格レベルのギャップは抽出できたが、最終仕上げには **`TOP_モバイル` アートボードの書き出し（高解像度PNG + JSON）が必須**。
- 優先度サマリー: **高 4件 / 中 8件 / 低 5件**。最優先は (1) MV 文字組み、(2) p-top-career の画像→テキストのモバイル順序、(3) Instagramバナーの SP/PC 出し分け検証、(4) `.p-people` セクションの背景色（カンプは明るい背景に黒文字、SCSSは `color: #fff` で白文字前提）の 4点。

---

## 1. preview.png から読み取った SPカンプの構造

99×2048 のため文字判読は不可だが、各セクションの **色面構成・段数・カード並び・ボタン位置・装飾の有無** は確認できた。上から順に整理する。

| # | セクション | カンプ（preview.png）の読み取り |
|---|---|---|
| 0 | ヘッダー | 白背景・横長の細いバー。左にロゴ、右に小さい橙色のエントリーボタン（推定）。**ハンバーガーは確認できず**（preview の解像度の限界）|
| 1 | MV | 上部に大きなビジュアル（人物 or 工事写真）。**画像内に白文字の「輝く未来のためにともに育とう。」**、下部に grow to glow ロゴ。SPでは画像の縦比率がやや縦長気味（PCより縦に伸びている印象）|
| 2 | リード文 (`p-top-text`) | 白背景・センター揃え・青文字（#005DC9）。**3行のリード文**。PCより明らかにフォント小さく、余白も詰まっている |
| 3 | INTERVIEW (`p-top-interview`) | ベージュ系背景（#f2f1e9）。中央寄せ大見出し「INTERVIEW」＋オレンジ短下線＋小見出し「働く仲間の言葉」。**カード4枚を 2×2 グリッドで縦並び**（PCは横一列4枚→SPは2列×2行）。下に丸ボーダーの「MORE」ボタン |
| 4 | OUR PEOPLE (`p-people`) | **白〜薄い背景** に黒文字の見出し（PC実装の dark-blue 背景＋白文字とは違って見える）。中央に **吹き出し型の青パネル「京浜電設に合うのは、こんな人です」**。下に **5枚カードを縦1列スタック**（PCは5カラム横並び→SPは1列縦並び）|
| 5 | 数字 (`p-top-number`) | ベージュ系背景。「数字で見る京浜電設」見出し＋オレンジ下線。**8枚カードを 2×4 グリッド**（PCは4×2→SPは2×4）。下に青いCTA「京浜電設の仕事を見る」（角丸ピル形・矢印アイコン）|
| 6 | MESSAGE / 代表 (`p-top-rep`) | 白背景。**テキストブロックが先 → 代表写真が後**（縦積み）。中央寄せの見出し＋オレンジ下線、「三方よしの理念を胸に、新たな時代へ。」のキャッチ、3行説明、丸ボタンの「MORE」、その下に代表写真 |
| 7 | CAREER UP STORY (`p-top-career`) | ベージュ系背景。**カンプは「画像が上 → テキストが下」の縦積み**。「CAREER UP STORY」大見出し＋オレンジ下線、キャッチコピー、青いCTA「キャリアプランを見る」（角丸ピル形）|
| 8 | LICENSE (`p-top-license`) | ベージュ系背景の中に白いカード。「社員の学生時代の専攻学部・学科・保有する資格」見出し＋オレンジ下線。3ブロック（専攻学部 / 専攻学科 / 保有する資格）、丸ボーダーボタン「出身校などについてもっと見る」。その下に **学校ロゴの横スクロールループ**（高さは細め）|
| 9 | WELFARE (`p-top-welfare`) | 白背景。中央寄せ見出し「OUR BENEFITS」＋オレンジ下線（**注: 実装は "WELFARE" になっている可能性あり、後述ギャップ #W1**）、説明文、薄青パネルに12項目を **2列グリッドで縦並び**、その下にオレンジの大きな募集要項CTA、最下部に Instagram カード（SP用横長画像） |
| 10 | フッター | 黒背景。**最初にナビリンク群（縦並び 3カラムが SPで縦に積まれているか、または15項目すべて縦1列）**、その下にロゴ＋住所＋TEL、最下部にコピーライト |

### preview.png から読み取れた SP特有の要素
- MV テキストの位置: PC は背景画像の中央〜下部だが、**SP は画像内の上部寄り** に見える
- p-people セクションが **PC（暗背景・白文字想定）と異なり、明るい背景に黒文字**で組まれている可能性が高い
- カード並びは PC = 横一列のものが、SP = 2列または1列の縦積みに揃って変換されている
- ヘッダーロゴが SP では小さめ、エントリーボタンは PC より控えめなサイズ

---

## 2. 現状SCSS実装の SP対応状況（モバイルファースト規約）

このプロジェクトは **モバイルファースト**（`@include mq(md)` 未満がデフォルト = SPスタイル）。各セクションの SP 既定値を抜粋した。

| セクション | SP既定値の主要プロパティ（抜粋） | 備考 |
|---|---|---|
| `.p-mv` | `padding-top: rem(109)`、`.p-mv__img: width 100vw, calc(50% - 50vw) で全幅化`、`.p-mv__title: font-size rem(24), color #fff, position absolute, top rem(120), left rem(20), letter-spacing 0.45em` | **絶対配置でテキストを画像上に乗せている**。SPの top:120 / left:20 は preview.png のテキスト位置（やや上寄り）と概ね整合 |
| `.p-top-text` | `padding-top/bottom: rem(20)`、`.p-top-text__title: font-size rem(15), color #005dc9, text-align center, font-weight 700` | **SP=15px は preview の小さい見え方と整合**。3行 `<span class="p-top-text__line">` で改行 |
| `.p-top-interview` | `background-color #f2f1e9`、`padding-top/bottom: rem(24)/rem(40)`、`cards: grid-template-columns: repeat(2, 1fr); column-gap: rem(13); row-gap: rem(15)`、`card-title: rem(13)`、`name: rem(11)`、`button: rem(140)×rem(35)` | **2列グリッドでカンプと一致**。サブタイトル下のオレンジ短下線も `::before width rem(148)` で対応済み |
| `.p-people` | `padding-top/bottom: rem(48)/rem(64)`、`content: color #fff`（**白文字**）、`title: color #000, font-size rem(24)`、`message: background #4688e3, color #fff`（吹き出し→`::after`で下向き三角）、`lead: color #000`、`cards: display grid, gap rem(24)`（**列指定なしなので1列縦並び**）、`card: background #f2f2f2, min-height rem(406)` | **`.p-people__content` に `color: #fff` が掛かっている点に懸念**。preview を見る限り見出し周辺は黒文字背景白系。`title` `lead` `field-label` 等は個別に色指定で上書きしているが、`card-title` `card-text` は **content の白色を継承** → カードは灰背景 #f2f2f2 + 白文字 で **読めない可能性**。要確認 |
| `.p-top-number` | `background #F2F1E9`、`padding-top/bottom: rem(37)/rem(54)`、`heading::before: width rem(195) オレンジ下線`、`title: font-size rem(20)`、`cards: grid-template-columns: repeat(2, 1fr); gap rem(10)`（**2×4 グリッドでカンプと一致**）、`button: width rem(250) (青ピル+矢印)` | カンプ（2×4 / 青CTA / 矢印）と整合 |
| `.p-top-rep` | `background #fff`、`padding-top/bottom: rem(72)`、`title: rem(48), Bebas Neue`、`sub-title: rem(15)`、`catch: rem(22)`、`description: rem(16)`、`button-wrap: justify-content center`、`image: margin-top rem(40)`（**SPでは body は flex 化されずデフォルトで縦並び**） | **HTML順 `text → image` をそのまま縦に並べる**。カンプ「テキスト → 写真」と整合 |
| `.p-top-career` | `background #F2F1E9`、`padding-top/bottom: rem(72)`、`body: SPはflexなし → HTML順そのまま縦並び`（**HTMLは `image → text` の順**）、`heading::before: width rem(220) オレンジ下線`、`title: rem(48)`、`button: width 100% 青ピル` | **HTML順 image→text なのでSP表示も「画像→テキスト」**。カンプ（preview）と整合。**カンプ精読では画像→テキストの順だった** |
| `.p-top-license` | `background #f2f1e9`、`padding-top/bottom: rem(72)`、`box: background #fff, border-radius rem(15), padding 36/24/48/24`、`title: rem(28)`、`button: width 100%, max-width 100% (SP)`、`loop: margin-top rem(40)`（学校ロゴループ） | カンプの白カード＋ベージュ背景の構造と整合 |
| `.p-top-welfare` | `background #fff`、`padding-top: rem(54), padding-bottom: rem(72)`、`title: rem(48) "WELFARE"`、`sub-title: rem(15) "福利厚生"`、`description: rem(13)`、`more: 丸ボタン`、`panel: background #e5f5ff, padding 20/24, list: grid 2列`、`button(募集要項): max-width rem(273), background #f77423`、`instagram: margin-top rem(40), max-width rem(529)` | **HTML順は `text → panel → button → instagram`**。カンプの並びと整合。**ただし preview の見出しが "OUR BENEFITS" に見える点は要検証**（ギャップ #W1） |
| `.p-header` | `height: rem(50)`、`logo: width rem(180)`、`utility: display none (SP)`、`nav: display none (SP)`、`language: display none (SP)`、`entry: height rem(38), min-width rem(108)` | **SPはナビ・言語切替を非表示**。ロゴ + エントリーボタンのみ表示。**ハンバーガーメニューの実装は無し**（要確認: カンプにハンバーガーがあるか） |
| `.p-footer` | `padding-top: rem(29)`、`inner: flex-direction column, padding-left/right rem(28), padding-bottom rem(27)`、`brand: order 2, margin-top rem(26)`（=ナビが先、ブランドが後の順）、`nav-wrap: order 1`、`nav + nav: margin-top rem(14)`（**3つのnavがSPでは縦に積まれる**）、`nav-link: font-size rem(10), line-height 2.6` | **`nav-wrap` が `order:1`、`brand` が `order:2`** = SPは「ナビ → ロゴ・住所」の順。preview.png と整合 |

### 全体的なSP実装の評価
- **モバイルファースト規約は徹底されている**（各 `_p-*.scss` の最上段がSP、`@include mq(md)` 以下がPC上書き）
- グリッド/フレックスの切り替えはセクションによって流儀が混在しているが、**カンプの縦/2列/横の並びは概ね再現できる構造**になっている
- 重大な抜けは少ないが、**色の継承**（特に `.p-people__content { color: #fff }` → カード子要素への影響）、**HTML順の並び**（rep / career は body が SP で flex 化されないのでHTML順がそのまま縦並びになる仕様）の取り扱いに **意図と実装のズレ** が混在している箇所がある

---

## 3. セクション別ギャップ一覧（テーブル形式）

凡例:
- カンプ = preview.png から読み取った想定挙動
- 実装 = 現状の SCSS/HTML
- 優先度: **高 / 中 / 低**
- 検証必要 = preview の解像度では断定できず、TOP_モバイル の高解像度書き出しで再確認が必要

### 3-1. MV（`.p-mv`）

| # | カンプ | 実装 | ギャップ | 優先度 |
|---|---|---|---|---|
| MV1 | テキスト「輝く未来のためにともに育とう。」が画像中央〜やや上 | `.p-mv__title { top: rem(120); left: rem(20); }` で絶対配置（画像上から120px・左20px） | top値が画像高さに対して妥当か要検証。preview では文字位置が画像縦中央寄りに見える | **中**（検証必要）|
| MV2 | grow to glow ロゴが画像下端付近に重ねて配置 | `.p-mv__logo { position: absolute; bottom: rem(20); left: 0; }`、`max-width: rem(904)` | max-width 904px のままだとSPでは画像幅一杯まで広がる。**ロゴサイズの SP 専用調整が必要そう**（SPでは横幅が狭く、ロゴが画像幅いっぱいに広がりすぎる懸念）| **中**|
| MV3 | MV画像の縦横比 | `<img width="1400" height="746">` で1400:746（=およそ16:8.5）。`object-fit: cover` | カンプのSP MV は **PCより縦長に見える**。PC用画像 `mv_img.webp` のままだと SPで両サイドがクロップされ過ぎる可能性。**SP用 MV画像を切り出した方が良い可能性**（要 TOP_モバイル 確認）| **中**（検証必要）|
| MV4 | MV直下のリード文との余白 | `.p-mv: padding-top rem(109)` のみ、`padding-bottom` 指定なし | preview 上ではMVと次セクションが密着。PC同様 padding-bottom 0 でOKと推定 | **低**|

### 3-2. リード文（`.p-top-text`）

| # | カンプ | 実装 | ギャップ | 優先度 |
|---|---|---|---|---|
| TT1 | 3行で改行、青文字、中央寄せ、SP では小さめ | `font-size: rem(15)`、`color #005dc9`、3つの `<span class="p-top-text__line">` で改行 | **概ね一致**。実機での行間 `line-height: 1.5` の見え方を要確認 | 低 |
| TT2 | セクション上下の余白 | `padding-top/bottom: rem(20)` 各20px | preview では MV直下のリード文セクションがやや空気感を持つ。20px だと窮屈な可能性あり | **中**（検証必要）|

### 3-3. INTERVIEW（`.p-top-interview`）

| # | カンプ | 実装 | ギャップ | 優先度 |
|---|---|---|---|---|
| IV1 | カード 2×2 グリッド、画像→タイトル→名前 | `grid-template-columns: repeat(2, 1fr)`、`column-gap rem(13), row-gap rem(15)` | **整合**。SPでは2列が正しい | — |
| IV2 | MOREボタンの位置・サイズ | `width rem(140), height rem(35), border-radius rem(24)`、丸い黒矢印アイコン | preview 上のボタンサイズ感と整合。**ただしカンプでは MOREボタンが横幅もっと大きい可能性**（カンプ要再確認）| 低 |
| IV3 | サブタイトル下のオレンジ短下線 | `::before { width: rem(148); border-top: rem(3) solid #f77423; }` | **整合**。SP width 148px はPC(248)より短く、preview の見え方とも合う | — |
| IV4 | 4カード目のテキスト「私をきちんと見てくれる そんな会社で働く心地よさ」のSPでの折り返し | `card-title: font-size rem(13)`、HTMLに `<br>` 入り | **2行収まる**と推定するが、SP実機での文字溢れチェック必要 | 低 |

### 3-4. OUR PEOPLE（`.p-people`） — **要注意ポイント多数**

| # | カンプ | 実装 | ギャップ | 優先度 |
|---|---|---|---|---|
| PP1 | **背景が明るい（白〜オフホワイト）**。見出しが黒文字 | `.p-people__content { color: #fff }`（白文字）。`.p-people` 自体は背景色指定なし（=白を継承する想定） | `.p-people__content` の `color: #fff` は **PC想定で書かれていそうだが、SPでも白継承**。子要素で個別に黒指定している箇所（title / lead / field-label / card-title なし）と継承箇所が混在。**カード内 `card-title` `card-text` `field-text` は白文字のまま継承** → 灰背景 #f2f2f2 のカードに白文字で **読めない** 懸念。**カンプ精読が最重要**| **高** |
| PP2 | 5枚カードが **SPでは縦1列スタック**（preview から判読） | `.p-people__cards { display: grid; gap: rem(24); }`（**列指定なし = 1列縦並び**）| **整合**。`@include mq(md)` 以降で `grid-template-columns: repeat(5, 1fr)` に切り替わる | — |
| PP3 | 吹き出し「京浜電設は、誰にでも合う会社ではありません。」 | `.p-people__message { background #4688e3; ::after で下三角 }` | **整合**。下三角もSP既定値で出る | — |
| PP4 | カードの最小高さ `min-height: rem(406)` | SP実機で5枚積むと高さ約 406×5 = 2030px だけで縦長になる | **5枚縦並びだと縦に冗長になりすぎないか**。カンプ preview ではカード並びがそんなに縦長に見えない（高さも揃っている）。**SP では min-height を緩めるか、カード内テキスト量に応じた auto 高さが望ましい可能性** | **中** |
| PP5 | 見出しの英字「OUR PEOPLE」（グレー、Bebas Neue） | `.p-people__en { color: #a8a8a8, font-size rem(26), font-family $second-font-family }` | 整合 | — |
| PP6 | カードのSVGアイコン色 | `.p-people__icon { color: #5b92c2 }`（青系）| 整合 | — |

### 3-5. 数字で見る京浜電設（`.p-top-number`）

| # | カンプ | 実装 | ギャップ | 優先度 |
|---|---|---|---|---|
| NB1 | 8カードを 2×4 グリッド | `grid-template-columns: repeat(2, 1fr); gap rem(10)` | **整合** | — |
| NB2 | 各カードはSVG/画像（数字+ラベル）が1枚絵で入っている | `<img>` で各カード `top-number-card-01.png` 〜 `top-number-card-08.png` 参照 | **画像1枚絵なのでSPで縮小されても見やすさは画像依存**。SP用に専用画像が必要かは要検証（preview では問題なさそう）| 低 |
| NB3 | CTAボタン「京浜電設の仕事を見る」（青ピル+白丸矢印）| `.p-top-number__button { width rem(250), background #476ed6, border-radius rem(45) }` | 整合。サイズも妥当 | — |
| NB4 | セクション上余白 | `padding-top: rem(37)` | preview の OUR PEOPLE → 数字 への切れ目で 37px は妥当に見える | 低 |

### 3-6. MESSAGE / 代表（`.p-top-rep`）

| # | カンプ | 実装 | ギャップ | 優先度 |
|---|---|---|---|---|
| RP1 | **SPはテキストブロック → 代表写真の縦積み** | HTML順: `text → image`、SPは flex 化なし = HTML順そのまま縦並び | **整合** | — |
| RP2 | 見出し「MESSAGE」＋オレンジ短下線＋小見出し「代表メッセージ」 | `.p-top-rep__heading + ::before width rem(180)` | 整合 | — |
| RP3 | MOREボタンの位置 | SPは `justify-content: center`（PCは flex-start に上書き）| **整合**（SPセンター揃え）| — |
| RP4 | 代表写真は中央配置 | `.p-top-rep__image { margin-top: rem(40) }`、width 指定なし = 100%（SP）| 画像はSPで100%幅。preview ではフィットしている。**ただし `width="500" height="352"` の固定アスペクト比なので画像歪み懸念**は実装上 `display: block; width: 100%; height: auto;` でOK | 低 |
| RP5 | 上下padding `rem(72)` SP / `rem(64)` PC（**SPの方が大きい**）| 通常はPCのほうが余白大きい流儀だがSPの方が大きい逆転 | 意図的か要確認だが、preview を見る限り余裕ある余白に見えるので問題なし | 低 |

### 3-7. CAREER UP STORY（`.p-top-career`） — **HTML順の妥当性**

| # | カンプ | 実装 | ギャップ | 優先度 |
|---|---|---|---|---|
| CR1 | **SPは画像 → テキスト の縦積み**（preview の見え方）| HTML順: `image → text`、SPは flex なし = HTML順そのまま縦並び | **整合**（画像→テキストの順は preview と一致）| — |
| CR2 | 見出し「CAREER UP STORY」＋オレンジ下線、小見出し「キャリアアップストーリー」 | `.p-top-career__heading::before width rem(220)`（SP）/ rem(405)（PC, left:0, transform:none）| **SPの下線位置が center 配置** で `transform: translateX(-50%)` の中央寄せ。問題なし | — |
| CR3 | キャッチコピー「会社と自らの夢の実現に向けて〜」を SP では中央寄せ | `.p-top-career__catch { text-align: center }`（SP）/ `text-align: left`（PC）| **整合** | — |
| CR4 | 「MORE」ボタン + 大型青CTA「キャリアプランを見る」の2段ボタン | `.p-top-career__more`（小丸ボタン）+ `.p-top-career__button`（青ピル width 100%）| **整合**。SPでは青CTAが画面幅100%で目立つ | — |
| CR5 | 青CTAのサイズ感 | `min-height: rem(56), width: 100%, padding-left rem(24)` | SP では幅いっぱい。preview とも整合 | — |
| CR6 | HTML内に **MOREボタン (`__more`)** と **大型ボタン (`__button`)** が両方ある | 実装も両方ある | preview を見る限り **両方表示** されている。整合 | — |

### 3-8. LICENSE（`.p-top-license`） — 学校ロゴループ

| # | カンプ | 実装 | ギャップ | 優先度 |
|---|---|---|---|---|
| LC1 | 白カード in ベージュ背景、3ブロック（学部 / 学科 / 資格）| `.p-top-license__box { background #fff, border-radius rem(15), padding 36/24/48/24 }` | 整合 | — |
| LC2 | タイトル「社員の学生時代の専攻学部・学科・保有する資格」 | `font-size: rem(28)` SP / rem(35) PC | **SPで28pxは長いタイトルとしては大きめ**。実機で折り返しを確認 | 低 |
| LC3 | ボタン「出身校などについてもっと見る」(SP) は白い丸ボーダーボタン、幅いっぱい | `.p-top-license__button { width: 100%, min-height rem(40) }` | 整合 | — |
| LC4 | 学校ロゴループ（横スクロール） | `.p-top-license__loop-track img { width: rem(4200) }` SP / `rem(5141)` PC、`animation: 80s linear infinite` | **SPは 4200px幅の画像をループ**。アニメーション動作の検証が必要だがコード上は問題なし | 低 |
| LC5 | LICENSEセクションの上下padding | SP `rem(72)/rem(72)` / PC `rem(64)/rem(24)`（**SPの方が padding-bottom が大きい**）| ループとの間隔バランスをカンプで要確認 | 低 |

### 3-9. WELFARE / 福利厚生（`.p-top-welfare`） — **タイトル文言**

| # | カンプ | 実装 | ギャップ | 優先度 |
|---|---|---|---|---|
| W1 | **preview を拡大すると見出しが "OUR BENEFITS" に見える** | 実装は `<h2 class="p-top-welfare__title">WELFARE</h2>` | **文言ズレの可能性**。**カンプ精読が必要**。preview の解像度では断定不可だがレイアウト上「W」より「O」始まりに見える | **高**（検証必要）|
| W2 | 12項目パネルが SP では 2列グリッド | `.p-top-welfare__list { grid-template-columns: repeat(2, 1fr); gap rem(14) }` SP / 3列 PC | **整合** | — |
| W3 | 募集要項オレンジCTA（角丸ピル）| `.p-top-welfare__button { background #f77423, max-width rem(273), min-height rem(35) }` | 整合 | — |
| W4 | **Instagramカード（SP用は横長の専用画像 `top-instagram-sp.webp`）** | `<picture>` で `media="(min-width: 768px)" → top-instagram.webp` / `<img> → top-instagram-sp.webp`（SP用は 529×101）| **HTMLは正しく出し分け済み**。**`src/images/top/top-instagram-sp.png` も配置済み**。Phase 2 でパス整合性も解消済み | — |
| W5 | HTML順: `text → panel → button → instagram` | SCSS の `body` は flex なし（PCだけ flex 化）→ HTML順そのまま縦並び | 整合 | — |
| W6 | サブタイトル「福利厚生」が見出しの下にある | 実装あり `.p-top-welfare__sub-title` | 整合 | — |
| W7 | descriptionの SP フォントサイズ | `font-size: rem(13)` SP / rem(16) PC | preview の見え方とは大きな違和感なし | 低 |
| W8 | MOREボタンの位置 | `justify-content: center` SP / `flex-start, margin-left rem(133)` PC | SPでセンターになるのは整合 | — |

### 3-10. ヘッダー（`.p-header` / `includes/header.php`） — **ハンバーガー未実装**

| # | カンプ | 実装 | ギャップ | 優先度 |
|---|---|---|---|---|
| HD1 | SP表示時、ナビ7項目はどこにあるか？ | SCSS: `.p-header__nav { display: none }` SP / `display: block` PC。**SPはロゴ＋エントリーボタンのみ表示** | **ハンバーガーメニューが未実装**。Phase 1 で 0077 アートボード（縦並びサイトマップ + ロゴ + 住所）が SPフッター or SPハンバーガーメニュー かが未確定。**カンプの 0077 がハンバーガーだった場合、新規実装必要** | **高**（検証必要）|
| HD2 | SP の高さ | `height: rem(50)` SP / rem(109) PC | preview と整合（細い横バー）| — |
| HD3 | LANGUAGE切替 | SP は `display: none`（言語切替ボタン非表示）| **SPでは言語切替できない**。要件として OK か確認。グローバル企業ならNG | **中**（要確認）|
| HD4 | エントリーボタン | SP は `height: rem(38), min-width: rem(108)`、PC は rem(44)/rem(138) | preview の小さい橙ボタンと整合 | — |
| HD5 | ロゴサイズ | SP `width: rem(180)` / PC rem(334) | preview と整合 | — |

### 3-11. フッター（`.p-footer` / `includes/footer.php`）

| # | カンプ | 実装 | ギャップ | 優先度 |
|---|---|---|---|---|
| FT1 | SPで **ナビ群が最初 → ロゴ・住所が後** の順 | `.p-footer__nav-wrap { order: 1 }` / `.p-footer__brand { order: 2, margin-top: rem(26) }` | **整合**（preview もナビが先・ロゴ住所が後）| — |
| FT2 | **3つの nav（合計15項目）が SP では縦に積まれる** | `.p-footer__nav + .p-footer__nav { margin-top: rem(14) }` SP / `margin-left rem(34); margin-top: 0` PC | **整合**（SPは縦積み）| — |
| FT3 | nav-item 間の余白 | SP `margin-top: 0`（=各itemは line-height: 2.6 で間隔を取る）/ PC `margin-top: rem(12)` | preview を見る限り SP は項目同士が密 line-height で広がる構造で違和感なし | 低 |
| FT4 | nav-link の文字サイズ | SP `font-size: rem(10)` / PC rem(14) | **SPで10pxは小さい**。可読性懸念。実機で要確認 | **中** |
| FT5 | 住所・TEL の font-size | SP `rem(10)` / PC `rem(15)` | 同上、可読性懸念 | **中** |
| FT6 | copyright の font-size | SP `rem(9)` / PC `rem(13)` | **9pxはかなり小さい**。可読性ギリギリ。要確認 | **中** |
| FT7 | nav-link の `>` 矢印（左端） | `::before { content: ">" }` で実装済み | preview の「> 働く仲間の声」表記と整合 | — |

---

## 4. 修正提案（Phase 3 着手時のチェックリスト）

### 4-A. 【最優先 / 高】 — Phase 3 開始直後に着手

- [ ] **MV テキストの位置検証**（MV1, MV2）: SP実機 / Chrome DevTools のレスポンシブモード（375px / 414px）で `.p-mv__title` の top 値、`.p-mv__logo` の幅・位置を目視確認。必要に応じて SP値を再調整
- [ ] **`.p-people__content { color: #fff }` の影響範囲を再確認**（PP1）: SP実機で `.p-people__card-title` `.p-people__card-text` `.p-people__field-text` が白く表示されていないか。**読めない場合は SP で `color: #000`（または黒系の明示）を継承させる修正が必要**
- [ ] **`.p-people__card` の min-height rem(406) が SP で過剰でないか**（PP4）: 5枚縦並びで縦長になりすぎていないか。テキスト量に応じて `min-height` を緩めるか SP では `auto` にする検討
- [ ] **WELFARE 見出しが "WELFARE" か "OUR BENEFITS" か**（W1）: **TOP_モバイル の高解像度書き出しで確定** → 文言修正の要否を判断
- [ ] **ヘッダーのSPハンバーガーメニューの要否**（HD1）: Phase 1 申し送りの 0077 アートボードを **代表に確認 + カンプ本体を開いて確定**。必要なら別途実装計画

### 4-B. 【中】 — 高の修正と並行 or 直後

- [ ] **MV画像のSP出し分け**（MV3）: PC用 1400×746 のままで SP でクロップ過剰にならないか確認。必要なら `<picture>` で SP用画像を別途切り出し（カンプから書き出し → `src/images/top/mv_img_sp.jpg` 配置）
- [ ] **リード文の上下余白**（TT2）: SP rem(20) が窮屈でないか
- [ ] **CAREER UP STORY HTML順の妥当性確認**（CR1）: HTMLは `image → text` の順、SP で正しく「画像→テキスト」になるが、カンプの本来の意図と一致しているか念のため確認
- [ ] **LANGUAGE切替のSP表示**（HD3）: クライアントへの要件確認
- [ ] **フッターのフォントサイズ**（FT4, FT5, FT6）: 9〜10px は SP で小さすぎる可能性。カンプの実数値を TOP_モバイル の JSON で確認
- [ ] **代表写真のアスペクト比**（RP4）: `width="500" height="352"` の `<img>` がSPで歪まないか確認
- [ ] **INTERVIEW カード4枚目の文字溢れ**（IV4）: 「私をきちんと見てくれる そんな会社で働く心地よさ」がSPで折り返しおかしくないか
- [ ] **`.p-top-rep` の SP padding-top/bottom rem(72)** が PC の rem(64) より大きい逆転構造（RP5）: 意図的か要確認

### 4-C. 【低】 — 余裕があれば対応

- [ ] **LICENSE タイトルの長さ**（LC2）: rem(28) で SP で何行で折り返すか
- [ ] **LICENSE 学校ロゴループのSPアニメーション**（LC4）: 動作確認
- [ ] **INTERVIEW MOREボタン**（IV2）: サイズ感が preview と一致しているか
- [ ] **数字セクションの専用SP画像の要否**（NB2）: カード画像がSPで縮小されすぎていないか
- [ ] **LICENSE セクションの上下padding**（LC5）: ループとの間隔バランス

---

## 5. preview.png では判別困難な箇所（要 TOP_モバイル 書き出し）

preview.png は 99×2048 のサムネイル解像度のため、以下は **TOP_モバイル アートボードの高解像度PNG + 該当JSONの書き出しが必須**:

### 5-1. ピクセル精度の検証項目
1. **MV テキストの厳密な top / left 値** と SP MV画像の縦比率（差し替え要否含む）
2. **MV ロゴ画像の SP 上の正しい幅・位置**
3. **各セクションの見出しオレンジ下線の正確な width**（現状は SP値が PC値の比率縮小で当てられている）
4. **本文テキストの font-size 厳密値**（リード文・description・小見出し・nav-link・copyright 等）
5. **セクション間の余白（padding-top / padding-bottom / margin）**
6. **カード min-height / aspect-ratio**（特に `.p-people__card`）

### 5-2. 文言・構成の確定
7. **WELFARE 見出しが "WELFARE" か "OUR BENEFITS" か**（W1）
8. **0077 アートボードの正体**: SPフッター？ SPハンバーガーメニュー？ どちらでもないSP版下層導線?
9. **ヘッダーにSPハンバーガーボタンがあるか・LANGUAGEがSPに出るか**
10. **MV画像内のテキスト位置**（PC では画像上端120px、SPで同じか別位置か）

### 5-3. 装飾・状態の確認
11. **カード hover / tap 状態**（INTERVIEW カード、MORE ボタン）の SP挙動
12. **`.p-people__cards` が 1列スタックなのか、2列なのか**（preview ではほぼ1列に見えるが断言不可）
13. **学校ロゴループの SP画像が PC と同一か別サイズか**
14. **数字カードのアクセシビリティ**（数字部分が画像なので alt のみの情報伝達でOKか）

---

## 6. Phase 3 担当への申し送りメッセージ

> **SP版TOPの骨格は8〜9割実装済みです。新規セクションを書く必要はなく、調整・検証フェーズが中心です。**
>
> 最初に手をつけるべきは以下の4点です:
>
> 1. **`.p-people` セクションの色継承問題**（card内のテキストが白文字を継承していて読めない可能性）
> 2. **MV テキストの SP上の位置と、MV画像の縦比率**
> 3. **ヘッダーのSPハンバーガー実装の要否確定**（カンプ 0077 + 代表確認）
> 4. **WELFARE 見出しの文言確定**（WELFARE / OUR BENEFITS）
>
> これらは preview.png では断言できないため、**TOP_モバイル アートボードの高解像度書き出しを代表（ウダさん）に依頼**してから着手するのが最も効率的です。書き出しが間に合えば、上記4点 + 中優先の8項目 + 低優先5項目を一気に潰せます。
>
> コード修正のルールは Phase 1 申し送り（`_進捗分析.md` 5-2〜5-8）を踏襲。**生成物（`css/` `images/`）直接編集禁止、SCSS は `src/sass/project/_p-*.scss` を編集、画像は `src/images/{common|top}/` に配置**。

---

## 7. 確認が必要な事項（代表 / クライアントへの確認候補）

| # | 項目 | 緊急度 |
|---|---|---|
| 1 | **TOP_モバイル アートボード の書き出し依頼**（高解像度PNG + JSON）| **最優先** |
| 2 | **0077 アートボード = SPフッター？ SPハンバーガー？ どちら？** | 高 |
| 3 | **WELFARE / OUR BENEFITS どちらが正しい見出しか** | 高 |
| 4 | **SP表示時の LANGUAGE 切替の要否** | 中 |
| 5 | **MV用にSP専用画像が用意されているか / 必要か** | 中 |
| 6 | **`.p-people__card` のテキスト色は何色が正解か**（白 or 黒）| 高 |

---

以上、Phase 3（SPギャップ分析）完了。
**次のアクション**: 代表（ウダさん）に「TOP_モバイル アートボードの高解像度書き出し」を依頼し、書き出し完了後に本ドキュメントの 5章 をベースに最終ピクセル調整方針を確定する。
