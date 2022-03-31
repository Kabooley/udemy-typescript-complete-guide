// Function examples --------------------------------------
// annotation
var add = function (a, b) {
    return a + b;
};
// Inference 戻り値は推論できる
var substract = function (a, b) {
    return a - b;
};
// ES5以前
function divide(a, b) {
    return a / b;
}
// 値を返さないなら
var logger = function (message) {
    console.log(message);
};
// 例外
var throwError = function (message) {
    throw new Error(message);
};
// Object as a Parameter ----------------------------
var todaysWeather = {
    date: new Date(),
    weather: 'sunny',
};
// Parameter that is Object
// Before ES6
var logWeather = function (forecast) {
    console.log(forecast.date);
    console.log(forecast.weather);
};
// ES6
var logWeather_ = function (_a) {
    var date = _a.date,
        weather = _a.weather;
    console.log(date);
    console.log(weather);
};
logWeather_(todaysWeather);
// Object -----------------------------------------------
// object method
var profile = {
    _name: 'alex',
    age: 20,
    coords: {
        lat: 0,
        lng: 15,
    },
    // ES6
    setAge: function (age) {
        this.age = age;
    },
};
// Getting object property
// 一つのプロパティを取得するとき
// const { age }: { age: number } = profile;
// 2つプロパティを取得するとき：
var _name = profile._name,
    age = profile.age;
// object propertyを取得するとき
var _a = profile.coords,
    lat = _a.lat,
    lng = _a.lng;
// 関数を取得するとき
// const { setAge } : {(age: number): void} = profile;
