import axios, { AxiosResponse } from 'axios';


export class Sync {
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