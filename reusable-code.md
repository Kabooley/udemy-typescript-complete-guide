# Note Resuable Code section

## 講義の目標

再利用性が高いコードが書けるようになる
どんなCSVファイルでも読み込んで適切にデータを出力できるプログラムを作る


## ひな形

これにTypeScriptを導入していく

```JavaScript
import fs from 'fs';

const matches = fs
    .readFileSync('football.csv', {
        encoding: 'utf-8',
    })
    .split('\n')
    .map((row: string): string[] => {
        return row.split(',');
    });

let manUnitedWins = 0;
const homeWin = 'H';
const awayWin = 'A';
const draw = 'D';

for (let match of matches) {
    if (match[1] === 'Man United' && match[5] === homeWin) {
        manUnitedWins++;
    } else if (match[2] === 'Man United' && match[5] === awayWin) {
        manUnitedWins++;
    }
}

console.log(`Man United won ${manUnitedWins} games`);

```


## enumを使う

列挙型
enumに関しては他のTypeScriptと異なり言語とランタイムレベルに追加された機能で
使用は控えるべきとのこと

enumを使うと名前の付いた定数をセットで定義できる
数値ベースと文字列ベースの両方の列挙型を提供する

講義では文字列型を使っている


適用前
```JavaScript
const MatchResult = {
    homeWin:'H',
    awayWin: 'A',
    draw: 'D'
};

for (let match of matches) {
    if (match[1] === 'Man United' && match[5] === MatchResult.homeWin) {
        manUnitedWins++;
    } else if (match[2] === 'Man United' && match[5] === MatchResult.awayWin) {
        manUnitedWins++;
    }
}

```

適用後
```TypeScript

enum MatchResult {
    homeWin = 'H',
    awayWin = 'A',
    draw = 'D'
};

for (let match of matches) {
    if (match[1] === 'Man United' && match[5] === MatchResult.homeWin) {
        manUnitedWins++;
    } else if (match[2] === 'Man United' && match[5] === MatchResult.awayWin) {
        manUnitedWins++;
    }
}
```

- enumの変換のされ方

```JavaScript
var MatchResult;
(function (MatchResult) {
    MatchResult["homeWin"] = "H";
    MatchResult["awayWin"] = "A";
    MatchResult["draw"] = "D";
})(MatchResult || (MatchResult = {}));

```
オブジェクトが生成されている

- どんな時に使うの？

よくわかっていないです


## Type Assertion

```bash
[start:run]   [
[start:run]     2018-10-28T15:00:00.000Z,
[start:run]     'Tottenham',
[start:run]     'Man City',
[start:run]     0,
[start:run]     1,
[start:run]     'A',
[start:run]     'K Friend'
[start:run]   ],
```
上記のようなデータをcsvファイルから取得するとき
正しい型を指定しているかの確認

- tupleを使って型と順番を厳密に守らせる

```TypeScript
import fs from 'fs';
import { dateStringToDate } from './utils';
import { MatchResult } from './MatchResult';

export class CsvFileReader {
  data: string[][] = [];

  constructor(public filename: string) {}

  read(): void {
    this.data = fs
      .readFileSync(this.filename, {
        encoding: 'utf-8'
      })
      .split('\n')
      .map(
        (row: string): string[] => {
          return row.split(',');
        }
      )
      .map(
        (row: string[]): (Date | string |string | number | MatchResult | string)[]  => {
          return [
            dateStringToDate(row[0]),
            row[1],
            row[2],
            parseInt(row[3]),
            parseInt(row[4]),
            // enum specification
            row[5] as MatchResult,
            row[6]
          ];
        }
      );
  }
}
```

- 見やすく

`MatchData`は型推論でtupleになる

```TypeScript
type MatchData = [Date, string, string, number, MatchResult, string];

// ...
.map(row: string[]):MatchData[] => {
    // ...
}
```


- ひと段落

これで`football.csv`というファイルは適切に読み込めるようなプログラムはできた

```TypeScript
import fs from 'fs';
import { dateStringToDate } from './utils';
import { MatchResult } from './MatchResult';

type MatchData = [Date, string, string, number, number, MatchResult, string];

export class CsvFileReader {
    data: MatchData[] = [];

    constructor(public filename: string) {}

    read(): void {
        this.data = fs
            .readFileSync(this.filename, {
                encoding: 'utf-8',
            })
            .split('\n')
            .map((row: string): string[] => {
                return row.split(',');
            })
            .map((row: string[]): MatchData => {
                return [
                    dateStringToDate(row[0]),
                    row[1],
                    row[2],
                    parseInt(row[3]),
                    parseInt(row[4]),
                    row[5] as MatchResult,
                    row[6],
                ];
            });
    }
}
```

## Refoctoring

より再利用性の高いコードにしていく

```TypeScript
import fs from 'fs';
import { dateStringToDate } from './utils';
import { MatchResult } from './MatchResult';

type MatchData = [Date, string, string, number, number, MatchResult, string];

export class CsvFileReader {
    data: MatchData[] = [];

    constructor(public filename: string) {}

    read(): void {
        this.data = fs
            .readFileSync(this.filename, {
                encoding: 'utf-8',
            })
            .split('\n')
            .map((row: string): string[] => {
                return row.split(',');
            })
            .map(this.mapRow);
    }

    mapRow(row: string[]): MatchData {
        return [
            dateStringToDate(row[0]),
            row[1],
            row[2],
            parseInt(row[3]),
            parseInt(row[4]),
            row[5] as MatchResult,
            row[6],
        ];
    }
}
```

上記のようにすると、
mapRow以外のパーツはすべて普遍的に使えるものになっている

たとえばmapRowはその戻り値の型を変えれば
同じ形式のcsvファイルに対応できる

#### 抽象クラス

抽象クラス

```TypeScript
import fs from 'fs';
import { dateStringToDate } from './utils';
import { MatchResult } from './MatchResult';

export type MatchData = [Date, string, string, number, number, MatchResult, string];

export abstract class CsvFileReader {
    data: MatchData[] = [];

    constructor(public filename: string) {}
    
    abstract mapRow(row: string[]): MatchData;

    read(): void {
        this.data = fs
            .readFileSync(this.filename, {
                encoding: 'utf-8',
            })
            .split('\n')
            .map((row: string): string[] => {
                return row.split(',');
            })
            .map(this.mapRow);
    }
}
```

実装

```TypeScript
import { CsvFileReader, MatchData } from "./CsvFileReader";
import { dateStringToDate } from './utils';
import { MatchResult } from './MatchResult';

export class MatchReader extends CsvFileReader {
    mapRow(row: string[]): MatchData {
        return [
            dateStringToDate(row[0]),
            row[1],
            row[2],
            parseInt(row[3]),
            parseInt(row[4]),
            row[5] as MatchResult,
            row[6],
        ];
    }
}
```


## Generics

やっとか...

Generecs
- 関数の引数のようなものだけど、classと関数定義の型付けのためにある
- 未来におけるproperty, 引数、戻り値の型付けを可能としてくれる
- 再利用性の高いコードでは常用される

```TypeScript
// 定義するときは<>のなかの名前は自由である
// (当然、HoldAnythingのなかでは同じ名前を使わないといかん)
class HoldAnything<T> {
    data: T;
}

// 呼び出すときに型を決定する
const holdNumber = new HoldAnything<number>();
holdNumber.data = 123;

const holdString = new HoldAnything<string>();
holdString.data = 'asdfdssa';

```

つまり、
呼出時に決定されるような型を使いたいときにGenericsを使う
そうすることでclass/function内部で`<T>`を保留の型として使うことができる

これを利用するとこうなる

```TypeScript
// 抽象クラス
export abstract class CsvFileReader<T> {
    data: T[] = [];

    constructor(public filename: string) {}

    abstract mapRow(row: string[]): T;

    read(): void {
        this.data = fs
            .readFileSync(this.filename, {
                encoding: 'utf-8',
            })
            .split('\n')
            .map((row: string): string[] => {
                return row.split(',');
            })
            .map(this.mapRow);
    }
}

// 実装クラス
type MatchData = [Date, string, string, number, number, MatchResult, string];

export class MatchReader extends CsvFileReader<MatchData> {
    mapRow(row: string[]): MatchData {
            // ...
    }
}
```

抽象クラスはどんな型でも同じ機能を発揮することができるようになったね！


#### Alternate Refactor

先のGenericsのアプローチではなくてinterfaceによるリファクタリングを行う

依存関係が
```
interface DataReader:
    read(): void,
    data: string[][]

class MatchReader:
    reader: DataReader, // interface DataReader型で、ApiReaderやCsvFileReaderのインスタンスに対応できる
    load(): void

class CsvFileReader:
    read(): void,
    data: string[][]

class ApiReader
    read(): void,
    data: string[][]
```

という構成にする


変更前:

```TypeScript
// index.ts
import { MatchReader } from './MatchReader';
import { MatchResult } from './MatchResult';

const reader = new MatchReader('football.csv');
reader.read();

let manUnitedWins = 0;

for (let match of reader.data) {
  if (match[1] === 'Man United' && match[5] === MatchResult.HomeWin) {
    manUnitedWins++;
  } else if (match[2] === 'Man United' && match[5] === MatchResult.AwayWin) {
    manUnitedWins++;
  }
}

console.log(`Man United won ${manUnitedWins} games`);


// MatchReader.ts
interface DataReader {
  read(): void;
  data: string[][];
}

export class MatchReader {
  constructor(public reader: DataReader) {}
}


// CsvFileReader.ts
import fs from 'fs';
import { dateStringToDate } from './utils';
import { MatchResult } from './MatchResult';

type MatchData = [Date, string, string, number, number, MatchResult, string];

export class CsvFileReader {
  data: MatchData[] = [];

  constructor(public filename: string) {}

  read(): void {
    this.data = fs
      .readFileSync(this.filename, {
        encoding: 'utf-8'
      })
      .split('\n')
      .map(
        (row: string): string[] => {
          return row.split(',');
        }
      )
      .map(
        (row: string[]): MatchData => {
          return [
            dateStringToDate(row[0]),
            row[1],
            row[2],
            parseInt(row[3]),
            parseInt(row[4]),
            row[5] as MatchResult,
            row[6]
          ];
        }
      );
  }
}

```

変更後

```TypeScript
// CsvFileReader.ts
// 
// csvファイルを読み取って配列で返すクラスになった
import fs from 'fs';

export class CsvFileReader {
    data: string[][] = [];

    constructor(public filename: string) {}

    read(): void {
        this.data = fs
            .readFileSync(this.filename, {
                encoding: 'utf-8',
            })
            .split('\n')
            .map((row: string): string[] => {
                return row.split(',');
            });
    }
}

// MatchReader.ts
import { dateStringToDate } from './utils';
import { MatchResult } from './MatchResult';

type MatchData = [Date, string, string, number, number, MatchResult, string];

interface DataReader {
    read(): void;
    data: string[][];
}

export class MatchReader {
    matches: MatchData[] = [];
    constructor(public reader: DataReader) {}

    load(): void {
        this.reader.read();
        this.matches = this.reader.data.map((row: string[]): MatchData => {
            return [
                dateStringToDate(row[0]),
                row[1],
                row[2],
                parseInt(row[3]),
                parseInt(row[4]),
                row[5] as MatchResult,
                row[6],
            ];
        });
    }
}

// index.ts
import { MatchReader } from './MatchReader';
import { CsvFileReader } from './CsvFileReader';
import { MatchResult } from './MatchResult';

// Create an Object that satisfies the 'DataReader' interface
const csvFileReader = new CsvFileReader('football.csv');
// Create an interface of MatchReader and pass 
// in something satisfying the 'DataReader' interface
const matchReader = new MatchReader(csvFileReader);
matchReader.load();

let manUnitedWins = 0;

for (let match of matchReader.matches) {
    if (match[1] === 'Man United' && match[5] === MatchResult.HomeWin) {
        manUnitedWins++;
    } else if (match[2] === 'Man United' && match[5] === MatchResult.AwayWin) {
        manUnitedWins++;
    }
}

console.log(`Man United won ${manUnitedWins} games`);
```

コードの可読性が上がった


#### Retrospective: Inheritance vs. Composition

どちらが開発中のアプリケーションにとってよりよいのか？

- Inheritane: `is a` relationship:
`is-a`関係とは一方が抽象クラスで他方がそれのサブクラスである

- Composition: `has a` relationship:
一方、もう一つのオブジェクトに属するあるオブジェクトの関係である

inheritanceはclass vehicleに対するclass Carのようなもので
compositionはclass vehicleに対するclass Engineのようなものである

