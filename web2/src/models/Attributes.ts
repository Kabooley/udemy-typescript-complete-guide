import { UserProps } from './User';

export class Attributes<T> {
    constructor(private data: T) {}

    set = (update: T): void => {
        console.log(update);
        Object.assign(this.data, update);
    };

    get = <K extends keyof T>(key: K): T[K] => {
        console.log(this);
        return this.data[key];
    };

    getAll = (): T => {
        return this.data;
    };
}

// USAGE
//
// const attrs = new Attributes<UserProps>({ id: 11, name: "DaftPunk", age: 40 });

// // const id = attrs.get('id') as number;
// const id = attrs.get("id");
