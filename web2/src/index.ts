import { User } from './models/User';

const user = new User({name: "new record", age: 0});


// TypeError: Cannot read properties of undefined (reading 'name')
// console.log(user.get('name'));

const hoge = user.get;
console.log(hoge('name'));