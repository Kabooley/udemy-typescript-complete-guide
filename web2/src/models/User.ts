import { Eventing } from './Eventing';
import { Sync } from './Sync';

export interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

// 今のところ、引数なし戻り値なしの関数しか受け付けない
type Callback = () => void;

const rootUrl: string = "http://localhost:3000/users";

export class User {
    // events: { [key: string]: Callback[] } = {};
    public events: Eventing = new Eventing();
    public sync: Sync<UserProps> = new Sync<UserProps>(rootUrl);
    constructor(private data: UserProps) {}
}
