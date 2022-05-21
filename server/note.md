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