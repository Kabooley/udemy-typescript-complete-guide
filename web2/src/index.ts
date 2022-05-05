import { User } from './models/User';

const user = new User({ name: 'new record', age: 0 });

user.on('save', () => {
    console.log(user);
});

user.on('error', () => {
    console.log('error');
});

user.save();
