# Note about Reusable code

CSV ファイルの内容を読み取ってほしい情報を抽出するために
分析、抽出、提出を行うプログラムを作る

## Refactor by enum

CSV の情報の羅列から情報を抜き出すために次のコードをひとまず作る
しかしこのコードでは他の人が見たときにちんぷんかんぷんである
あなたも数日後には何を書いてあるのかわからなくなるかもしれない

```TypeScript

const CSV_FILENAME = 'football.csv';

const matches = fs
    .readFileSync(CSV_FILENAME, {
        encoding: 'utf-8',
    })
    .split('\n')
    .map((row: string): string[] => {
        return row.split(',');
    });

let manUnitedWins = 0;

/*
他の人は"H"や"A"、配列のインデックスの１や２の意味が分からないだろう
*/
for (let match of matches) {
    if (match[1] === 'Man United' && match[5] === 'H') {
        manUnitedWins++;
    } else if (match[2] === 'Man United' && match[5] === 'A') {
        manUnitedWins++;
    }
}

```

-   付け焼刃な修正

```TypeScript

const CSV_FILENAME = 'football.csv';

const matches = fs
    .readFileSync(CSV_FILENAME, {
        encoding: 'utf-8',
    })
    .split('\n')
    .map((row: string): string[] => {
        return row.split(',');
    });

let manUnitedWins = 0;

/*
"H"や"A"の意味は分かったけれど
DRAWの場合も実はある

match[1]の場所に必ず一致するデータがあるとは限らない...

なので適切な修正ではない
*/
const homeWin = "H";
const awayWin = "A";
// 定義したはいいけど使われていないから、他の人がこの変数を削除してしまうかもしれない
const draw = "D"

for (let match of matches) {
    if (match[1] === 'Man United' && match[5] === homeWin) {
        manUnitedWins++;
    } else if (match[2] === 'Man United' && match[5] === awayWin) {
        manUnitedWins++;
    }
}

```

-   enum

```TypeScript

const CSV_FILENAME = 'football.csv';

const matches = fs
    .readFileSync(CSV_FILENAME, {
        encoding: 'utf-8',
    })
    .split('\n')
    .map((row: string): string[] => {
        return row.split(',');
    });

let manUnitedWins = 0;

/*
DATA SETを使う

Objectでもいいけれど
enumが使える

*/
// const MatchResult = {

//  homeWin :"H",
//  awayWin : "A",
//  draw : "D"
// }
enum MatchResult {

 homeWin="H";
 awayWin= "A";
 draw ="D";
}

for (let match of matches) {
    if (match[1] === 'Man United' && match[5] === MatchResult.homeWin) {
        manUnitedWins++;
    } else if (match[2] === 'Man United' && match[5] === MatchResult.awayWin) {
        manUnitedWins++;
    }
}

```

## When to use Enum

Enum とは

-   通常のオブジェクトとほぼ同じ構文規則に従う
-   TS から JS に変換されるときはオブジェクトの key-to-value のペアで生成される
-   優先的な目的は他のエンジニアにどういった信号を使うのかを伝えることである
-   コンパイル時にすべて密接に関連し、既知である小さな固定値のセットがある場合は常に使用します
