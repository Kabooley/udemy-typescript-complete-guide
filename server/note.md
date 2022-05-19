# Note: Section 14: Express + TypeScript iIntegration

講義ノート

## 219: Why TypeScript doesn't work well with Express ?

1. ExpressはMiddlewareでプロパティを追加、変更、削除をすることができる

2. 型定義ファイルを使っているということ


下記の通り、bodyParserをコメントアウトすると、

Middlewareが意味をなさなくなるから、

本来、

`req`に`body`があることは不明であるはずであるが

`res`に型付け`Request`がついているから

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

