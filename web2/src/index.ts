import { UserForm } from './views/UserForms';
import { User } from './models/User';

const user = User.buildUser({ name: 'NAME', age: 111 });
const userForm = new UserForm(document.getElementById('root'), user);

userForm.render();
