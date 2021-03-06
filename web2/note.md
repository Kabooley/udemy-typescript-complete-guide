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

いまのところ、DB との通信に関する Promise を外部へもたらすことができるようになっている

ここで汎用性を持たせるために、Generics を導入すると...

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

これは TypeError である

これの解決策として、動的な型 T は必ずある interface を継承するとすればいい

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

さっそく User クラスに導入してみよう

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

`UserProps`インタフェイスでは id はオプションだけど、

`HasId`では必須であるので

この interface 同士は互換性がないよと言っている

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

#### `const {id} = data;`のように id が必ず取得できるとは限らないとき

TypeScript の作法：

**TypeScript は任意の値のプロパティを参照するときは必ず実際に存在するのか確認せよ**

ということで

**`undefined`をとりうるときはタイプガードを設けよ**

```bash
# tsconfig.jsonを生成する
$ tsc --init
```

デフォの tsconfig.json は`strict: true`である

`const {id} = data;`の`id`の型が取りうる値はこのコンパイラオプションで異なる

-   `strict: true`で`number | undeifned`
-   `strict: false`で`number`

である

当然`strict: true`で開発するのがふつうである

であるならば、

`undefined`をとりうることがあるので

そのことを見越したタイプガードを設けるのが

TypeScript のお作法であるといえる

## 戻り値があいまいなメソッドの型定義アプローチ

class User から get, set を別クラスとして分離した。

すると

get メソッドの戻り値が不適切になる。

今 class Attributes が汎用的な型<T>を採用するとして

get メソッドはどんな型のオブジェクトでも受け入れて、

適切な戻り値を返さなくてはならないが、

それがどんな型になるのかは推測不可能である

それは TypeScript ではどう対応すべきなのか...

```TypeScript
// class User
import { Eventing } from './Eventing';
import { Sync } from './Sync';

export interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

// 今のところ、引数なし戻り値なしの関数しか受け付けない
type Callback = () => void;

const rootUrl: string = "http://localhost:3000/users";

export class User {
    // events: { [key: string]: Callback[] } = {};
    public events: Eventing = new Eventing();
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


// set, getを抽出した
// UserPropsのかわりにGenericsを採用した
export class Attributes<T>{
    constructor(private data: T){}


    // Genericsのように動的な型を採用すると、
    // number | stringしか返さない仕様はおかしいことになる
    get(propsName: string): number | string {
        return this.data[propsName];
    }

    set(update: T): void {
        console.log(update);
        Object.assign(this.data, update);
    }
}
```

get の戻り値の型があいまいになる

```TypeScript
const attrs = new Attributes<UserProps>(
    {id: 11, name: "DaftPunk", age: 40}
);

// idには`string | number`の型推測がでる
const id = attrs.get("id");
```

対処方法１. `as`で型アサーション

```TypeScript
const id = attrs.get("id") as number;
```

これの欠点は使う側が常にチェックしないといけないということ

この問題の解決策として２つの重要な概念を理解しよう

#### 重要な概念１．TypeScript では string 型は型にできる

type を使って唯一の値のみをとる型を生成することができる

以下は`steven`という値しか受け付けない型`BestName`の定義である

```TypeScript
type BestName = "steven";

const printName = (name: BestName): void => {
    console.log(name);
}

printName("dsfdsfd");   // TypeError
printName("Jhonathan");   // TypeError
printName("Stepahn");   // TypeError
printName("steven");   // correctly pirnted
```

#### 重要な概念２．JavaScript ではすべてのオブジェクト・キーは文字列である

以下に示すように、

オブジェクトのキーはすべて文字列である

```JavaScript
const colors = {
    red: "Red",
    5: "Orange"
};

// numberを渡しているように見えて...
colors[5];  // Red

// 実際は文字列でも（というか文字列だけ）キーとして使える
colors["5"];  // Red
```

## 高度な汎用型定義

先の重要な概念を考慮してリファクタリングする

```TypeScript
export class Attributes<T>{
    constructor(private data: T){}

    get<K extends keyof T>(key: K): T[K] {
        return this.data[key];
    }

    set(update: T): void {
        console.log(update);
        Object.assign(this.data, update);
    }
}

const attrs = new Attributes<UserProps>(
    {id: 11, name: "DaftPunk", age: 40}
);

// オブジェクトのキーは必ずstring型である
const id = attrs.get("id");

// 内部的には、Kは渡されるオブジェクトのキーからなる型定義である
type K = "id" | "name" | "age";
```

T は渡されるオブジェクトの型、
K は渡されるオブジェクトのキーからなるユニオン型となる

`keyOf`:

> keyof はオブジェクト型からプロパティ名を型として返す型演算子です。

> 2 つ以上のプロパティがあるオブジェクト型に keyof を使った場合は、すべてのプロパティ名がユニオン型で返されます。

```TypeScript
type Book = {
  title: string;
  price: number;
  rating: number;
};
type BookKey = keyof Book;
// 上は次と同じ意味になる
type BookKey = "title" | "price" | "rating";
```

こうすれば常に渡されるオブジェクトとオブジェクトの戻り値に完全に対応できる

class User へ取り込んでみよう

```TypeScript
import { Eventing } from './Eventing';
import { Sync } from './Sync';
import { Attributes } from "./Attributes";

export interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

// 今のところ、引数なし戻り値なしの関数しか受け付けない
type Callback = () => void;

const rootUrl: string = "http://localhost:3000/users";

export class User {
    // events: { [key: string]: Callback[] } = {};
    public events: Eventing = new Eventing();
    public sync: Sync<UserProps> = new Sync<UserProps>(rootUrl);
    public attributes: Attributes<UserProps>;
    constructor(private attrs: UserProps) {
        this.attributes = new Attributes<UserProps>(attrs)
    }
}
```

上記のような`attrs`の初期化の問題は、

コンストラクタでかならず`UserProps`のオブジェクトを受け取るようにしないといけないことである

このまま試しに使ってみましょう

```TypeScript
import { User } from './models/User';

const user = new User({name: "new record", age: 0});


// Userの各プロパティを介して、各メソッドにアクセスることになる
//
// 今のところ、get, setでアクセスできるデータはprivateなので
// 以下のようにいちいちgetメソッドを呼び出さないといけない
user.attributes.get('id');
user.attributes.get('name');
user.attributes.get('age');
// リファクタリングする前は...
//  user.save()で済んでいたのに...
user.sync.save();
```

この通り、今のところまだ改善の余地がある

`user.PROPERTY.get`ではなくて、`user.get`で使えるようにしたい

## getter, setter: クラス・メソッドの呼出とインスタンス・メソッドの結びつけ

クラスメソッドである`user.get`で

クラスのプロパティとして存在する`attributes`の`user.attributes.get`を呼び出したい(というか使えるようにしたい)

それをすべてのメソッドに適用したい

そんなとき

アプローチ方法２つ:

1. 引数をそのままパススルー

get(), on(), trigger()メソッドはそのまま適用できそう

2. アクセサーを使う

例）fetch()の場合

ユーザの id 情報が必要なのであらかじめ get()などでユーザ情報を取得しておかなくてはならない

すると一旦遠回りをすることになる

get() --> fetch()

という具合。

アクセサーの例）

```TypeScript
class Person {
    constructor(public firstName: string, public lastName: string){};

    get fullName() {
        return `${this.firstname} ${this.lastName}`;
    }
}

const person = new Person("firstName", "lastname");
// NOTE: `fullName`はメソッドだけど、getキーワードのおかげでプロパティのように扱える
console.log(person.fullName);
```

つまりメソッドがプロパティに化けるわけである

これを利用する

```TypeScript
export class User {
    public events: Eventing = new Eventing();
    public sync: Sync<UserProps> = new Sync<UserProps>(rootUrl);
    public attributes: Attributes<UserProps>;
    constructor(private attrs: UserProps) {
        this.attributes = new Attributes<UserProps>(attrs)
    }

    // やりたいこと。
    // events.on()メソッドを、user.on()で呼び出したい。
    // 以下のon()定義のデメリットは
    //
    // on(eventName: string, callback: Callback): void {
    //     this.events.on(eventName, callback)
    // }

    // アクセサを使うと、参照だけ返せる
    get on() {
        // NOTE: 関数を実行しない。参照だけを返す。
        return this.events.on;
    }
}

// USAGE
//
// 以下のように別の関数にすることもできるし
const userOn = user.on;
// 直接使うこともできる
user.on('change', () => {})
```

#### context 問題

先の getter を使ってさっそく実行してみる

```TypeScript
// index.ts
const user = new User({name: "new record", age: 0});


// TypeError: Cannot read properties of undefined (reading 'name')
console.log(user.get('name'));
```

なぜ？

`this`が`Attributes`ではなくて`User`を指しているから

`User`には当然`data`がないから「そんなものはない」とエラーがでる

```TypeScript
// Attributes.ts
// ...

// このthisが指すのは...
  get<K extends keyof T>(key: K): T[K] {
    return this.data[key];
  }

```

`this`を固定するにはどうすればいい？

アローコンテキストを利用する

```TypeScript
// before
// この構文はget: function(){}の短縮系なので
  get<K extends keyof T>(key: K): T[K] {
    return this.data[key];
  }
// after
// こうすればいい
// NOTE: これはBabelの実験段階の機能だそうです
  get = <K extends keyof T>(key: K): T[K] => {
    return this.data[key];
  }
```

参考：

https://stackoverflow.com/questions/31362292/how-to-use-arrow-functions-public-class-fields-as-class-methods

正しく行うには constructor 内で super()を呼び出して

this.メソッド = this.メソッド.bind(this)することになる

ともかく、この変更をすべての User が取り込むことになる class へ適用する

講義ではその（逆行的な）リファクタリングはしなかったので

この辺を実際どうすべきかはかかわるプロジェクトでのルールに従うことになるでしょう

#### setter 複数のメソッドの内部的な呼び出し

1. set()の実装

これは単純

```TypeScript
export class User {
  // events: { [key: string]: Callback[] } = {};
  public events: Eventing = new Eventing();
  public sync: Sync<UserProps> = new Sync<UserProps>(rootUrl);
  public attributes: Attributes<UserProps>;
  constructor(private attrs: UserProps) {
    this.attributes = new Attributes<UserProps>(attrs);
  }

    // ...

  set(update: UserProps): void {
    this.attributes.set(update);
    this.events.trigger("change");
  }
}


// 使ってみる
user.on('change', () => {
    console.log('User was changed. We probably need to change some HTML');
});
user.set({name: "username changed"});
```

```conosle
username changed
User was changed. We probably need to change some HTML
```

2. fetch()の実装

attributes.get()と Sync.fetch()を呼び出す

-   id なしだと例外
-   sync.fetch(id)でデータを取得する
-   attributes.set()で反映

```TypeScript
import axios, { AxiosPromise } from 'axios';

export class User {
  // events: { [key: string]: Callback[] } = {};
  public events: Eventing = new Eventing();
  public sync: Sync<UserProps> = new Sync<UserProps>(rootUrl);
  public attributes: Attributes<UserProps>;
  constructor(private attrs: UserProps) {
    this.attributes = new Attributes<UserProps>(attrs);
  }

    // ...

  set(update: UserProps): void {
    this.attributes.set(update);
    this.events.trigger("change");
  }

  fetch(): void {
      const id: number = this.attributes.get('id');

      if(typeof id !== 'number') {
          throw new Error('Cannot fetch without id');
      }

      this.sync.fetch(id).then((res: AxiosResponse): void => {
          this.attributes.set(response.data);
      })
  }
}

```

このままだと、set()で変更したことによる変更通知が発火しない

変更を行ったのに変更通知を発信できないのはこれいかに

```TypeScript
      this.sync.fetch(id).then((res: AxiosResponse): void => {
        //   this.attributes.set(response.data);
        this.set(response.data);
      })
```

ということで user.set()を呼び出せばいい

同様に、get も user.get()を attribute.get()の代わりに呼び出す

```TypeScript
export class User {
  // events: { [key: string]: Callback[] } = {};
  public events: Eventing = new Eventing();
  public sync: Sync<UserProps> = new Sync<UserProps>(rootUrl);
  public attributes: Attributes<UserProps>;
  constructor(private attrs: UserProps) {
    this.attributes = new Attributes<UserProps>(attrs);
  }

    // ...

  set(update: UserProps): void {
    this.attributes.set(update);
    this.events.trigger("change");
  }

  fetch(): void {
    //   Instead using this...
    //   const id: number = this.attributes.get('id');
      const id: number = this.get('id');

      if(typeof id !== 'number') {
          throw new Error('Cannot fetch without id');
      }

      this.sync.fetch(id).then((res: AxiosResponse): void => {
        //   Instead using this...
        //   this.attributes.set(response.data);
          this.set(response.data);
      })
  }
}


// 使ってみる

const user = new User({id: 1});

user.on('change', () => {
    console.log(user);
});

user.fetch();
```

## User フレームワーク

他実装してみて、全体

```TypeScript
// User.ts
//
//
import { Eventing } from './Eventing';
import { Sync } from './Sync';
import { Attributes } from './Attributes';
import { AxiosResponse } from 'axios';

export interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

const rootUrl: string = 'http://localhost:3000/users';

export class User {
    // events: { [key: string]: Callback[] } = {};
    public events: Eventing = new Eventing();
    public sync: Sync<UserProps> = new Sync<UserProps>(rootUrl);
    public attributes: Attributes<UserProps>;
    constructor(private attrs: UserProps) {
        this.attributes = new Attributes<UserProps>(attrs);
    }

    // on(eventName: string, callback: Callback): void {
    //     this.events.on(eventName, callback)
    // }

    get on() {
        return this.events.on;
    }

    get trigger() {
        return this.events.trigger;
    }

    get get() {
        return this.attributes.get;
    }

    set(update: UserProps): void {
        this.attributes.set(update);
        this.events.trigger('change');
    }

    fetch(): void {
        const id = this.get('id');

        if(typeof id !== 'number') {
            throw new Error('Cannot fetch without an id');
        }

        this.sync.fetch(id).then((response: AxiosResponse): void => {
            this.set(response.data)
        })
    }

    save(): void {
        this.sync
            .save(this.attributes.getAll())
            .then((response: AxiosResponse) => {
                console.log(response);
                this.events.trigger('save');
            })
            .catch((err) => {
                this.events.trigger('error');
            });
    }
}


// Eventing.ts
//
// interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

// 今のところ、引数なし戻り値なしの関数しか受け付けない
type Callback = () => void;

export class Eventing {
    events: { [key: string]: Callback[] } = {};

    on = (eventName: string, callback: Callback): void => {
        const handlers = this.events[eventName] || [];
        handlers.push(callback);
        // 動的な配列の生成
        this.events[eventName] = handlers;
    };

    trigger = (eventName: string): void => {
        const handlers = this.events[eventName];
        if (handlers === undefined || !handlers.length) return;
        handlers.forEach((cb) => {
            cb();
        });
    };
}

// Attributes.ts
//
// import { UserProps } from './User';

export class Attributes<T> {
    constructor(private data: T) {}

    set = (update: T): void => {
        console.log(update);
        Object.assign(this.data, update);
    };

    get = <K extends keyof T>(key: K): T[K] => {
        console.log(this);
        return this.data[key];
    };

    getAll = (): T => {
        return this.data;
    };
}

// Sync.ts
//
//
import axios, { AxiosPromise } from 'axios';

interface HasId {
    id?: number;
}

export class Sync<T extends HasId> {
    constructor(public rootUrl: string) {}
    fetch = (id: number): AxiosPromise => {
        return axios.get(`${this.rootUrl}/${id}`);
    }

    save = (data: T): AxiosPromise => {
        const { id } = data;

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

今のところ、子のフレームワークは`User`に特化している

`User`じゃないインスタンスを作りたいときに

つまり、`User`をさらに汎用的にするために

いかに`User`特化から脱却するのかを今後学ぶ...

## Composition vs. Inheritance ...again

今のところ`User`クラスは

-   ハードコーディング
-   interface を使っていない

などかなり硬直的

Eventing, Sync, Attributes はすべてクラス内部でインスタンス化する

ハードコーディングな要素である

これを交換可能なものにしたい

また、

たとえば`BlogPost`という class を作るときに

`User`の get や save などのメソッドを再構築することなく同じように使えるようにしたい

なので、

抽象的なクラス`Model`を構築し、

今後は`User`はこの`Model`を継承する

```TypeScript
import { AxiosPromise, AxiosResponse } from 'axios';

interface ModelAttributes<T> {
    set(value: T): void;
    getAll(): T;
    get<K extends keyof T>(key: K): T[K];
}

interface Sync<T> {
    fetch(id: number): AxiosPromise;
    save(data: T): AxiosPromise;
}

interface Events {
    on(eventName: string, callback: () => void): void;
    trigger(eventName: string): void
}

interface HasId {
    id?: number;
}

export class Model<T extends HasId> {
    constructor(
        private attributes: ModelAttributes<T>,
        private events: Events,
        private sync: Sync<T>
    ) {}

    get on() {
        return this.events.on;
    }

    get trigger() {
        return this.events.trigger;
    }

    get get() {
        return this.attributes.get;
    }

    set(update: T): void {
        this.attributes.set(update);
        this.events.trigger('change');
    }

    fetch(): void {
        const id = this.get('id');

        if(typeof id !== 'number') {
            throw new Error('Cannot fetch without an id');
        }

        this.sync.fetch(id).then((response: AxiosResponse): void => {
            this.set(response.data)
        })
    }


    save(): void {
        this.sync
            .save(this.attributes.getAll())
            .then((response: AxiosResponse) => {
                console.log(response);
                this.events.trigger('save');
            })
            .catch((err) => {
                this.events.trigger('error');
            });
    }
}

// User.ts

import { Eventing } from './Eventing';
import { ApiSync } from './ApiSync';
import { Attributes } from './Attributes';
import { AxiosResponse } from 'axios';
import { Model } from './Model';

export interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

const rootUrl: string = 'http://localhost:3000/users';

export class User extends Model<UserProps> {
    static buildUser(attrs: UserProps): User {
        return new User(
            new Attributes<UserProps>(attrs),
            new Eventing(),
            new ApiSync<UserProps>(rootUrl)
        );
    }
}
```

#### 静的メソッド(ファクトリーメソッド)

静的メソッドでインスタンスを生成するのと

コンストラクタで生成するのと何が違うんだい？

それはただ`User`にファクトリーメソッドを持たせたいというだけ

static メソッドは`User`インスタンスのメソッドにはならないけど

`User`クラスのメソッドではあるので

自身を生成する関数を自身で持たせると都合がいい場合がある

ただそれだけの話

またあとから拡張できる利点もある

```TypeScript
export class User extends Model<UserProps> {
    static buildUser(attrs: UserProps): User {
        return new User(
            new Attributes<UserProps>(attrs),
            new Eventing(),
            new ApiSync<UserProps>(rootUrl)
        );
    }

    // ことなるインスタンスからなるUser
    static buildAwesomeUser(attrs: UserProps): User {
        return new User(
            new Attributes<UserProps>(attrs),
            new MoreEventing(),
            new ThridPartySync<UserProps>(rootUrl)
        );
    }
}
```

上記のように少し違う User も生成するためのメソッドを追加でき、

かつファクトリーメソッド群を`User`にまとめられる

## fetch()で必須な id が事前にわからない時

前提としてそもそもバックエンドにどんな id があるのがわからないという方が当然でしょう

それをどうやって実現するか

Collection というユーザデータを保存するクラスをつくる

```TypeScript
// Collection.ts
// User特価なままな場合
import axios, { AxiosResponse } from "axios";
import { Eventing } from "./Eventing";
import { User, UserProps } from "./User";

export class Collection {
    models: User[] = [];
    events: Eventing = new Eventing();

    constructor(private rootUrl: string) {}

    get on() {
        return this.events.on;
    }

    get trigger() {
        return this.events.trigger;
    }

    fetch(): void {
        axios.get(this.rootUrl)
        .then((response: AxiosResponse) => {
            response.data.forEach((value: UserProps) => {
                // ここでユーザデータすべて取得して
                // modelsへユーザデータを保存する
                const user = User.buildUser(value);
                this.models.push(user);
            })
        })
    }
}

// USAGE
// const collection = new Collection('http://localhost:3000/users');
// collection.on('change', () => {
//     console.log(collection);
// });
// collection.fetch();
```

このままだと`User`と`UserProps`ありきのクラスだと再利用性ないので

```TypeScript
export class Collection<T, K> {
    models: T[] = [];
    events: Eventing = new Eventing();

    constructor(private rootUrl: string) {}

    get on() {
        return this.events.on;
    }

    get trigger() {
        return this.events.trigger;
    }

    fetch(): void {
        axios.get(this.rootUrl)
        .then((response: AxiosResponse) => {
            response.data.forEach((value: K) => {
                // いまだ...
                // Userのメソッドありき
                const user = User.buildUser(value);
                this.models.push(user);
            })
        })
    }
}
```

ということで、collection のインスタンスを作成するときにファクトリメソッドを渡す仕様にする

要はジェネリック型`K`の値を取得してジェネリック型`T`のものを返すメソッドになる

なので

```TypeScript
export class Collection<T, K> {
    models: T[] = [];
    events: Eventing = new Eventing();

    constructor(
        private rootUrl: string,
        private deserialize: (json: K) => T
        ) {}

    // ...

    fetch(): void {
        axios.get(this.rootUrl)
        .then((response: AxiosResponse) => {
            response.data.forEach((value: K) => {
                this.models.push(this.deserialize(value));
            })
        })
    }
}
```

```TypeScript
export class User extends Model<UserProps> {
    static buildUser(attrs: UserProps): User {
        return new User(
            new Attributes<UserProps>(attrs),
            new Eventing(),
            new ApiSync<UserProps>(rootUrl)
        );
    }

    static buildCollection(): Collection<User, UserProps> {
        return new Collection<User, UserProps> (
            rootUrl,
            (json: UserProps) => User.buildUser(json)
        );
    }
}
```

## View

ユーザ情報の表示、編集が可能な HTML を生成する

-   いずれの view も HTML を生成する
-   HTML はネストできるようにしなくてはならない
-   ユーザイベントをコントロールできなくてはならない
-   view と model は蜜結合になるだろう
-   ビューによって生成された HTML にアクセスして、特定の要素を取得できる必要があります。

そんな View を作るよ

`UserEdit`, `UserShow`, `UserForm`

### `UserForm` at begin

```TypeScript
// こんな機能をもつよ
parent: Element;
template(): string;
render(): void;
```

ひとまず

```TypeScript
export class UserForm {
    constructor(public parent: Element) {}

    template(): string {
        return `
            <div>
                <h1>User Form</h1>
                <input />
            </div>
        `;
    }

    render(): void {
        const templateElement = document.createElement('template');
        templateElement.innerHTML = this.template();

        this.parent.append(templateElement.content);
    }
}
```

こんな感じ

#### Event Binding: template と content

参考：

https://developer.mozilla.org/ja/docs/Web/HTML/Element/template

https://developer.mozilla.org/ja/docs/Web/API/HTMLTemplateElement/content

たとえば、render()した要素にイベントハンドラをつけたいとき

-   render()が呼び出される
-   template()からテンプレートを取得する
-   `template`要素へ取得したテンプレートを挿入する
-   DOM へ生成した`template`を挿入する

-   どこかのタイミングでそれらの要素へイベントハンドラをバインドする

問題はこういう生成手順を踏むときに、いつイベントハンドラを取り付ければいいのだろうという点

上記の手順だと、通常レンダリングが完了して DOM となってから

その DOM を取得してイベントハンドラをつけることになるのかな

となると

レンダリング**後**が普通かな

でもそうなるとレンダリング完了してから毎回あらためて DOM を取得してイベントハンドラをつけるのはなかなか一苦労である

その DOM があるのか確認するのも一苦労だろう

そこで

<template>と`HTMLTemplateElement.content`を使う

この 2 つを使うと、

「あとから HTML を動的に挿入する・操作する」ということができる

#### <template>

https://ja.javascript.info/template-element

> 組み込みの <template> 要素は HTML マークアップテンプレートの格納場所として機能します。**ブラウザはこれらのコンテンツは無視します(構文のチェックのみ行います)が、JavaScript ではアクセスし、他の要素を作るのに使うことができます。**

> template は HTML マークアップを格納する目的で、HTML 上に見えない要素を作成することができます。template は何が特別なのでしょうか？

> 第一に、template 内のコンテンツは、通常適切な囲みタグを必要とする場合でも有効な HTML になります。
> つまり後出し HTML を保持しておけますという話らしい

パーサは`template`を描写せず、その内容の有効性だけを検証してくれる

この`template`の内容は後で操作・動的に挿入することができる

(`template`を挿入することができるという意味ではない)

つまり、動的に HTML を挿入するときに

`template`をつかうととっても都合がいいというわけである

> テンプレートのコンテンツは、content プロパティで DocumentFragment – 特別な種類の DOM ノード – として利用できます。

> ある特別な性質(どこかに挿入するとき、その “子” が挿入される)を除くと、他の DOM ノードたちと同じように扱うことができます。

たとえば、

-   template の内容は`document.querySelector`等で取得できる
-   template の属性`content`を通して読み取り専用の`DocumentFragment`にアクセスすることができる
-   `DocumentFragment`から`Node`へアクセスしたり`querySelector`等で要素へアクセスできる
-   それらアクセスした要素を操作したりして要素として生成して DOM へ挿入することができる

これを使うとどうイベント・バインドに役立つかというと、

レンダリング前にイベントバインドできるのである

注意：

-   直接`content`にアクセスする行為は危険である

## Adding Model Propeties

先までの Model インスタンスとの統合

```TypeScript
// UserForm.ts

import { User } from '../models/User';

export class UserForm {
    constructor(
        public parent: Element,
        public model: User)
    {}

    // ...

    template(): string {
        return `
            <div>
                <h1>User Form</h1>
                <div>User name: ${this.model.get('name')}</div>
                <div>User age: ${this.model.get('age')}</div>
                <input />
                <button>click me</button>
            </div>
        `
    }
}

// index.ts
import { UserForm } from './views/UserForm';
import { User } from './models/User';

const user = User.buildUser({ name: "NAME", age: 20 });
const userForm: UserForm = new UserForm(document.getElementById('root'), user);

userForm.render();
```

## class name にイベント・バインディング

今、年齢変更をサブミットするボタンを追加するとする

`<button>set random age</button>`

先までの`eventMap`のままだとこの<button>にも`onButtonClick`がバインドされてしまう

なので class 名`set-age`で区別するようにする

```TypeScript
// UserForm.ts

import { User } from '../models/User';

export class UserForm {
    constructor(
        public parent: Element,
        public model: User)
    {}

    onSetAgeClick(): void {
        console.log('new age set');
    }

    eventMap(): { [key: string]: () => void } {
        return {
            'click:button': this.onButtonClick,
            'mouseenter:h1': this.onHeaderHover,
            'click:.set-age': this.onSetAgeClick
        }
    }

    template(): string {
        return `
            <div>
                <h1>User Form</h1>
                <div>User name: ${this.model.get('name')}</div>
                <div>User age: ${this.model.get('age')}</div>
                <input />
                <button>click me</button>
                <button class="set-age">set random age</button>
            </div>
        `
    }
}

```

これをすると

いまのところ`button.set-age`には`onSetAgeClick`と`onButtonClick`の両方がバインドされる

## Model の変更に反応して再レンダリングさせる

先の setRandomAge で age が変更されたらその変更を HTML に反映させるために

再レンダリングさせる

現状：

-   UserForm で生成する button.set-age を click
-   User.setRandomAge()が乱数生成であらたな age を set する

Model.set()には this.events.trigger('change')があるので

ここで再レンダリングをさせる

```TypeScript
export class UserForm {
    constructor(public parent: Element , public model: User) {
        // インスタンス生成時に実行することでrenderを`change`イベント時に必ず実行してもらえる
        this.bindModel();
    }

    bindModel(): void {
        this.model.on('change', () => {
            this.render();
        })
    }

    // ...
}
```

このままだと template を何個も生成してしまうので前回レンダー分を毎回消すようにする

```TypeScript
// UserForm.ts

render(): void {
    // これをつけるだけ
    this.parent.inerHTML = '';
}
```

## 再掲 DOM 取得と null チェック

`querySelector`は null を返す可能性がありますね

型が union になる可能性があるときは、タイプガードを必ずつけましょう

```TypeScript
// UserForm.ts

    onSetNameClick = (): void => {
        // input HTMLInputElement | null
        const input: HTMLInputElement = this.parent.querySelector('input');
        // inputはnullかもしれない
        const name: string = input.value;
        this.model.set({ name });
    };

    // 改善後
    onSetNameClick = (): void => {
        // input HTMLInputElement | null
        const input: HTMLInputElement = this.parent.querySelector('input');
        // type guard
        if( input ) {
            const name: string = input.value;
            this.model.set({ name });
        }

    };

// index.ts
// 同様に

const root: HTMLElement = document.getElementById('root');
if(root) {
    const userForm = new UserForm(root, user);
    userForm.render();
}
else {
    throw new Error('Root element not found');
}

```

## UserForm を再利用可能にリファクタリングする

UserForm が再利用的になったらプロジェクトのほうで利用できるかも

元の状態

```TypeScript
import { User } from '../models/User';

export class UserForm {
    constructor(public parent: Element, public model: User) {
        this.bindModel();
    }

    bindModel(): void {
        this.model.on('change', () => {
            this.render();
        });
    }

    onSetAgeClick = (): void => {
        this.model.setRandomAge();
    };

    onSetNameClick = (): void => {
        const input: HTMLInputElement = this.parent.querySelector('input');
        const name: string = input.value;
        this.model.set({ name });
    };

    eventsMap(): { [key: string]: () => void } {
        return {
            'click:.set-age': this.onSetAgeClick,
            'click:.change-name': this.onSetNameClick,
        };
    }

    bindEvents(fragment: DocumentFragment): void {
        const eventsMap = this.eventsMap();

        for (let eventKey in eventsMap) {
            const [eventName, selector] = eventKey.split(':');
            fragment.querySelectorAll(selector).forEach((element) => {
                element.addEventListener(eventName, eventsMap[eventKey]);
            });
        }
    }

    template(): string {
        return `
            <div>
                <h1>User Form</h1>
                <div>User name: ${this.model.get('name')}</div>
                <div>User age: ${this.model.get('age')}</div>
                <input />
                <button class="change-name">Change name</button>
                <button class="set-age">set random age</button>
            </div>
        `;
    }

    render(): void {
        this.parent.innerHTML = '';

        const templateElement = document.createElement('template');
        templateElement.innerHTML = this.template();

        this.bindEvents(templateElement.content);

        this.parent.append(templateElement.content);
    }
}

```

```TypeScript
// View.ts
import { User } from '../models/User';

export abstract class View {
    constructor(public parent: Element, public model: User) {
        this.bindModel();
    }

    abstract eventsMap(): { [key: string]: () => void };
    abstract template(): string;


    bindModel(): void {
        this.model.on('change', () => {
            this.render();
        });
    }

    bindEvents(fragment: DocumentFragment): void {
        const eventsMap = this.eventsMap();

        for (let eventKey in eventsMap) {
            const [eventName, selector] = eventKey.split(':');
            fragment.querySelectorAll(selector).forEach((element) => {
                element.addEventListener(eventName, eventsMap[eventKey]);
            });
        }
    }

    render(): void {
        this.parent.innerHTML = '';

        const templateElement = document.createElement('template');
        templateElement.innerHTML = this.template();

        this.bindEvents(templateElement.content);

        this.parent.append(templateElement.content);
    }
}

// UserForm.ts
import { User } from '../models/User';
import { View } from './View';

export class UserForm extends View {

    onSetAgeClick = (): void => {
        this.model.setRandomAge();
    };

    onSetNameClick = (): void => {
        const input: HTMLInputElement = this.parent.querySelector('input');
        const name: string = input.value;
        this.model.set({ name });
    };

    eventsMap(): { [key: string]: () => void } {
        return {
            'click:.set-age': this.onSetAgeClick,
            'click:.change-name': this.onSetNameClick,
        };
    }

    bindEvents(fragment: DocumentFragment): void {
        const eventsMap = this.eventsMap();

        for (let eventKey in eventsMap) {
            const [eventName, selector] = eventKey.split(':');
            fragment.querySelectorAll(selector).forEach((element) => {
                element.addEventListener(eventName, eventsMap[eventKey]);
            });
        }
    }

    template(): string {
        return `
            <div>
                <h1>User Form</h1>
                <div>User name: ${this.model.get('name')}</div>
                <div>User age: ${this.model.get('age')}</div>
                <input />
                <button class="change-name">Change name</button>
                <button class="set-age">set random age</button>
            </div>
        `;
    }
}
```

## View の汎用化へのアプロートその１：interface

Generics を導入すると、`this.model.on`ってなに？ってなる

いつものことですが、interface を足す

```TypeScript
export abstract class View<T> {
    constructor(public parent: Element, public model: T) {
        this.bindModel();
    }

    // ...

    bindModel(): void {
        // NOTE: ここ
        this.model.on('change', () => {
            this.render();
        });
    }

    // ...
}

// interfaceを足す
interface ModelForView {
    on(eventName: string, callback: () => void): void;
}

// Tの継承元として登録する
export abstract class View<T extends ModelForView> {
    constructor(public parent: Element, public model: T) {
        this.bindModel();
    }
    // ...
}

// Viewに渡すのは今のところ`User`のインスタンスである
class UserForm extends View<User> {
    // ...
}
```

User のインスタンスは ModelForView を満たす

interface を足す作戦は、あとから結局プロパティ分だけ足しまくる必要が出てくるので最善の策ではない

## View の汎用化へのアプロートその２：継承

This way is better.

```TypeScript
import { Model } from '../model/Model';

export abstract class View <T extends Model> {

}
```

`Model`という interface は Generics を含むので次のようにしないといけないということになる

```TypeScript
// THIS IS WIRED!!
export abstract class View <T extends Model<UserProps>> {
}
```

これはこう書く

型引数を使う

```TypeScript
export abstract class View <T extends Model<K>, K> {
}

// USAGE
export class UserForm extends View<User, UserProps> {

}
```

この導入の仕方ならば、TypeScript はどこを参照すればいいのか明確になったので

`this.model.on`などの継承メソッドがどこを参照しているのか確実にわかっている

## View の再利用性を保ちながら表示するものを増やす

やること：

`UserEdit`, `UserShow`を表示させる

ただし、現在のありものを再利用しながら

-   New Propperty: `regions`

    key: Element の key,
    value: 表示させたい Element でここに、UserShow, UserEdit を含む

-   New Method: `regionsMap()`

    Override される。
    UserEdit, UserShow はこのメソッドをオーバーライドする

-   New Method: `mapRegions()`

    regiosnMap を読み取って region へ格納する

```TypeScript
import { Model } from '../models/Model';


/***
 * Modelから継承する
 *
 * Modelに継承元がひつようなので型引数Kが必須である
 *
 * template内容は継承クラスで定義する
 *
 * イベントハンドラ関数も継承クラスで定義する
 *
 * */
 export abstract class View<T extends Model<K>, K> {
    // NOTE: new added
    regions: { [key: string]: Element } = {};


    constructor(public parent: Element, public model: T) {
        this.bindModel();
    }


    abstract template(): string;
    // NOTE: commented out
    // abstract eventsMap(): { [key: string]: () => void };
    // abstract regionsMap(): { [key: string]: string };

    // NOTE: Remove abstracts
    eventsMap(): { [key: string]: () => void } {
        return {};
    }

    // NOTE: new method
    regionsMap(): { [key: string]: string } {
        return {};
    }


    bindModel(): void {
        this.model.on('change', () => {
            this.render();
        });
    }

    bindEvents(fragment: DocumentFragment): void {
        const eventsMap = this.eventsMap();

        for (let eventKey in eventsMap) {
            const [eventName, selector] = eventKey.split(':');
            fragment.querySelectorAll(selector).forEach((element) => {
                element.addEventListener(eventName, eventsMap[eventKey]);
            });
        }
    }

    // NOTE: new added.
    mapRegions(fragment: DocumentFragment): void {
        const regionMap = this.regionsMap();

        for(let key in regionMap) {
            const selector = this.regionsMap[key];
            const element = fragment.querySelector(selector);
            if(element) {
                this.regions[key] = element;
            }
        }
    }

    render(): void {
        this.parent.innerHTML = '';

        const templateElement = document.createElement('template');
        templateElement.innerHTML = this.template();

        this.bindEvents(templateElement.content);
        // NOTE: new added.
        this.mapRegions(templateElement.content);

        this.parent.append(templateElement.content);
    }
}
```

```TypeScript
// UserEdit.ts

import { View } from './View';
import { User, UserProps } from '../models/User';

export class UserEdit extends View<User, UserProps> {

    // NOTE: new added.
    regionsMap(): { [key: string]: Element } {
        return {
            userShow: '.user-show',
            userForm: '.user-form'
        }
    }

    template(): string {
        return `
            <div>
                <div class="user-show"></div>
                <div class="user-form"></div>
            </div>
        `;
    }
}
```

```TypeScript
// index.ts
import { UserEdit } from './views/UserEdit';
import { User } from './models/User';

const user = User.buildUser({ name: 'NAME', age: 111 });
const root: HTMLElement = document.getElementById('root');
if (root) {
    const userEdit = new UserEdit(root, user);

    userEdit.render();
    console.log(userEdit);
} else {
    throw new Error('Root element cannot be found');
}

```

#### ネスト表示させる

```TypeScript
import { Model } from '../models/Model';


 export abstract class View<T extends Model<K>, K> {

    //  ...

    // ネスト表示させたいインスタンスのrender()メソッドをここで呼出す
    onRender(): void {}

    render(): void {
        this.parent.innerHTML = '';

        const templateElement = document.createElement('template');
        templateElement.innerHTML = this.template();

        this.bindEvents(templateElement.content);
        this.mapRegions(templateElement.content);

        this.onRender();
        // onRednerで出力される要素を含めて、
        // すべて最終的にroot以下へ出力させる
        this.parent.append(templateElement.content);
    }
}
```

```TypeScript
import { View } from './View';
import { User, UserProps } from '../models/User';
import { UserForm } from './UserForms';
import { UserShow } from './UserShow';

export class UserEdit extends View<User, UserProps> {
    regionsMap(): { [key: string]: string } {
        return {
            userShow: '.user-show',
            userForm: '.user-form',
        };
    }

    // onRenderがあれば、
    // 好きな順番にregionsに登録してある要素へtemplateを表示させることが出来る
    // なので、ネストも可能
    onRender(): void {
        // regions.~を親要素としてそのもとにtemplateを出力する
        new UserShow(this.regions.userShow, this.model).render();
        new UserForm(this.regions.userForm, this.model).render();
        // 最終的にすべての要素をroot以下に出力する
    }

    template(): string {
        return `
            <div>
                <div class="user-show"></div>
                <div class="user-form"></div>
            </div>
        `;
    }
}


```
