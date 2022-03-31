// 継承方法: .call() ----------------------------------

// 継承元コンストラクタ関数
function Person(first, last, age, gender, interests) {
    this.name = {
        first,
        last,
    };
    this.age = age;
    this.gender = gender;
    this.interests = interests;
}

Person.prototype.greeting = function () {
    console.log("Hi! I'm " + this.name.first + '.');
};

// Personを継承するコンストラクタ関数
function Teacher(first, last, age, gender, interests, subject) {
    // Personの内容をTeacherのメンバとしてコピーしたのと同じ
    Person.call(this, first, last, age, gender, interests);

    this.subject = subject;
}

// PersonオブジェクトのthisをTeacherにすることで
// TeacherはPersonのメンバを自分のものにできる
// ただし
// これはprototypeを継承しているのではなくて...
// 次と同じことであり
// メンバが増えただけでprototypeは継承していない
function Teacher(first, last, age, gender, interests, subject) {
    this.name = {
        first,
        last,
    };
    this.age = age;
    this.gender = gender;
    this.interests = interests;
    this.subject = subject;
}

// 下記の通り
// Teacherは現時点でprototypeを持っていないことがわかる
// つまり.call()してもプロトタイプベースの継承が行われないのである

var Lisalisa = new Teacher(
    'Lisalisa',
    'Jorstar',
    60,
    'female',
    'wave',
    'struggle'
);

console.log(Lisalisa.__proto__); // {}
console.log(Lisalisa.prototype); // undefined
console.log(Object.getOwnPropertyNames(Person.prototype)); // ['constructor', 'greeting']
console.log(Object.getOwnPropertyNames(Teacher.prototype)); // ['constructor']

// まとめ
// Person.call()はただ呼び出し元にPersonのメンバを追加するだけで
// プロトタイプチェーンが
// Teacher ----> Person ----> Object ----> nullとなるのではなく
// Teacher ----> Object ----> nullのままである

// 厳密に継承するには -----------------------------------
//
// Object.create()は既存のオブジェクトを、新しく生成されるオブジェクトのプロトタイプとして使用して新しいオブジェクトを生成する
Teacher.prototype = Object.create(Person.prototype);

// この時点では
console.log(Teacher);
console.log(Object.getOwnPropertyNames(Teacher.prototype)); // []
console.log(Teacher.prototype.constructor);     // Person
console.log(Lisalisa.__proto__); // {}
console.log(Lisalisa.prototype); // undefined

//
Object.defineProperty(Teacher.prototype, 'constructor', {
    value: Teacher,
    enumerable: false,
    writable: true,
});
