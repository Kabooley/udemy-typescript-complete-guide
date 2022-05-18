import { UserEdit } from './views/UserEdit';
import { User } from './models/User';

const user = User.buildUser({ name: 'NAME', age: 111 });
const root: HTMLElement = document.getElementById('root');
if (root) {
    const userEdit = new UserEdit(root, user);

    userEdit.render();
    console.log(userEdit);
} else {
    throw new Error('Root element cannot be found');
}
