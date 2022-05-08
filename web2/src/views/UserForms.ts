export class UserForm {
    constructor(public parent: Element) {}

    onButtonClick(): void {
        console.log('button clicked');
    }

    eventsMap(): { [key: string]: () => void } {
        return {
            'click:button': this.onButtonClick,
        };
    }

    bindEvents(fragment: DocumentFragment): void {
        const eventsMap = this.eventsMap();

        for (let eventKey in eventsMap) {
            const [eventName, selector] = eventKey.split(':');

            fragment.querySelectorAll(selector).forEach((element) => {
                element.addEventListener(eventName, eventsMap[eventKey]);
            });
        }
    }

    template(): string {
        return `
            <div>
                <h1>User Form</h1>
                <input />
            </div>
        `;
    }

    render(): void {
        const templateElement = document.createElement('template');
        templateElement.innerHTML = this.template();

        // NOTE: ここでイベントハンドラを設置する
        this.bindEvents(templateElement.content);

        // `content`はDocumentFragment`型と呼ばれる標準の型である
        // これは参照を返すそうな...
        this.parent.append(templateElement.content);
    }
}
