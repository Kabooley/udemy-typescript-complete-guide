import { Model } from '../models/Model';

export abstract class View<T extends Model<K>, K> {
    regions: { [key: string]: Element } = {};

    constructor(public parent: Element, public model: T) {
        this.bindModel();
    }

    abstract template(): string;
    // abstract eventsMap(): { [key: string]: () => void };
    // abstract regionsMap(): { [key: string]: string };

    eventsMap(): { [key: string]: () => void } {
        return {};
    }

    regionsMap(): { [key: string]: string } {
        return {};
    }

    bindModel(): void {
        this.model.on('change', () => {
            this.render();
        });
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

    mapRegions(fragment: DocumentFragment): void {
        const regionMap = this.regionsMap();

        for (let key in regionMap) {
            const selector = this.regionsMap[key];
            const element = fragment.querySelector(selector);
            if (element) {
                this.regions[key] = element;
            }
        }
    }

    // ネスト表示させたいインスタンスのrender()メソッドをここで呼出す
    onRender(): void {}

    render(): void {
        console.log(parent);
        this.parent.innerHTML = '';

        const templateElement = document.createElement('template');
        templateElement.innerHTML = this.template();

        this.bindEvents(templateElement.content);
        this.mapRegions(templateElement.content);

        this.onRender();

        this.parent.append(templateElement.content);
    }
}
