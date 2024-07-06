// operators/flow.ts
import { Func, Shape, Op, Star, NOOP, Operand } from '../sap';

// exitpoint of the network. Uses state as a callback
export const exitFn = new Func(
    new Shape([1], [0]),
    (inputs: any[][], state: (result: any[]) => void) => {
        state(inputs[0])
        return [[], state]
    }
)

// given a list of neurons, filter them
export const filterFn = new Func(
    new Shape([Star], [Star]),
    (inputs: any[][], state: (n: any) => boolean) => [[inputs[0].filter(state)], state],
)

export const identityOp = (new Op(
    new Func(
        new Shape([1], [1]),
        (inputs: Operand[][], state: void) => [inputs, state]
    )
)).tag('Id')

export function createSplitNOp<T extends Operand = any>(n: number): Op<T> {
    return new Op<T>(
        new Func(
            new Shape([n], Array(n).fill(1)),
            (inputs: T[][], state: number) => {
                return [inputs[0].map(input => [input]), state]
            }
        ),
        n,
        `split${n}`
    );
}

export function createDuplicateNOp<T extends Operand = any>(n: number): Op<T> {
    return new Op<T>(
        new Func(
            new Shape([1], Array(n).fill(1)),
            (inputs: T[][], state: number) => [Array(n).fill(inputs[0]), state],
        ),
        n,
        `dup${n}`
    )
}

// placeholder Op for an input
export const inStub = (new Op(
    new Func(
        new Shape([0], [1]),
        (inputs: any[][], state: void) => [[NOOP], state]
    )
)).tag('_')

// placeholder Op for an output
export const outStub = (new Op(
    new Func(
        new Shape([1], [0]),
        (inputs: any[][], state: void) => [[], state]
    )
)).tag('_')

// entrypoint to the network
export const enterOp = (new Op(
    new Func(
        new Shape([0], [1]),
        (inputs: any[][], state: void) => {
            return [inputs, state]
        }
    )
).tag('enter'))

export const haltOnEmptyOp = (new Op(
    new Func(
        new Shape([Star], [Star]),
        (inputs: any[][], state: void) => [[inputs[0].length === 0 ? NOOP : inputs[0]], state]
    )
)).tag('haltEmpty')

export const accumulatorOp = new Op(
    new Func(
        new Shape([Star], [Star]),
        (inputs: any[][], state: Set<any>) => {
            if (inputs[0].length === 0) {
                const result = [...state];
                return [[result], []];
            } else {
                inputs[0].forEach((neuron) => state.add(neuron))
                return [[NOOP], state];
            }
        }
    ),
    new Set(),
    'acc',
)