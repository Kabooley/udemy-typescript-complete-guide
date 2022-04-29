import { User } from './models/User';

const user = new User({name: "new record", age: 0});


// Userの各プロパティを介して、各メソッドにアクセスることになる
// 
// 今のところ、get, setでアクセスできるデータはprivateなので
// 以下のようにいちいちgetメソッドを呼び出さないといけない
user.attributes.get('id');
user.attributes.get('name');
user.attributes.get('age');
// リファクタリングする前は...
//  user.save()で済んでいたのに...
user.sync.save();