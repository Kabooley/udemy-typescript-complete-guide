/*
Modify Object nested data.

参考
https://typeofnan.dev/deep-object-change-handlers-in-typescript/

TypeScriptプロジェクトにおいて
深いネストのオブジェクトプロパティをどうやって変更するのか

Genericを使う
*/

type Settings = {
    display: {
        mode: 'light' | 'dark';
    };
    user: {
        name: string;
        age: number;
        admin: boolean;
    };
};

const settings: Settings = {
    display: {
        mode: 'dark',
    },
    user: {
        name: 'Betty',
        age: 27,
        admin: false,
    },
};

const updateSettings = <K extends keyof Settings, S extends keyof Settings[K]>(
    key: K,
    subkey: S,
    value: Settings[K][S]
): Settings => {
    const newSettings = {
        ...settings,
        [key]: {
            ...settings[key],
            [subkey]: value,
        },
    };

    return newSettings;
};

//   検証パート -----------------------

// keyof --------------------------

type Person = {
    name: string;
    old: number;
};

// type keys = keyof Personと出力される
type Keys = keyof Person; // "name" | "old"

// keysはnameまたはoldしかとることができない
let keys: Keys;
keys = 'name'; // OK
keys = 'old'; // OK
// Error: Type '"xxx"' is not assignable to type '"name" | "old"'.
// keys = 'xxx';


// 我々は[]を使って特定のプロパティを取得できる
// これはtypeオブジェクトの型をAnimal["age"]でnumberを取得している
type Animal = {age: number; name: string; alive: boolean;};
type Age = Animal["age"];   // type Age = number;

type I1 = Animal["age" | "name"];
type I2 = Animal[keyof Animal];


// typeof ---------------

type Person_ = {
    name: string;
    old: number;
  };
  
  const person_: Person_ = {
    name: 'yamada',
    old: 22,
  };

//   type Person2 = {name: string, old: number}と出力される
  type Person2 = typeof person_;
  const person2_: Person2 = {
      name: "Johnahim",
      old: 33
  }



/*

union:  

  2つ以上の型からなる、いずれかの型をとることができる型を生成できる

interface:

  あとからメンバーを追加することはできるが、上書きはできない

extends:

  既存interfaceを継承したinterfaceを生成することができ、既存メンバを上書きできる

keyof: 

    型コンテキストで keyof を利用するとオブジェクトのプロパティ名を抽出して 文字列リテラルのユニオン型(String Literal Union) を取得できる


typeof: 変数の型を取得できる。JavaScriptのやつと同じ



type vs. interface

- typeはextendsは使えない(同様のことはできる)
- typeはあとからメンバを追加できない


*/
