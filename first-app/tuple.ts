const pepsi_ = {
    color: 'brown',
    carbonated: true,
    sugar: 40,
};
// 配列では異なる型を受け付けることができる
// pepsiは型推論ではtupleである
// pepsi: (string | boolean | number)[]
const pepsi = ['brown', true, 40];

// tupleは厳格な順番を守る配列ということで次のように使うと便利
type StringNumberPair = [string, number];

// StringNumberPairの順番と数を守る変数の型定義
const haze: StringNumberPair = ['haze', 4];
const yamaarashi: StringNumberPair = ['yamaarashi', 9];

// 型の順番を変更してはならない
// const badHaze: StringNumberPair = [4, 'haze'];
// 数を変えてはならない (要素数は2個だけというエラーが出る)
// const badHaze: StringNumberPair = ['haze', 4, true];

type Drink = [string, boolean, number];
const cola: Drink = ['brown', true, 48];
const beer: Drink = ['gold', false, 0];
