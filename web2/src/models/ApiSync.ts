import axios, { AxiosPromise } from "axios";

interface HasId {
  id?: number;
}

export class ApiSync<T extends HasId> {
  constructor(public rootUrl: string) {}
  fetch = (id: number): AxiosPromise => {
    return axios.get(`${this.rootUrl}/${id}`);
  };

  save = (data: T): AxiosPromise => {
    const { id } = data;

    if (id) {
      // putで既存ユーザを更新する
      return axios.put(`${this.rootUrl}/${id}`, data);
    } else {
      // そうでないならpostで保存する
      return axios.post(this.rootUrl, data);
    }
  };
}
