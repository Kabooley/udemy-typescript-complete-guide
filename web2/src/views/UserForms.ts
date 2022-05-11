import { User, UserProps } from '../models/User';
import { View } from './View';

/**
 * Viewから継承する
 * 
 * User編集画面に特化した内容だけ定義する
 * 
 * Viewとして出力するtemplateもここで定義する
 * */ 
export class UserForm extends View<User, UserProps> {

    eventsMap(): { [key: string]: () => void } {
        return {
            'click:.set-age': this.onSetAgeClick,
            'click:.change-name': this.onSetNameClick,
            'click:.save-model': this.onSaveClick
        };
    }

    onSaveClick = (): void => {
        this.model.save();
    }

    onSetAgeClick = (): void => {
        this.model.setRandomAge();
    };

    onSetNameClick = (): void => {
        const input: HTMLInputElement = this.parent.querySelector('input');
        const name: string = input.value;
        this.model.set({ name });
    };


    template(): string {
        return `
            <div>
                <input placeholder="${this.model.get('name')}"/>
                <button class="change-name">Change name</button>
                <button class="set-age">set random age</button>
                <button class="set-model">Save</button>
            </div>
        `;
    }
}