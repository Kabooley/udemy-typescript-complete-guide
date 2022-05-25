class Boat {
    // @testDecorator
    color: string = 'red';

    get formattedColor(): string {
        return `This boat color is ${this.color}`;
    }

    // @logError('Boat was sunk')
    // Decorator for Parameter
    pilot(
        @parameterDecorator speed: string,
        @parameterDecorator generateWake: boolean
    ): void {
        if (speed === 'fast') {
            console.log('swish');
        } else {
            console.log('nothing');
        }
    }
}

function parameterDecorator(target: any, key: string, index: number): void {
    console.log(key, index);
}

function testDecorator(target: any, key: string): void {
    // If decorators on property,
    // decorator cannot access target value. But only prototype.
    // undefined
    console.log(target[key]);
    // undefined
    console.log(target.color);
}

function logError(errorMessage: string) {
    return function (target: any, key: string, desc: PropertyDescriptor): void {
        const method = desc.value;

        desc.value = function () {
            try {
                method();
            } catch (e) {
                console.log('Boat was sunk');
            }
        };
    };
}
