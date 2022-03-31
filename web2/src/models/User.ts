import axios, { AxiosResponse } from 'axios';

interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

// 今のところ、引数なし戻り値なしの関数しか受け付けない
type Callback = () => void;

export class User {
    events: { [key: string]: Callback[] } = {};
    constructor(private data: UserProps) {}

    get(propsName: string): number | string {
        return this.data[propsName];
    }

    set(update: UserProps): void {
        console.log(update);
        Object.assign(this.data, update);
    }

    

    fetch(): void {
        console.log('fetching...');
        axios
            .get(`http://localhost:3000/users/${this.get('id')}`)
            .then((response: AxiosResponse): void => {
                this.set(response.data);
            });
    }

    save(): void {
        console.log("saving...");
        // 既存のidを指定していれば、
        if(this.get('id')) {
            // putで既存ユーザを更新する
            axios.put(`http://localhost:3000/users/${this.get('id')}`, this.data);
        }
        else  {
            // そうでないならpostで保存する
            axios.post(`http://localhost:3000/users`, this.data);
        }
    }
}
