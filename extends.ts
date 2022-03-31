/*
    extends

既存interfaceを継承したinterfaceを生成することができる

interfaceはあとからプロパティを追加することができる
しかし既存のプロパティは上書きできない
extendsを使えば条件付きで変更が可能である

extendsがついていたら、それは継承されたということと
上書きされる可能性があるとみることができる
*/

interface iFoo {
    bar: string;
    baz: number | string;
}

// OK
interface iFoo {
    qux: boolean;
}

// DON'T DO THIS
// あとから上書きはできない
//
// interface iFoo {
//     bar: boolean;
// }

const foo: iFoo = {
    bar: 'bar',
    baz: 1,
    qux: true,
};

// exntends
// 継承したinterfaceならば上書きが可能である
interface iFooExtended extends iFoo {
    baz: number;
}

// iFooExtended自体は既にbazを定義済なので
// あとから変更できないのはextendsを使わないときと同じ
//
// interface iFooExtended extends iFoo {
//     // Error:
//     baz: boolean;
// }
