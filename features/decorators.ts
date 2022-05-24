class Boat {
    color: string = 'red';

    @testDecorator
    get formattedColor(): string {
        return `This boat color is ${this.color}`;
    }

    @logError('Boat was sunk')
    pilot(): void {
        throw new Error();
        console.log('swish');
    }
}

function testDecorator(target: any, key: string): void {
    console.log('Target:', target);
    console.log('Key:', key);
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
    }
}

new Boat().pilot();
