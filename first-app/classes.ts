class Vehicle {
    constructor(public color: string, private carType: string) {
        this.color = color;
        this.carType = carType;
    }
    protected honk(): void {
        console.log('honkhonk');
    }
}

const vehicle = new Vehicle('red', 'sedan');
console.log(vehicle.color, vehicle.carType);

class Car extends Vehicle {
    // 基底クラスのpublicメソッドはprivateとしてオーバーライドできない
    private drive(): void {
        console.log('vroom!!');
    }

    drivingProcess(): void {
        this.drive();
        this.honk();
    }
}

const car = new Car();
car.drivingProcess();
// car.honk();
