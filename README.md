# 【DartSass】タンクGulp環境（スマホファースト）

## 環境
- Gulpが使える環境が前提（4系）
- Nodeはバージョン14以降

## 使い方
- ダウンロードしたフォルダを開く
- ターミナルを開き、 npm i とコマンドを入力
- node_modulesとpackage-lock.jsonが生成されるのを確認する
- 開発時は `npm run dev` を実行

## 仕様
- sassの記述はsrcフォルダの中で行う
- 画像は `src/images/common/` などに格納する（自動で圧縮されます）
- 圧縮された画像は第一階層の `images/`（`js/` や `scripts/` と同階層）に出力されます
- すでに出力済みで更新されていない画像は、再圧縮しません（差分だけ処理します）
- jsに関する記述は第一階層のjsフォルダの中で行ってください。特に圧縮等は行っていません。

## 備考
- スマホファーストが前提の仕様です。
- rem記述を前提としています。
- ルートフォントをvwで設定していることからPCサイズのレイアウトをタブレットで表示させることが出来ます（remで書いた場合のみ）。
# tankenvironment
# tank_viteEnvironment
# hako_scan
# tank_viteEnvironment
# keihin
