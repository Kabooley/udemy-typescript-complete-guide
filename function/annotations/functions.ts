const add = (a: number, b: number): number => {
  return a + b;
};


// Annotation for anonymous Functions
function divide(a:number, b: number): number {
  return a/b;
}
function multiply(a:number, b: number): number {
  return a*b;
}


// When function returns void
const logger = (message: string): void => {
  console.log(message);
}

const throwError = (message: string) => {
  throw new Error(message);
}