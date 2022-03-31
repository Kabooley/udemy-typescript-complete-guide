# Note : Desing Pattern of TypeScript

## 開発環境

```bash
$ npm init -y
$ npm i -D parcel
$ npm i faker
```

## 型定義ファイルを作成する

様々なJavaScriptライブラリを使って開発するとき
TypeScriptはライブラリで定義されているものはわからない

そこで登場するのが型定義ファイルである

たとえばfakerをnpmインストールしていたらこいつの型定義ファイルが必要になる

```bash
# 型定義ファイル
$ npm i -D @type/faker
```

```html
<html>
  <body>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU"></script>
    <script src="./src/index.ts"></script>
  </body>
</html>
 
```

型定義ファイルは次に保存される

```
node_modules/ 
    ├ @types 
            ├ faker
            ├ google.maps
            ＃などなど
```

このファイルを開けばどんな定義があるのか確認できる
このファイルを開いた状態でコマンドパレットで`fold level 2`とうつと見やすくなる

