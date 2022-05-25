# Note: Section 14: Express + TypeScript iIntegration

講義ノート

## 219: Why TypeScript doesn't work well with Express ?

世の中のライブラリには、

簡単にTypeScriptを導入することができないものもあるといういい例

**ExpressにTypeScriptを導入するのは非常に難しい**

理由：

1. ExpressはMiddlewareでプロパティを追加、変更、削除をすることができる

2. 型定義ファイルを使っているということ


下記の通り、bodyParserをコメントアウトすると、

Middlewareが意味をなさなくなるから、

本来、

`req`に`body`があることは不明であるはずであるが

`res`に型付け`Request`がついているから

`Request.body`が定義されている以上

`req.body`はTypeScriptとしては有効といってしまうのである

```TypeScript
// idnex.ts
import express, { Request, Response } from 'express';
import { router } from './routes/loginRoutes';
import bodyParser from 'body-parser';


const app = express();

// IF bodyParser doesn't exist...
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

app.listen(3000, () => {
    console.log('Listening on port 3000');
});


// loginRouter.ts
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/login', (req: Request, res: Response) => {
    res.send(`
        <form method="POST">
            <div>
                <label>Email</label>
                <input name="email" />
            </div>
            <div>
                <label>Password</label>
                <input name="password" type="password" />
            </div>
            <button>Submit</button>
        </form>
    `);
});

router.post('/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    res.send(email + password);
})

export { router };
```


Middlewareは`Request`, `Response`、`NextFunction`を受け取ることができる

唯一それらの処理を施すことができる

Middleware抜きにrequest.body等は読み取ることはできない

Middlewareではプロパティの追加や削除がなされている場合があるけれど、

TypeScriptがそれを知ることはできない

MiddlewareはJavaScrptで実装されているのである

いま、プロジェクトには`bodyParser`というサードパーティ製のMiddlewareを含めているのでresponse.bodyを読み取ることができている

MiddlewareにTypeScriptを含めるのは逆効果である

では、

どうやってExpressとTypeScriptをうまく統合させることができるのか

## 220: Issues with Type Definition FIles

Cons & Pros (選択する理由と選択しない理由)

統合する理由としない理由

CONS:

- 型定義ファイル単体ではJavaScriptでいったい何が起こっているのか正確にわからない
- 常に正確な型定義を提供してくれるとは限らない
- （型定義によってさらに悪化する部分）サーバへ入力された内容は確実に存在するとは保証されない

PROS:
- 型定義はよりよいコードを書くことを促す

講義では、実際に型定義ファイル（Expressの型定義ファイル）が基本的に

利用するに水準でない場合に利用できる方法を紹介する

## 221: Dealing with Poor Types Defs

完全な解決策というわけではなく、検討すべき解決策のひとつ


1. 直接型定義ファイルをその都度変更する

たとえば、Express の `Request`が適していない型定義だったら、

その都度都合のいい型定義を自作する

```TypeScript
// 型定義ファイルの定義'Request'が貧弱な型定義だったら...
import { Request } from 'express';


// 拡張する
interface RequestWithBody extends Request {
    body: { [key: string]: string | undefined };
}
```

## 222: Wiring Up Sessions

```TypeScript
// index.ts
import express, { Request, Response } from 'express';
import { router } from './routes/loginRoutes';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ keys: ['lasdk'] }));
app.use(router);

app.listen(3000, () => {
    console.log('Listening on port 3000');
});


// loginRoutes.ts
import { Router, Request, Response } from "express";

const router = Router();

interface RequestWithBody extends Request {
  body: { [key: string]: string | undefined };
}

router.get("/login", (req: RequestWithBody, res: Response) => {
  res.send(`
        <form method="POST">
            <div>
                <label>Email</label>
                <input name="email" />
            </div>
            <div>
                <label>Password</label>
                <input name="password" type="password" />
            </div>
            <button>Submit</button>
        </form>
    `);
});

router.post("/login", (req: RequestWithBody, res: Response) => {
  // NOTE: To read `body`, bodyParser is required.
  const { email, password } = req.body;
  if (
    email &&
    password &&
    email === "sddsa@good.com" &&
    password === "some-awesome-password"
  ) {
    req.session = { loggedIn: true };
    res.redirect("/");
  } else {
    res.send("Invalid email or password");
  }
});

export { router };
```

## 226~: A Closer Integration

Expressをclassラッピングする

TypeScriptとExpressの統合には困難が伴う

npm packageの`ts-express-decoratoers`のようなものを実装してみる(参考にもなる)

`ts-express-decorators`@Controller:

https://www.npmjs.com/package/ts-express-decorators#create-your-first-controller

ここで目にする`@Controller`などの`@`から始まるキーワードはデコレータと呼ばれる

**decoratorはTypeScriptの機能である**


#### プロトタイプチェーンの話との関連

プロトタイプはそのオブジェクトに含まれるものではなくて

継承元にあるものである

プロトタイプはオブジェクトを生成した後でも追加し放題

具体的に言うと、

newしたあとのオブジェクトのプロトタイプがあるとして、

継承元のオブジェクトにあと出しでメソッドを追加したら

さっきnewしたオブジェクトもその後出しメソッドを使うことができる

この辺はJavaScript特有の話で

クラスからインスタンスができるのではなくて

もとのオブジェクトを継承しているオブジェクトを生成しているだけなのである


つまり、将来にわたってオブジェクトは変更されうるのである

#### Details of Decorator

TypeScriptのDecoratorの話。

JavaScriptにもDecoratorがあるらしい。

JavaScriptのDecoratorは実験段階らしくTypeScriptにおいても同様である。


https://www.typescriptlang.org/docs/handbook/decorators.html

以下、TypeScriptのDecoratorの説明

> TypeScriptとES6にクラスが導入されたことで、クラスとクラスメンバーの注釈付けまたは変更をサポートするための追加機能を必要とする特定のシナリオが存在するようになりました。

> デコレータは、クラス宣言とメンバーのアノテーションとメタプログラミング構文の両方を追加する方法を提供します。デコレータはJavaScriptのステージ2の提案であり、TypeScriptの実験的な機能として利用できます。

使うためには次のコマンドを

```bash
$ tsc --target ES5 --experimentalDecorators
```
とのこと

(TypeScriptの)デコレータは...

- クラス内のさまざまなプロパティ/メソッドを変更/変更/変更するために使用できる関数
- JavaScriptのDecoratorとは異なる
- classの中または上部にDecoratorがつく
- 理解のカギは、**デコレータの実行順序**にある
- 実験段階の機能である

> デコレータは、クラス宣言、メソッド、アクセサ、プロパティ、またはパラメータにアタッチできる特別な種類の宣言です。デコレータは@expressionの形式を使用します。ここで、expressionは、装飾された宣言に関する情報を使用して実行時に呼び出される関数に評価される必要があります。 たとえば、デコレータ@sealedが与えられた場合、sealed関数を次のように記述できます。

既存のclassやメソッドに追加機能を入れるようなものっぽい

- Decorator Factory

> デコレータを宣言に適用する方法をカスタマイズしたい場合は、デコレータファクトリを作成できます。デコレータファクトリは、実行時にデコレータによって呼び出される式を返す関数です。 デコレータファクトリは次のように記述できます。

```TypeScript
function color(value: string) {
  // this is the decorator factory, it sets up
  // the returned decorator function
  return function (target) {
    // this is the decorator
    // do something with 'target' and 'value'...
  };
}
```

次の例が直感的かも

```TypeScript
function first() {
  console.log("first(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("first(): called");
  };
}
 
function second() {
  console.log("second(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("second(): called");
  };
}
 
class ExampleClass {
  @first()
  @second()
  method() {}
}

// output order: 上から順番に＠呼出関数が評価される
// その後その順番の下から上へ順番にreturnされた関数が呼び出される
// 
// first(): factory evaluated
// second(): factory evaluated
// second(): called
// first(): called
```

つまり、クラスExampleClassのなかではひとまずデコレータを宣言して

実際に呼び出される関数はfirst(), second()内で好きに定義できるという話である

prototypeチェーンと何が違うの？

```JavaScript
// Prototype chain
const ExampleClass = function() {
    this.method = function() {};
}

ExampleClass.prototype.first = function() {
    console.log("first(): called");
}

ExampleClass.prototype.second = function() {
    console.log("second(): called");
}
```

講義：

```TypeScript
// features/decorators.ts
class Boat {
    color: string = "red";

    get formattedColor(): string {
        return `This boat color is ${this.color}`;
    }

    @testDecorator
    pilot(): void {
        console.log('swish');
    }
}

function testDecorator(target: any, key: string): void {
    console.log('Target:', target);
    console.log('Key:', key);
}
```

```bash
$ ts-node decorators.ts
# 実行結果
Target: { pilot: [Function (anonymous)] }
Key: pilot
```

#### Decoratorsはproperty, method, accessorからなる

- 第一引数はオブジェクトのプロパティである

上記の例の場合、Boatのプロトタイプである
上記のbashの出力だと：TargetはBoatのプロトタイプである

- 第二引数はオブジェクトのプロパティ/メソッド/アクセサのキー

bashは`pilot`を出力している

これは@testDecoratorをclass内の Pilot上においているからである
もしも@testDecoratorをformattedColorに置いたら

```bash
$ ts-node decorators.ts

Target: { pilot: [Function (anonymous)] }
Key: formattedColor
```

と出力される


- 第三引数はプロパティ記述子である
- Decoratorは、このクラスのコードが実行されるとき（※）に適用されます（インスタンスが作成されるときではありません）

※実行時というのは関数を実行呼出しているときじゃなくて
アプリケーションの実行時であるよ

※＠呼出が記述されてあれば呼び出されるよ

JavaScriptへのコンパイル結果:

```JavaScript

"use strict";

// この__decorateは、
// TypeScriptファイルの方で@decoratorを付けると生成される
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

class Boat {
    constructor() {
        this.color = "red";
    }
    get formattedColor() {
        return `This boat color is ${this.color}`;
    }
    pilot() {
        console.log('swish');
    }
}

// 実行呼出は一切ないけれど、
// Decoratorが実行されている!!
// 
// 先の説明の通り、
__decorate(
  // Decorator
  // decoratorが定義されてあれば多分全部入るんだと思う
  [
    testDecorator,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
  ],
  // Target
   Boat.prototype, 
  //  key
   "formattedColor", 
  //  Descriptor
   null);


function testDecorator(target, key) {
    console.log('Target:', target);
    console.log('Key:', key);
}
```

`__decorator`がしていること:

```JavaScript
var __decorator = function(decorators, target, key. desc) {
  var desc = Object.getOwnPropertyDescriptor(target, key);

  for(var decorator of decorators) {
    decorator(target, key, desc);
  }
}
```
つまり渡されたすべてのデコレータそれぞれにtartget, key, descriptorを渡して実行されている

ということはつまり、先のdecorators.tsでやっていたのは、

```JavaScript

class Boat {
  // ...
  pilot(): void {}
  // ...
}

function testDecorator(target, key) {
    console.log('Target:', target);
    console.log('Key:', key);
}

testDecorator(Boat.prototype, 'pilot');
```

ということである

#### プロパティ記述子

デコレータメソッドの第三引数のプロパティ記述子とは何者なのか

```TypeScript
// プロパティ記述子のinterface

interface PropertyDescriptor {
  // 変更可能または削除可能なプロパティ定義
    configurable?: boolean;
    // ループ`for...in`できるかどうか
    enumerable?: boolean;
    // 現在の値
    value?: any;
    // このプロパティが変更可能かどうか
    writable?: boolean;
    get?(): any;
    set?(v: any): void;
}
```


```bash
$ const car = { make: 'honda', year: 2000 };
undefined
$ car
{make: 'honda', year: 2000}
$ Object.getOwnPropertyDescriptor(car, 'make')
{value: 'honda', writable: true, enumerable: true, configurable: true}configurable: trueenumerable: truevalue: "honda"writable: true[[Prototype]]: Object
# 
# プロパティ記述子のwritableを変更する
# 
$ Object.defineProperty(car, 'make', { writable: false });
{make: 'honda', year: 2000}
$ car
{make: 'honda', year: 2000}
# 
# するとmakeを変更しようとしても、
# 
$ car.make = "Ford"
'Ford'
$ car
# 
# 変更は反映されない
# 
{make: 'honda', year: 2000}
```

というようにプロパティの扱いについての定義である


実際に使ってみて理解を深めよう

```TypeScript
class Boat {
    color: string = 'red';

    // ...

    @logError
    pilot(): void {
        throw new Error();
        console.log('swish');
    }
}

function testDecorator(target: any, key: string): void {
    console.log('Target:', target);
    console.log('Key:', key);
}

function logError(target: any, key: string, desc: PropertyDescriptor): void {
  // 
  // pilot()の上に@logErrorがついているので
  // valueはメソッドpilotになる
    const method = desc.value;

    desc.value = function () {
        try {
            method();
        } catch (e) {
            console.log('Boat was sunk');
        }
    };
}

new Boat().pilot();
```

上記はつまり、実際にpilot()がどこかで実行される前に

実行時の段階で呼出してみてエラーが起こるかどうか実験しているのである

出力結果

```bash
$ ts-node decorators.ts

Boat was sunk
```


#### @decorator呼出にデコレータ・ファクトリを渡す

これまでの話では直接@decoratorで関数(logErrorとか)を呼出してきた

@decoratorに引数を渡したいような場合がある

そんな時はデコレータファクトリを使う

```TypeScript
class Boat {
    color: string = 'red';

    // 引数付きでデコレータを呼び出す
    @logError('Boat was sunk')
    pilot(): void {
        throw new Error();
        console.log('swish');
    }
}

// デコレータ・ファクトリ
// 
// 先のデコレータをラッピングして返す関数
function logError(errorMessage: string) {
    return function (target: any, key: string, desc: PropertyDescriptor): void {
        const method = desc.value;
    
        desc.value = function () {
            try {
                method();
            } catch (e) {
                console.log('Boat was sunk');
            }
        };
    }
}

new Boat().pilot();
```

引数が全く必要じゃないなら

デコレータファクトリは必要ないけれど

たとえば上記の例だと、errorMessageとしていろいろな場合が想定されるから

`Boat was sunk`以外にしたい場合もあるでしょう

なので引数をとって呼出すデコレータが一般的になるだろうから

デコレータファクトリは頻繁に使うことになる

#### decoratorを付与できる対象

つまり何の上に@decoratorをつけることができるのって話

- method: クラスメソッドなど
- property: クラスプロパティ
- accessor: get, setがついたメソッド

#### Decorators on Property

**デコレータはインスタンスのプロパティにアクセスすることができない!!**

理由は、デコレータはインスタンスが生成される前に実行されるからである

```TypeScript
class Boat {
    // プロパティにデコレータをつけてみた
    @testDecorator
    color: string = 'red';

    get formattedColor(): string {
        return `This boat color is ${this.color}`;
    }

    pilot(): void {
        throw new Error();
        console.log('swish');
    }
}

function testDecorator(target: any, key: string): void {
    // undefined
    console.log(target[key]);
    // undefined
    console.log(target.color);
}

```
 
 #### Decorator for parameter

 ```TypeScript
class Boat {
    color: string = 'red';

    get formattedColor(): string {
        return `This boat color is ${this.color}`;
    }

    // Decorator for Parameter
    pilot(@parameterDecorator speed: string): void {
        if(speed === 'fast') {
            console.log("swish");
        }
        else {
            console.log("nothing");
        }
    }
}

function parameterDecorator(target: any, key: string, index: number): void {
    console.log(key, index);
}
 ```
出力結果

```console
pilot 0
```

引数を増やすと...

```TypeScript
    pilot(
        @parameterDecorator speed: string,
        @parameterDecorator generateWake: boolean
    ): void {
        if (speed === 'fast') {
            console.log('swish');
        } else {
            console.log('nothing');
        }
    }
```

```console
pilot 1
pilot 0
```
#### Decorator on Class

まぁ公式を見てくれ


## Prerequisities of SECTION 16: Advanced Express and TS Integration

JavaScriptの知識とExpressの知識がちゃんとあることを前提して進めます

とのこと

