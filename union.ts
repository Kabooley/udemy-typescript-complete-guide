/*

Unon


いずれかの型を示す
下記ならば Shapeは Squre型かRectangle型どちらかの型になることを示す

なのでいくつかの型を取るかもしれない関数の引数とかに利用すると便利
*/

interface Square {
    kind: 'square';
    size: number;
}
interface Rectangle {
    kind: 'rectangle';
    width: number;
    height: number;
}

type Shape = Square | Rectangle;

// unionを使えばcalcAreaがとりうることができる引数の型がふえる
function calcArea(data: Shape): number {
    if (data.kind === 'square') {
        return data.size;
    } else if (data.kind === 'rectangle') {
        return (data.width * data.height) / 2;
    }
}

// OK
calcArea({ kind: 'square', size: 64 });
calcArea({ kind: 'rectangle', width: 64, height: 10 });
// Error: stringの型をShape型に当てはめることができない
// calcArea("square");
