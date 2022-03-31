// Basic
const carMakers: string[] = ['ford', 'toyota', 'chevy'];

// 多次元配列
const carsByMakers: string[][] = [['porche'], ['landcruiser'], ['lambo']];

// help with inference when extracting values
// 配列から値を展開するときに型推論してくれる
const maker = carMakers[0];
const myCar = carMakers.pop();

// 互換性のない値を配列に追加しようとするとそれは阻止してくれる
// carMakers.push(100);     // error highlighting 100

// -----------------
// 配列は異なる型の要素で構成することができる

// 型推論はこうなる
// const importantDays: (string | Date)[];
// tuple型になる
const importantDays = [new Date(), '2030-10-10'];
// annotationするならこうなる
const importantDays_: (string | Date)[] = [new Date(), '2030-10-10'];
// 初期化時以外の型は受け付けない
// importantDays.push(100); // error
