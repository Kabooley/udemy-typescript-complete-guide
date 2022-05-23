class Boat {
    color: string = "red";

    @testDecorator
    get formattedColor(): string {
        return `This boat color is ${this.color}`;
    }

    pilot(): void {
        console.log('swish');
    }
}

function testDecorator(target: any, key: string): void {
    console.log('Target:', target);
    console.log('Key:', key);
}