import axios, { AxiosPromise } from 'axios';
import { UserProps } from './User';

export class Sync {
    constructor(public rootUrl: string) {}
    fetch(id: number): AxiosPromise {
        console.log('fetching...');
        return axios.get(`${this.rootUrl}/${id}`);
    }

    save(data: UserProps): void {
        const { id } = data;
        console.log('saving...');
        // 既存のidを指定していれば、
        if (id) {
            // putで既存ユーザを更新する
            axios.put(`${this.rootUrl}/${id}`, data);
        } else {
            // そうでないならpostで保存する
            axios.post(this.rootUrl, data);
        }
    }
}

// USAGE
// 
// const sync = new Sync('http://localhost:3000/users');
