// operators/numeric.ts
import { Shape, Func, Op, NOOP } from '../sap';

// we choose to NOOP for now instead of using NaN and Infinity
function protectedDivide(numerator: number, denominator: number): number | NOOP {
    if (denominator === 0) {
        return NOOP
    }
    return numerator / denominator
}

function protectedSqrt(radicand: number): number | NOOP {
    if (radicand < 0) return NOOP
    return Math.sqrt(radicand)
}

// basic math
export const plusOp = (new Op<number>(
    new Func(
        new Shape([1, 1], [1]),
        (inputs: number[][], state: void) => {
            return [[[inputs[0][0] + inputs[1][0]]], state]
        }
    )
)).tag('+');

export const minusOp = (new Op<number>(
    new Func(
        new Shape([1, 1], [1]),
        (inputs: number[][], state: void) => [[[inputs[0][0] - inputs[1][0]]], state],
    )
)).tag('-');

export const timesOp = (new Op<number>(
    new Func(
        new Shape([1, 1], [1]),
        (inputs: number[][], state: void) => [[[inputs[0][0] * inputs[1][0]]], state],
    )
)).tag('*');

export const divideOp = (new Op<number>(
    new Func(
        new Shape([1, 1], [1]),
        (inputs: number[][], state: void) => [[[protectedDivide(inputs[0][0], inputs[1][0])]], state],
    )
)).tag('/');

// advanced math
export const sinOp = (new Op<number>(
    new Func(
        new Shape([1], [1]),
        (inputs: number[][], state: void) => [[[Math.sin(inputs[0][0])]], state],
    )
)).tag('sin');

export const cosOp = (new Op<number>(
    new Func(
        new Shape([1], [1]),
        (inputs: number[][], state: void) => [[[Math.cos(inputs[0][0])]], state],
    )
)).tag('cos');

export const sqrtOp = (new Op<number>(
    new Func(
        new Shape([1], [1]),
        (inputs: number[][], state: void) => [[[protectedSqrt(inputs[0][0])]], state],
    )
)).tag('sqrt');