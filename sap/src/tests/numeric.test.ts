// tests/numeric.test.ts
import {
    plusOp,
    minusOp,
    timesOp,
    divideOp,
    sinOp,
    cosOp,
    sqrtOp,
} from '../operators/numeric';
import { NOOP } from '../sap';

describe('Basic Numeric Operations', () => {
    test('plusOp', () => {
        const [result, _] = plusOp.func.fn([[3], [4]], null);
        expect((result as number[][])[0][0]).toBe(7);
    });

    test('minusOp', () => {
        const [result, _] = minusOp.func.fn([[7], [3]], null);
        expect((result as number[][])[0][0]).toBe(4);
    });

    test('timesOp', () => {
        const [result, _] = timesOp.func.fn([[3], [4]], null);
        expect((result as number[][])[0][0]).toBe(12);
    });

    test('divideOp', () => {
        const [result, _] = divideOp.func.fn([[12], [3]], null);
        expect((result as number[][])[0][0]).toBe(4);
    });

    test('sinOp', () => {
        const [result, _] = sinOp.func.fn([[Math.PI / 2]], null);
        expect((result as number[][])[0][0]).toBeCloseTo(1, 5);
    });

    test('cosOp', () => {
        const [result, _] = cosOp.func.fn([[Math.PI]], null);
        expect((result as number[][])[0][0]).toBeCloseTo(-1, 5);
    });

    test('sqrtOp', () => {
        const [result, _] = sqrtOp.func.fn([[9]], null);
        expect((result as number[][])[0][0]).toBe(3);
    });
});

describe('Edge Cases', () => {
    test('divideOp by zero', () => {
        const [result, _] = divideOp.func.fn([[1], [0]], null);
        expect((result as number[][])[0][0]).toBe(NOOP);
    });

    test('sqrtOp of negative number', () => {
        const [result, _] = sqrtOp.func.fn([[-1]], null);
        expect((result as number[][])[0][0]).toBe(NOOP);
    });
});

describe('Operation Shapes', () => {
    test('plusOp shape', () => {
        expect(plusOp.func.shape.ins).toEqual([1, 1]);
        expect(plusOp.func.shape.outs).toEqual([1]);
    });

    test('sinOp shape', () => {
        expect(sinOp.func.shape.ins).toEqual([1]);
        expect(sinOp.func.shape.outs).toEqual([1]);
    });
});