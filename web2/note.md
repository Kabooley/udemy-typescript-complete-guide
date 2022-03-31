# Note: complete typescript course

職場の PC に保存してあるのノートと統合すること

## REST API: 実現したい REST 通信

GET `/posts`
GET `/posts/:id`
POST `/posts`
PUT `/posts/:id`
DELETE `/posts/:id`

## REST API: 速攻でバックエンドを用意して RESTful 通信する環境を整える

用意するもの３つ：

1. axios
   REST 通信をする API でもはやこれ使わないとかあり得るの？くらいなやつ

2. json-server
   偽フル REST API 通信するバックエンド

3. parcel
   モジュールバンドらとして

```bash
$ npm i -D parcel
$ npm i -g json-server
$ npm i axios
```

json-server の使い方：

https://www.npmjs.com/package/json-server

1. `db.json`ファイルをルートディレクトリに作る
2. `db.json`に任意のデータを記述する
3. json-server を起動する
   `json-server -w db.json`
4. `http://localhost:3000`でバックエンドサーバの稼働状況を見ることができる
5. あとはフロントエンド開発者はこの`http://localhost:3000`というエントリポイントを使って axios を使ってとかして通信すればいい

```bash
# 具体的なフローチャート
$ touch db.json
$ echo '{"users": []}' > db.json
$ json-server -w db.json
# open another terminal
$ parcel index.html
```

json-server はレコードを作成するたびに新しい id を生成する

parcel の準備：

講義では parcel-bundler を使っているが現在は
このパッケージは deprecated(非推奨)である

ということで`parcel`をインストールする

```bash
# devDependenciesとして
$ npm i -D parcel
```

公式によれば
下記のように JavaScript ファイルを追加したい場合は、
**type="module"としないとならない**

```html
<!-- index.html -->
<body>
    <link rel="stylesheet" href="./src/styles/style.css" />
    <script type="module" src="./src/index.ts"></script>
</body>
```

```bash
$ parcel inde.html
```

--watch しているときみたいに一度実行開始したら nodemon みたいに変更を検知して自動でトランスパイルして、
`http://localhost:1234`へ展開される

あとは axios で JavaScript ファイル内で通信するコードを書くだけ

## User クラスの実装と抽象化

次の class User へ class Everything を導入する方法の検討

```TypeScript
import axios, { AxiosResponse } from 'axios';

interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

// 今のところ、引数なし戻り値なしの関数しか受け付けない
type Callback = () => void;

export class User {
    constructor(private data: UserProps) {}

    get(propsName: string): number | string {
        return this.data[propsName];
    }

    set(update: UserProps): void {
        console.log(update);
        Object.assign(this.data, update);
    }


    fetch(): void {
        console.log('fetching...');
        axios
            .get(`http://localhost:3000/users/${this.get('id')}`)
            .then((response: AxiosResponse): void => {
                this.set(response.data);
            });
    }

    save(): void {
        console.log("saving...");
        // 既存のidを指定していれば、
        if(this.get('id')) {
            // putで既存ユーザを更新する
            axios.put(`http://localhost:3000/users/${this.get('id')}`, this.data);
        }
        else  {
            // そうでないならpostで保存する
            axios.post(`http://localhost:3000/users`, this.data);
        }
    }
}

// Everything.ts

interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

// 今のところ、引数なし戻り値なしの関数しか受け付けない
type Callback = () => void;

export class Everything {

    events: { [key: string]: Callback[] } = {};

    on(eventName: string, callback: Callback): void {
        const handlers = this.events[eventName] || [];
        handlers.push(callback);
        // 動的な配列の生成
        this.events[eventName] = handlers;
    }

    trigger(eventName: string): void {
        const handlers = this.events[eventName];
        if (handlers || !handlers.length) return;
        handlers.forEach((cb) => {
            cb();
        });
    }

}
```

アプローチは 3 通り。

1. 依存関係を constructor の第二引数として受け付けるようにする

```TypeScript
export class User {
    constructor(
      private data: UserProps,
      private events: Everything
      ) {}
// ...
}

new User({id: 1}, new Everything());
```

2. コンストラクターへの依存関係のみを受け入れ、静的クラスメソッドを定義して、ユーザーを再構成し、後でプロパティを割り当てる

```TypeScript

```
