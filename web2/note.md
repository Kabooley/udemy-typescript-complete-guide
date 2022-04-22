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
      private events: Eventing
      ) {}
// ...
}

new User({id: 1}, new Eventing());
```

簡単に導入可能だけど、

将来 Eventing 以外のデータが必要になった時に

constructor が膨れ上がるし

new するときに渡すデータが増えていく

2. コンストラクターへの依存関係のみを受け入れ、静的クラスメソッドを定義して、ユーザーを再構成し、後でプロパティを割り当てる

```TypeScript
export class User {
    // userデータは静的メソッドから
    static fromData(data: UserProps) {
        const user = new User(new Eventing());
        user.set(data);
        return user;
    }

    private data: UserProps;

    // Eventingはconstructorから
    constructor(private events: Eventing) {}

    get(propsName: string): number | string {
        return this.data[propsName];
    }

    set(update: UserProps): void {
        Object.assign(this.data, update);
    }

    //...
}
```

将来的に UserProps 以外のデータが必要になった時に
静的メソッド内部に初期化処理を追加するか

静的メソッドを追加する分に応じて増やしていかなくてはならない

3. 直接ハードコーディングしてしまう

```TypeScript

export class User {
    private events: Eventing = new Eventing();

    constructor(private data: UserProps) {}

    get(propsName: string): number | string {
        return this.data[propsName];
    }

    set(update: UserProps): void {
        console.log(update);
        Object.assign(this.data, update);
    }

```

デメリットは、

将来的に Eventing に代わるデータを使いたくなったときに

修正する必要があること

講義ではこのアプローチ 3 を採用する

## 既存のクラスメソッドを分離する

もとの class User から axios 通信に関するメソッドを分離したい

そんなとき

```TypeScript
import axios, { AxiosResponse } from 'axios';
import { Eventing } from './Eventing';

export class User {
    // events: { [key: string]: Callback[] } = {};
    public events: Eventing = new Eventing();
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
```

`Sync.ts`というファイルへ、単純にカット＆ペーストすると

```TypeScript
import axios, { AxiosResponse } from 'axios';


export class Sync {
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
```

すると、

`this`がグローバルを指してしまう

`Sync`と`User`に明確な関係を持たせる必要がある

前提として、

`User`は自身のプロパティとして`Sync`型のプロパティを持つとする

3 つのアプローチがあるよとのこと

1. `Sync`は`save`, `fetch`関数の引数を取得する

デメリット：

`User`に対してのみ利用できるので再利用性がない

2. とある interface を満たす引数を取得する

class Sync
save(id: num, serialize: Serializable): void
fetch(id: num, deserial: Deserialize): void

interface Serializable
interface Deserializable

class User
sync: Sync

3. Generics クラスにする

例として`UserProps`を受け継ぐ

class Sync
save(id: num, data: T): AxiosPromise<T>
fetch(id: number): AxiosPromise<T>

class User
sync: Sync<UserProps>

メリット：再利用性が高い

```TypeScript
// Sync.ts so far.
import axios, { AxiosPromise } from 'axios';
import { UserProps } from './User';

export class Sync {
    constructor(public rootUrl: string) {}
    fetch(id: number): AxiosPromise {
        console.log('fetching...');
        // axios.get()のプロミスを返すようにすれば、
        // そのプロミスをどうするかは外部にお任せできる
        // 
        // こうすることで、
        // fetchの仕事だけを切り出すことができた
        return axios.get(`${this.rootUrl}/${id}`);
    }

    // 同様にsave()でもプロミスを返すようにすれば...
    save(data: UserProps): AxiosPromise {
        const { id } = data;
        console.log('saving...');
        // 
        // DBへの反映結果を外部へ知らせることができる
        // 
        if (id) {
            // putで既存ユーザを更新する
            return axios.put(`${this.rootUrl}/${id}`, data);
        } else {
            // そうでないならpostで保存する
            return axios.post(this.rootUrl, data);
        }
    }
}

// USAGE
//
// const sync = new Sync('http://localhost:3000/users');

```

いまのところ、DBとの通信に関するPromiseを外部へもたらすことができるようになっている

ここで汎用性を持たせるために、Genericsを導入すると...

```TypeScript
import axios, { AxiosPromise } from 'axios';
import { UserProps } from './User';

export class Sync<T> {
    constructor(public rootUrl: string) {}
    fetch(id: number): AxiosPromise {
        console.log('fetching...');
        return axios.get(`${this.rootUrl}/${id}`);
    }

    save(data: T): AxiosPromise {
        // NOTE: `id`なんてしらないよというエラーがでる
        // 
        const { id } = data;
        console.log('saving...');

        if (id) {
            // putで既存ユーザを更新する
            return axios.put(`${this.rootUrl}/${id}`, data);
        } else {
            // そうでないならpostで保存する
            return axios.post(this.rootUrl, data);
        }
    }
}
```

当然動的な型から`id`の変数が必ず取得できるわけではないので

これはTypeErrorである

これの解決策として、動的な型Tは必ずあるinterfaceを継承するとすればいい

```TypeScript
import axios, { AxiosPromise } from 'axios';
import { UserProps } from './User';

// Syncの動的な型の型付けであるinterfaceを定義する
interface HasId {
    id: number;
};

// HasIdを必ず継承させる
export class Sync<T extends HasId> {
    constructor(public rootUrl: string) {}
    fetch(id: number): AxiosPromise {
        console.log('fetching...');
        return axios.get(`${this.rootUrl}/${id}`);
    }

    save(data: T): AxiosPromise {
        // NOTE: `id`なんてしらないよというエラーがでる
        // 
        const { id } = data;
        console.log('saving...');

        if (id) {
            // putで既存ユーザを更新する
            return axios.put(`${this.rootUrl}/${id}`, data);
        } else {
            // そうでないならpostで保存する
            return axios.post(this.rootUrl, data);
        }
    }
}
```

これで文法的なエラーはなくなった

さっそくUserクラスに導入してみよう


```TypeScript
import { Eventing } from './Eventing';
import { Sync } from './Sync';

export interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

type Callback = () => void;

const rootUrl: string = "http://localhost:3000/users";

export class User {
    public events: Eventing = new Eventing();
    // 
    // NOTE: UserPropsはHasIdを満たさないというエラーが出る
    // 
    public sync: Sync<UserProps> = new Sync<UserProps>(rootUrl);
    constructor(private data: UserProps) {}

    get(propsName: string): number | string {
        return this.data[propsName];
    }

    set(update: UserProps): void {
        console.log(update);
        Object.assign(this.data, update);
    }
}
```

つまり、

`UserProps`インタフェイスではidはオプションだけど、

`HasId`では必須であるので

このinterface同士は互換性がないよと言っている

これの解決策は、

`HasId`の`id`プロパティをオプショナルにすることである

```TypeScript
interface HasId {
    id?: number;
}
```

こうすれば、これまでの問題にすべて対処できる

`id`はオプショナルなので、

`Sync`の`save`メソッドでは`id`があるかどうかの条件分岐がある

これで矛盾なく利用できる


#### `const {id} = data;`のような存在があいまいな値の扱いについて

**`undefined`をとりうるときはタイプガードを設けよ**

```bash
# tsconfig.jsonを生成する
$ tsc --init
```

デフォのtsconfig.jsonは`strict: true`である

`const {id} = data;`の`id`の型が取りうる値はこのコンパイラオプションで異なる

- `strict: true`で`number | undeifned`
- `strict: false`で`number`

である

当然`strict: true`で開発するのがふつうである

であるならば、

`undefined`をとりうることがあるので

そのことを見越したタイプガードを設けるのが

TypeScriptのお作法であるといえる

