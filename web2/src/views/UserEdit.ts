import { View } from './View';
import { User, UserProps } from '../models/User';
import { UserForm } from './UserForms';
import { UserShow } from './UserShow';

export class UserEdit extends View<User, UserProps> {
    regionsMap(): { [key: string]: string } {
        return {
            userShow: '.user-show',
            userForm: '.user-form',
        };
    }

    onRender(): void {
        // regions.~を親要素としてそのもとにtemplateを出力する
        new UserShow(this.regions.userShow, this.model).render();
        new UserForm(this.regions.userForm, this.model).render();
        // 最終的にすべての要素をroot以下に出力する
    }

    template(): string {
        return `
            <div>
                <div class="user-show"></div>
                <div class="user-form"></div>
            </div>
        `;
    }
}
