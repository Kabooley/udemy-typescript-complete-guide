import { UserForm } from './views/UserForms';
import { User } from './models/User';

const user = User.buildUser({ name: 'NAME', age: 111 });
const root: HTMLElement = document.getElementById('root');
if (root) {
    const userForm = new UserForm(root, user);

    userForm.render();
} else {
    throw new Error('Root element cannot be found');
}
