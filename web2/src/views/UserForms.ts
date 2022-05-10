import { User } from '../models/User';

export class UserForm {
    constructor(public parent: Element, public model: User) {
        this.bindModel();
    }

    bindModel(): void {
        this.model.on('change', () => {
            this.render();
        });
    }

    onSetAgeClick = (): void => {
        this.model.setRandomAge();
    };

    onSetNameClick = (): void => {
        // 一旦親要素から取得する
        const input: HTMLInputElement = this.parent.querySelector('input');
        const name: string = input.value;
        this.model.set({ name });
    };

    eventsMap(): { [key: string]: () => void } {
        return {
            'click:.set-age': this.onSetAgeClick,
            'click:.change-name': this.onSetNameClick,
        };
    }

    bindEvents(fragment: DocumentFragment): void {
        const eventsMap = this.eventsMap();

        for (let eventKey in eventsMap) {
            const [eventName, selector] = eventKey.split(':');

            // fragment DOMに対してqsaする
            fragment.querySelectorAll(selector).forEach((element) => {
                element.addEventListener(eventName, eventsMap[eventKey]);
            });
        }
    }

    template(): string {
        return `
            <div>
                <h1>User Form</h1>
                <div>User name: ${this.model.get('name')}</div>
                <div>User age: ${this.model.get('age')}</div>
                <input />
                <button class="change-name">Change name</button>
                <button class="set-age">set random age</button>
            </div>
        `;
    }

    render(): void {
        this.parent.innerHTML = '';

        const templateElement = document.createElement('template');
        templateElement.innerHTML = this.template();

        // NOTE: ここでイベントハンドラを設置する
        this.bindEvents(templateElement.content);

        // `content`はDocumentFragment`型と呼ばれる標準の型である
        // これは参照を返すそうな...
        this.parent.append(templateElement.content);
    }
}
