## setting up



```bash
# typescriptをグローバルインストールした
$ npm install -g typescript ts-node
$ cd project
$ touch index.ts
# index.tsでVanillaJS書く
$ tsc index.ts
# index.jsが生成される
$ node index.js
# index.jsが実行される
```

#### 簡単な開発な一例

上記の tsc からは次の 1 行でもおｋ

```bash
$ ts-node index.ts
# index.jsが生成されて同時に実行される
```

index.ts

```JavaScript
axios.get(url).then((res) => {
    console.log(res.data);

    const todo = res.data;
    const ID = todo.ID;
    const title = todo.Title;
    const finished = todo.finished;

    console.log(`
    ID: ${ID}
    title: ${title}
    finished: ${finished}
    `);
});

```

上記を`ts-node`するとコンパイル時にエラーが起こる
ID, title, finished は undefined であると

```diff JavaScript
// Objectのproperty型定義
+ interface Todo {
+     id: number,
+     title: string,
+     completed: boolean
+ };

axios.get(url).then((res) => {
    console.log(res.data);

-     const todo = res.data;
+    const todo = res.data as Todo;
    const ID = todo.ID;     // Property 'ID' does not exist
    // ...
```

こうすると`todo.ID`とかが構文エラーのハイライトされる
当然コンパイルエラーになる

以下、typescript 的に正しいコード

```JavaScript

// Objectの型定義
interface Todo {
    id: number,
    title: string,
    completed: boolean
};

axios.get(url).then((res) => {
    console.log(res.data);

    const todo = res.data as Todo;
    const ID = todo.id;
    const title = todo.title;
    const finished = todo.completed;

    console.log(`
    ID: ${ID}
    title: ${title}
    finished: ${finished}
    `);
});

```

#### 関数での typescript

```JavaScript
interface Todo {
    id: number,
    title: string,
    completed: boolean
};

axios.get(url).then((res) => {
    console.log(res.data);

    const todo = res.data as Todo;
    const id = todo.id;
    const title = todo.title;
    const completed = todo.completed;

    logTodo(id, title, completed);
});

const logTodo = (id: number, title: string, completed:boolean) => {
    console.log(`
    ID: ${id}
    title: ${title}
    finished: ${completed}
    `);
}
```

## `Syntax + Features` vs `Design Patterns with TS`

正直に話すと
構文や細かい使い方は公式のドキュメントが最強であり
講義でわざわざ扱うのは無駄に思えるが

講師は構文や細かい使い方をあえて扱い
理解ができたところでデザインパターンに焦点を当てていくという講義スタイルをとっていくこととした模様

##### types

Two Type Categories

Primitive Types:

number
boolean
void
undefined
string
symbol
null

Object Types:

functions
arrays
classes
objects

#### type Annotations and Inferences

Type Annotations:

開発者が明示する型のこと

Type Inference:

TypeScript が推測する型のこと

型アノテーション・推論例

```TypeScript
// built in Object
let now: Date = new Date();

// Array
let colors: string[] = ['red', 'green', 'white'];
let colors: number[] = [11, 22, 33];

// Class
class Car {};
let car: Car = new Car();

// Object Literal
let point: { x:number, y: number } = {
    x: 20,
    y: 25
};

// Functions
// `: (i: number) => void`までがアノテーションである
// つまり戻り値がvoidで引数がnumberである
const logNumber: (i: number) => void = (i: number) => {
    console.log(i);
}
```

というかこの場合推論はおもにタイプエラーを表示してくれる機能で活躍している

#### understanding Inference

**もしも変数宣言時に初期化しているならば型推論は行われる**

#### `Any` type

any type が起こりえる場合

関数の戻り値

```TypeScript
// When to usue Annotation
// 1) Function that returns the 'any' type
const json = '{"x":10, "y": 20}';
const coordinates = JSON.parse(json);   // coordinates: any
console.log(coordinates);
```

余談）

公式：any type をアノテーションで使わってはならない
もしもどんな方なのかわからないけれど受け入れなくてはならない変数がある場合
`unknown`をつかえとのこと

解決策

```TypeScript
// When to usue Annotation
// 1) Function that returns the 'any' type
const json = '{"x":10, "y": 20}';
const coordinates: {x: number, y: number } = JSON.parse(json);
console.log(coordinates);
```

変数宣言だけして後から変数に値を代入する場合
（初期化しないということ）

```TypeScript
let words = ['red', 'gree', 'blue'];
// let foundWords;     // any
let foundWords: boolean;

for (let i = 0; i < words.length; i++) {
    if(words[i] === 'gree'){
        foundWords = true;
    }
}
```

Type Inference が効かないとき

条件が合えば number をそうでなければ boolean を一つの変数で扱いたいようなとき

```TypeScript
// 3) Variable whose type cannot be inferred correctly
let numbers = [-10, -1, 12];
let numberAboveZero: boolean | number = false;

for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] > 0) {
    numberAboveZero = numbers[i];
  }
}

```

## Function Annotation

Function Annotation: 引数と戻り値に型をつける
Function Inference: 戻り値の推測をする

詳しくは function-annotations.ts みて

## Typed Arrays

type arrays: 各要素は一貫した型を持つ

-   配列から値を展開するときに型推論する
-   互換性のない値を配列に追加しようとするとそれを阻止してくれる
-   `map`, `forEach`, `reduce`の恩恵を得られる
    .map を使うときとかに利用できるメンバなどをエディタが教えてくれるという意味

-   それでも配列は異なる型を受け入れることができる

詳しくは typed-arrays.ts みて

## Tuple

> タプル型は、含まれる要素の数と、特定の位置に含まれる型を正確に把握している別の種類の配列型である

つまり

-   tuple は要素数を変更してはならない？
-   tuple は型の順番を崩してはならない

```TypeScript
type StringNumberPair = [string, number];
const mojisuu: StringNumberPair = ['haze', 4];
const mojisuu: StringNumberPair = [4, 'haze'];
```

## Interface

> `interface`宣言はオブジェクトタイプに名前を付けるもう一つの方法である

> インターフェイスは、オブジェクトのプロパティ名と値タイプを記述する新しいタイプを作成します

つまり Object の型を自由に設定できる宣言である

まず Object Types

```TypeScript
function printCoord(pt: {x: number, y: number} ) {
    console.log("The coordinate's x value is " + pt.x);
    console.log("The coordinate's y value is " + pt.y);
}
```

型エイリアス

```TypeScript
type ID = number | string;

function makeID(str: string) : ID {
    return someIDMake(string)
}
```

型エイリアスと interface の違い

```TypeScript

// Extending an interface

interface Animal {
  name: string
}

interface Bear extends Animal {
  honey: boolean
}

const bear = getBear()
bear.name
bear.honey

// Extending a type via intersections

type Animal = {
  name: string
}

type Bear = Animal & {
  honey: boolean
}

const bear = getBear();
bear.name;
bear.honey;


// -----
// Adding new fields to an existing interface

interface Window {
  title: string
}

interface Window {
  ts: TypeScriptAPI
}

const src = 'const a = "Hello World"';
window.ts.transpileModule(src, {});


// A type cannot be changed after being created

type Window = {
  title: string
}

type Window = {
  ts: TypeScriptAPI
}

 // Error: Duplicate
```

> タイプエイリアスとインターフェイスは非常に似ており、多くの場合、自由に選択できます。
> インターフェイスのほとんどすべての機能はタイプで使用できます。
> 主な違いは、タイプを再度開いて新しいプロパティを追加することはできないのに対し、
> インターフェイスは常に拡張可能であるということです。

#### Interface と関数

再利用性の高い関数の定義には interface が欠かせない

関数の引数としてオブジェクトを渡す場合、その引数の型付けのために
すべてのフィールドに対する型付けを実装した interface は必ず必要というわけではない

下記にその例を示す

interfaces.ts

```TypeScript
const oldCivic2 = {
    name: 'civic',
    year: 2000,
    broken: true,
    summary(): string {
        return `Name: ${this.name}`;
    }
};

const drink = {
    color: 'brown',
    carbonated: true,
    sugar: 40,
    summary(): string {
        return
    }
};

// Reusable Interface
interface Reportable {
    summary(): string;
};

const printSummary = (item: Reportable) : void => {
    console.log(item.summary())
}

printSummary(drink);
printSummary(oldCivic2);
```

上記のコードの何が優れているか？
それはことなるオブジェクトを渡しても受け付けることができる関数を実装できている点である

`oldCivic2`と`drink`はことなる中身をもつオブジェクト同士であるが
共通のオブジェクトメソッドを持つ部分にだけ対応した interface を関数の引数型付けした関数に渡すと、これはタイプエラーにならない

TypeScript で再利用性の高い戦略をとるには
上記のように interface で型付けされた引数を受け取る関数を作成することである

しかしすべての関数が常に interface を持つ必要はなくて

-   interface で型アノテーションされた引数をとる関数を定義すること
-   ある関数を利用するために、与えられたインターフェースを「実装」することを決定できる Object/Class を定義すること

## Building Functionality wiht Classes

- public, private, protect指定子

JavaScriptではデフォルトですべてのプロパティとメソッドがパブリックである
そしてpublic, private, protectというキーワードはない

ES6以降ならば
#を接頭辞としてつけるとprivate扱いになる

TypeScriptではpublic, private, protectをつけることができる

```TypeScript
class Vehicle {
    public drive(): void {
        console.log("chugga chugga");
    }
    public honk(): void {
        console.log('honkhonk');
    }
}
```



- オーバーライドについて

publicメソッドは継承先でprivateとしてオーバーライドできない

JavaScriptのはなし:
基底クラスのメソッドと同じ名前のメソッドを継承クラスで定義できる
これは基底クラスのメソッドよりも優先される
優先されるのはメソッドを参照するときの優先順位として自メソッドを優先するだけから


```TypeScript
class Vehicle {
    public drive(): void {
        console.log("chugga chugga");
    }
    public honk(): void {
        console.log('honkhonk');
    }
}

// Error: 
class Car extends Vehicle {
    // 基底クラスのpublicメソッドはprivateとしてオーバーライドできない
    private drive(): void {
        console.log("vroom!!");
    }

    drivingProcess():void {
        this.drive();
    }
}

const car = new Car();
car.drivingProcess();
car.honk();
```

- protected

protectedプロパティはそれが定義されているクラスとそのサブクラスからのみアクセスできる

```JavaScript
class Vehicle {
    protected honk(): void {
        console.log('honkhonk');
    }
}

const vehicle = new Vehicle();
vehicle.honk();   // Error

class Car extends Vehicle {
    private drive(): void {
        console.log('vroom!!');
    }

    drivingProcess(): void {
        this.drive();
        this.honk();
    }
}

const car = new Car();
car.drivingProcess();   // vroom! honkhonk
```


- constructor

デフォでfieldはpublicなのでconstructorで初期化するようなフィールドも
型付けして明示するならば次のとおりである

```TypeScript
class Vehicle {

    constructor(public color: string, private carType: string) {
        this.color = color;
        this.carType = carType;
    }
    protected honk(): void {
        console.log('honkhonk');
    }
}

const vehicle = new Vehicle("red", "sedan");
console.log(vehicle.color);   // red
console.log(vehicle.carType);   // Error
```

- super

とくになし


- 型付けclassの使いどころ

interfaceと一緒に使うことで再利用性の高いコードが生み出せるとのこと



