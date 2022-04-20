import { Eventing } from './Eventing';

interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

// 今のところ、引数なし戻り値なしの関数しか受け付けない
type Callback = () => void;

export class User {
    // events: { [key: string]: Callback[] } = {};
    public events: Eventing = new Eventing();
    constructor(private data: UserProps) {}

    get(propsName: string): number | string {
        return this.data[propsName];
    }

    set(update: UserProps): void {
        console.log(update);
        Object.assign(this.data, update);
    }

    


}
