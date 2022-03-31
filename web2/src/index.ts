import { User } from './models/User';

const user = new User({ id: 1 });

user.set({ name: 'Tatsuta', age: 16 });
user.save();
