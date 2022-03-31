// Function examples --------------------------------------
// annotation
const add = (a: number, b: number): number => {
    return a + b;
};

// Inference 戻り値は推論できる
const substract = (a: number, b: number) => {
    return a - b;
};

// ES5以前
function divide(a: number, b: number): number {
    return a / b;
}

// 値を返さないなら
const logger = (message: string): void => {
    console.log(message);
};

// 例外
const throwError = (message: string): never => {
    throw new Error(message);
};

// Object as a Parameter ----------------------------
const todaysWeather = {
    date: new Date(),
    weather: 'sunny',
};

// Parameter that is Object
// Before ES6
const logWeather = (forecast: { date: Date; weather: string }): void => {
    console.log(forecast.date);
    console.log(forecast.weather);
};

// ES6
const logWeather_ = ({
    date,
    weather,
}: {
    date: Date;
    weather: string;
}): void => {
    console.log(date);
    console.log(weather);
};

logWeather_(todaysWeather);

// Object -----------------------------------------------

// object method
const profile = {
    _name: 'alex', // 'name' is a member of Window Object. Not to reference global object member, '_' is stored.
    age: 20,
    coords: {
        lat: 0,
        lng: 15,
    },
    // ES6
    // obj = {foo() { return 'bar'}}
    setAge(age: number): void {
        this.age = age;
    },
};

// Getting object property
// 一つのプロパティを取得するとき
// const { age }: { age: number } = profile;

// 2つプロパティを取得するとき：
const { _name, age }: { _name: string; age: number } = profile;
console.log(_name);
console.log(age);

// object propertyを取得するとき
const {
    coords: { lat, lng },
}: { coords: { lat: number; lng: number } } = profile;


