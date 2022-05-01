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

#### context問題

先のgetterを使ってさっそく実行してみる

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

正しく行うにはconstructor内でsuper()を呼び出して

this.メソッド = this.メソッド.bind(this)することになる

ともかく、この変更をすべてのUserが取り込むことになるclassへ適用する

講義ではその（逆行的な）リファクタリングはしなかったので

この辺を実際どうすべきかはかかわるプロジェクトでのルールに従うことになるでしょう

#### set()の呼び出しで複数のメソッドを内部的に呼び出したい

user.set()でuser.attributes.set()とuser.eventing.trigger()を呼び出したい

そんなとき

