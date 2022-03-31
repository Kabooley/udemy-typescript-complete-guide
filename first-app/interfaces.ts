// interfaces

// Basic usage
interface Point {
    x: number;
    y: number;
}

function printCoord(pt: Point) {
    console.log("The coordinate's x value is " + pt.x);
    console.log("The coordinate's y value is " + pt.y);
}

printCoord({ x: 100, y: 100 });

// # Why we use interface ? ----------------------------
//
// Interfaceを使わないと
// Objectを渡すことになる
// これはこのオブジェクトにも型アノテーションが必要になる
// しかも関数
const oldCivic = {
    name: 'civic',
    year: 2000,
    broken: true,
    summary(): string {
        return `Name: ${this.name}`;
    },
};

// const printVehicles = (vehicle: {
//     name: string;
//     year: number;
//     broken: boolean;
// }) => {
//     console.log(`Name: ${vehicle.name}`);
//     console.log(`Year: ${vehicle.year}`);
//     console.log(`Broken: ${vehicle.broken}`);
// };

// printVehicles(oldCivic);

// interfaceなら型の指定だけされている
// 一度定義すれば再利用できる
interface vehicle {
    name: string;
    year: number;
    broken: boolean;
}

// 引数のアノテーションもすっきり
const printVehicles = (vehicle: vehicle) => {
    console.log(`Name: ${vehicle.name}`);
    console.log(`Year: ${vehicle.year}`);
    console.log(`Broken: ${vehicle.broken}`);
};

printVehicles(oldCivic);

// 既存のinterfaceにはあとから新規のフィールドを足すことができる
// ただしあとから足すと上記のprintVehicles(oldCivic)はエラー構文になってしまう
// summary()はオブジェクトメソッドでstring型を返す
interface vehicle {
    summary(): string;
}

//
// interface の再利用性 -------------------------------------------
//
// interfaceは関数の引数のアノテーションとして使われるとき
// 引数のすべてのフィールドに対して対応するフィールドを用意しなくていい
// なので
// 関数が引数として渡されるオブジェクトの一部にしか用がないようなとき
// その関数が使うフィールドだけアノテーションしているinterfaceを用意することができる

const oldCivic2 = {
    name: 'civic',
    year: 2000,
    broken: true,
    summary(): string {
        return `Name: ${this.name}`;
    },
};

const drink = {
    color: 'brown',
    carbonated: true,
    sugar: 40,
    summary(): string {
        return;
    },
};

// Reusable Interface
interface Reportable {
    summary(): string;
}

const printSummary = (item: Reportable): void => {
    console.log(item.summary());
};

// どちらも異なるオブジェクトをまるっと渡しているけれどtypeエラーにはならない
// そして両者のsummary()を実行している
printSummary(drink);
printSummary(oldCivic2);
