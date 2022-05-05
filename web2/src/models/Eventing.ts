interface UserProps {
    id?: number;
    name?: string;
    age?: number;
}

// 今のところ、引数なし戻り値なしの関数しか受け付けない
type Callback = () => void;

export class Eventing {
    events: { [key: string]: Callback[] } = {};

    on = (eventName: string, callback: Callback): void => {
        const handlers = this.events[eventName] || [];
        handlers.push(callback);
        // 動的な配列の生成
        this.events[eventName] = handlers;
    };

    trigger = (eventName: string): void => {
        const handlers = this.events[eventName];
        if (handlers === undefined || !handlers.length) return;
        handlers.forEach((cb) => {
            cb();
        });
    };
}
