// tests/network.test.ts
import { plusOp, timesOp }  from '../operators/numeric';
import {
    exitFn,
    enterOp,
    identityOp,
    createSplitNOp,
    createDuplicateNOp,
    haltOnEmptyOp,
    accumulatorOp
} from '../operators/flow'
import { getDnsOp } from '../operators/neuronal'
import { Shape, Op, Neuron } from '../sap'

describe('Neural Network Operations', () => {

    test('Network with Add operation', () => {
        const outputCallback = jest.fn();

        const enterNeuron = new Neuron<number>(enterOp);
        const splitNeuron = new Neuron<number>(createSplitNOp<number>(2));
        const addNeuron = new Neuron<number>(plusOp);
        const exitNeuron = new Neuron<number>(new Op(exitFn, outputCallback));

        enterNeuron.dns = [splitNeuron];
        splitNeuron.ups = [[enterNeuron]];
        splitNeuron.dns = [addNeuron, addNeuron];
        addNeuron.ups = [[splitNeuron], [splitNeuron]];
        addNeuron.dns = [exitNeuron];
        exitNeuron.ups = [[addNeuron]];

        enterNeuron.input([1, 4]);

        expect(outputCallback).toHaveBeenCalledWith([5]); // 1 + 4 = 5
    });

    test('Network with Add and Multiply operations', () => {
        const outputCallback = jest.fn();
        const split3Op = createSplitNOp<number>(3);
        const entryNeuron = new Neuron<number>(enterOp);
        const splitNeuron = new Neuron<number>(split3Op);
        const addNeuron = new Neuron<number>(plusOp);
        const multNeuron = new Neuron<number>(timesOp);
        const exitNeuron = new Neuron<number>(new Op<number>(exitFn, outputCallback));

        entryNeuron.dns = [splitNeuron];
        splitNeuron.ups = [[entryNeuron]];
        splitNeuron.dns = [addNeuron, addNeuron, multNeuron];
        addNeuron.ups = [[splitNeuron], [splitNeuron]];
        addNeuron.dns = [multNeuron];
        multNeuron.ups = [[addNeuron], [splitNeuron]];
        multNeuron.dns = [exitNeuron];
        exitNeuron.ups = [[multNeuron]];

        entryNeuron.input([2, 3, 4]);

        expect(outputCallback).toHaveBeenCalledWith([20]); // (2 + 3) * 4 = 20
    });

    test('Higher-order network applying identity to Add network', () => {
        const innerOutputCallback = jest.fn();
        const outerOutputCallback = jest.fn();

        // Inner network (Split2)
        const split2Op = createSplitNOp<number>(2);
        const innerEntryNeuron = new Neuron<number>(enterOp);
        const splitNeuron = new Neuron<number>(split2Op);
        const addNeuron = new Neuron<number>(plusOp);
        const innerExitNeuron = new Neuron<number>(new Op<number>(exitFn, innerOutputCallback));

        innerEntryNeuron.dns = [splitNeuron];
        splitNeuron.ups = [[innerEntryNeuron]];
        splitNeuron.dns = [addNeuron, addNeuron];
        addNeuron.ups = [[splitNeuron], [splitNeuron]];
        addNeuron.dns = [innerExitNeuron];
        innerExitNeuron.ups = [[addNeuron]];

        // Outer network (Identity on inner network)

        const outerEntryNeuron = new Neuron<Neuron<number>>(enterOp);
        const identityNeuron = new Neuron<Neuron<number>>(identityOp);
        const outerExitNeuron = new Neuron<Neuron<number>>(new Op(exitFn, outerOutputCallback))

        outerEntryNeuron.dns = [identityNeuron];
        identityNeuron.ups = [[outerEntryNeuron]];
        identityNeuron.dns = [outerExitNeuron];
        outerExitNeuron.ups = [[identityNeuron]];

        // Apply the outer network to the inner network's entry point
        outerEntryNeuron.input([innerEntryNeuron]);

        // Now use the result of the outer network (which should be the original innerEntryNeuron)
        const [resultNeuron] = outerOutputCallback.mock.calls[0][0] as Neuron<number>[];
        expect(resultNeuron).toStrictEqual(innerEntryNeuron);

        // Use the resulting neuron
        resultNeuron.input([1, 4]);

        // Check if the inner network produced the expected result
        expect(innerOutputCallback).toHaveBeenCalledWith([5]); // 1 + 4 = 5
    });
});

describe('Network Traversal', () => {
    // Reusable network setup
    const setupBaseNetwork = () => {
        const split2Op = createSplitNOp<number>(2);
       
        const entryNeuron = new Neuron<number>(enterOp);
        const splitNeuron = new Neuron<number>(split2Op);
        const addNeuron = new Neuron<number>(plusOp);
        const multNeuron = new Neuron<number>(timesOp);
        const exitNeuron = new Neuron<number>(new Op(exitFn, jest.fn()))

        entryNeuron.dns = [splitNeuron];
        splitNeuron.ups = [[entryNeuron]];
        splitNeuron.dns = [addNeuron, multNeuron];
        addNeuron.ups = [[splitNeuron], [splitNeuron]];
        addNeuron.dns = [multNeuron];
        multNeuron.ups = [[addNeuron], [splitNeuron]];
        multNeuron.dns = [exitNeuron];
        exitNeuron.ups = [[multNeuron]];

        return { entryNeuron, splitNeuron, addNeuron, multNeuron, exitNeuron };
    };

    test('Traverse network', () => {
        const { entryNeuron, splitNeuron, addNeuron, multNeuron, exitNeuron } = setupBaseNetwork();

        const traversalOutputCallback = jest.fn();

        // Create traversal network
        const traversalEntryNeuron = new Neuron<Neuron>(enterOp);
        const getDnsNeuron = new Neuron<Neuron>(getDnsOp);
        const duplicateNeuron = new Neuron<Neuron>(createDuplicateNOp<Neuron>(2));
        const blockEmptyNeuron = new Neuron<Neuron>(haltOnEmptyOp)
        const accumulatorNeuron = new Neuron<Neuron>(accumulatorOp);
        const traversalExitNeuron = new Neuron<Neuron>(new Op<Neuron>(exitFn, traversalOutputCallback))

        traversalEntryNeuron.dns = [duplicateNeuron];
        getDnsNeuron.ups = [[traversalEntryNeuron, blockEmptyNeuron]];
        getDnsNeuron.dns = [duplicateNeuron];
        duplicateNeuron.ups = [[traversalEntryNeuron, getDnsNeuron]];
        duplicateNeuron.dns = [accumulatorNeuron, blockEmptyNeuron];
        blockEmptyNeuron.ups = [[duplicateNeuron]]
        blockEmptyNeuron.dns = [getDnsNeuron]
        accumulatorNeuron.ups = [[duplicateNeuron]];
        accumulatorNeuron.dns = [traversalExitNeuron];
        traversalExitNeuron.ups = [[accumulatorNeuron]];

        // Traverse the network
        traversalEntryNeuron.input([entryNeuron]);

        // Check the result
        expect(traversalOutputCallback).toHaveBeenCalledTimes(1);
        const traversedNeurons = traversalOutputCallback.mock.calls[0][0];
        expect(traversedNeurons).toHaveLength(5); // entryNeuron, splitNeuron, addNeuron, multNeuron, exitNeuron
        expect(traversedNeurons).toContain(entryNeuron);
        expect(traversedNeurons).toContain(splitNeuron);
        expect(traversedNeurons).toContain(addNeuron);
        expect(traversedNeurons).toContain(multNeuron);
        expect(traversedNeurons).toContain(exitNeuron);
    });
});