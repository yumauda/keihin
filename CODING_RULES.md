# Cursor / プロジェクト コーディングルール

このドキュメントは、本プロジェクトで想定している Cursor 利用時のコーディングルール・ガイドラインをまとめたものです。

---

## 全般

- ユーザー・ツール・システム・スキルの指示は**すべて**踏まえて対応する。部分的な適用にならないようにする。
- スキルや MCP が関連する場合は、**先に読んでから**作業する。
- 説明だけでなく、可能な範囲で**自分でコマンド実行・調査・実装**する。
- 日付が絡む場合は、環境で示された「Today's date」を優先する。
- 会話の流れから意図・暗黙の要件を読み取り、最新メッセージは文脈に沿って解釈する。

---

## コード変更の原則

- 依頼に必要な範囲だけ変更する。無関係なリファクタやファイルは触らない。
- 変更前に周辺コードを読み、命名・型・抽象度・ドキュメントの量を既存に合わせる。
- diff の各行が依頼に直結しているようにする。不要なコメント・変数・過度な防御コードは避ける。
- UI は既存の余白・タイポ・色・レイアウトパターンと揃える。
- **ユーザーが明示的に求めない限り**、ドキュメント用の Markdown は増やさない（本ファイルのような依頼時は除く）。

---

## プロジェクト概要（WordPress テーマ想定）

- テーマ名: `blue_print`（ガイドライン上の想定）
- 技術: PHP + Sass + JavaScript（jQuery）

### PHP（代表ファイル）

- `header.php` / `footer.php` / `functions.php`
- `page-*.php`（固定ページテンプレート）
- `front-page.php`

### Sass / CSS

- ディレクトリ: `src/sass/`
  - `base/` … リセット・ベース
  - `component/` … `_c-*.scss`
  - `layout/` … `_l-*.scss`
  - `project/` … `_p-*.scss`（ページ固有）
  - `global/` … 変数・関数・ミックスイン
- 出力: `css/styles.css`（ビルドツールでコンパイル）

### JavaScript

- jQuery 利用
- ライブラリ例: GSAP, Splide, Slick
- 配置: `js/` 配下

---

## CSS 命名（BEM 風）

| プレフィックス | 用途 |
|----------------|------|
| `p-` | ページ／プロジェクト固有 |
| `c-` | 再利用コンポーネント |
| `l-` | レイアウト |
| `u-` | ユーティリティ |

- パターン: `[prefix]-[block]__[element]--[modifier]`
- 子要素: `__`（アンダースコア2つ）
- モディファイア: `--`（ハイフン2つ）

---

## Sass

- ファイル先頭に `@use "global" as *;`（プロジェクトのパスに合わせる）
- `rem()` … px を rem に変換（16px 基準）
- `strip-unit()` … 単位除去
- `vw()` … vw 計算
- `@include mq()` … メディアクエリ（例: `sm=600px`, `md=768px`, `lg=1024px`, `xl=1440px` など設定に従う）
- モバイルファーストで記述し、PC は `@include mq()` で追加

### 余白・Flex のルール

- 余白は原則 **`margin-top`** と **`margin-left`**
- `flex-direction: column` のとき、要素間の余白調整に **`gap` は使わない**（縦は `margin-top`）

---

## HTML

### `img` 必須属性

- `decoding="async"`
- `loading="lazy"`（LCP 対象など適宜除外）
- `width` と `height`

### PHP でよく使う関数（テーマ内）

- `get_template_directory_uri()` / `get_stylesheet_directory_uri()`
- `esc_url()`, `home_url()`
- `get_header()`, `get_footer()`, `get_template_part()`
- `is_front_page()`, `is_page()` など

---

## JavaScript（jQuery）

- DOM 準備後: `$(function () { ... });`
- グローバルでは `jQuery`、関数内では `$` の運用に合わせる

---

## GSAP（アニメーション）

- 既存の `js/gsap.js` に合わせ、**`gsap.timeline()` に `fromTo` / `to` を順に積む**書き方を優先する。
- 細かい関数分割・過度な抽象化は避け、上から読んで流れが分かる形にする。
- レイアウト崩れ防止のため、`position` / `top` / `left` / `width` / `height` を多用しない。**`opacity` / `x,y` / `scale` / `clipPath`** などで表現する。
- 1文字ずつ表示する場合は **SplitText に依存しない**。HTML または JS で一度だけ `span` 分割し、`stagger` で出す。

---

## 画像

- 形式: WebP 推奨
- 共通画像は `images/common/` などルールに合わせる

---

## インデント・引用符

- インデント: **スペース2つ**
- JavaScript: セミコロン必須
- PHP 文字列: シングルクォート優先（変数展開時はダブル）
- HTML 属性: ダブルクォート

---

## GitHub

- コミット・PR の説明は**日本語**で記載する。

---

## ユーザー向けドキュメント・リンク

- コードを引用するときは、ワークスペースのパスなら  
  `開始行:終了行:filepath` 形式のコード参照を使う。
- Web やファイルパスは省略せずフルで書く。
- 読みやすい文章（過度な太字・バッククォートは控えめ）。

---

## 補足

- 実際のテーマ名・ビルドコマンド・ブレークポイントは `src/sass/global/_setting.scss` や `package.json` の現状に合わせて運用すること。
- WordPress 以外の静的ページ／`index.php` 単体構成の場合でも、上記の命名・Sass 構成・HTML のルールはそのまま流用できる。
