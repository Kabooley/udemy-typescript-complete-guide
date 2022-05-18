import { View } from './View';
import { User, UserProps } from '../models/User';

export class UserShow extends View<User, UserProps> {

    template(): string {
        return `
        <div>
            <div>User Detail</div>
            <div>Name: ${this.model.get('name')}</div>
            <div>Age: ${this.model.get('age')}</div>
        </div>
        `;
    }
}