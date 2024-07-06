// operators/neuronal.ts
import { Shape, Func, Op, Neuron, Star, Operand } from '../sap';
import { outStub, inStub } from './flow';

// get the downstream neurons of all input neurons
export const getDnsOp = (new Op<Neuron>(
    new Func(
        new Shape([Star], [Star]),
        (inputs: Neuron[][], state: void) => [[inputs[0].flatMap(neuron => neuron.dns)], state]
    )
)).tag('getDns')

// get the upstream neurons of all input neurons
export const getUpsOp = (new Op<Neuron>(
    new Func(
        new Shape([Star], [Star]),
        (inputs: Neuron[][], state: void) => [[inputs[0].flatMap(neuron => neuron.ups)], state]
    )
)).tag('getUps')

// remove input neurons from the network, output resulting lists of in and out Stubs
export const delFn = new Func<Neuron>(
    new Shape([Star], [Star, Star]),
    (inputs: Neuron[][], state: void) => {


        const neuronsToDelete = inputs[0]
        const inStubs: Neuron[] = []
        const outStubs: Neuron[] = []

        neuronsToDelete.forEach(neuron => {
            neuron.ups.forEach(upList => {
                upList.forEach(up => {
                    up.dns = up.dns.filter(n => {
                        if (n === neuron) {
                            outStubs.push(new Neuron(outStub))
                            return false 
                        }
                        return true
                    })
                })
            })
            neuron.dns.forEach(dn => {
                dn.ups.map(upList => {
                    upList.filter(n => n !== neuron)
                })
                dn.ups.filter(upList => {
                    if (upList.length === 0) {
                        inStubs.push(new Neuron(inStub))
                        return false
                    }
                    return true
                })
            })
        })

        // remove deleted neurons from ups and dns to account for the case
        // of deleting neighboring neurons
        inStubs.filter(neuron => !neuronsToDelete.includes(neuron))
        outStubs.filter(neuron => !neuronsToDelete.includes(neuron))

        return [[inStubs, outStubs], state]
    }
)   

// given lists of in and out Stubs, repair the network using the Ops in state
// returns the list of new neurons
export const repairFn = new Func<Neuron>(
    new Shape([Star, Star], [Star]),
    (inputs: Neuron[][], state: Op[]) => {
        function removeRandomElements<S>(arr: S[], n: number): S[] {
            const shuffled = arr.sort(() => 0.5 - Math.random())
            return shuffled.slice(0, arr.length - n)
        }
        
        function repairNetwork(
            inStubs: Neuron[],
            outStubs: Neuron[],
        ): Neuron {
            const viableOps = state.filter(op => {
                const enoughUps = op.func.shape.ins.length <= outStubs.length
                const enoughDns = op.func.shape.outs.length <= inStubs.length
                return enoughUps && enoughDns
            })
            var op = viableOps[Math.floor(Math.random()*viableOps.length)]
            const ups = removeRandomElements<Neuron>(outStubs, op.func.shape.ins.length)
            const dns = removeRandomElements<Neuron>(inStubs, op.func.shape.outs.length)
            const newNeuron = new Neuron(
                op,
                ups.map(stub => [stub.ups[0][0]]),
                dns.map(stub => stub.dns[0])
            )
            ups.forEach(stub => stub.ups[0][0].dns.map(neuron => {
                if (neuron === stub) return newNeuron
                return neuron
            }))
            dns.forEach(stub => stub.dns[0].dns.map(neuron => {
                if (neuron === stub) return newNeuron
                return neuron
            }))
            return newNeuron
        }

        const inStubs = inputs[0]
        const outStubs = inputs[1]

        const subs = []
        while (inStubs.length > 0 && outStubs.length > 0) {
            subs.push(repairNetwork(inStubs, outStubs))
        }
        
        return [[subs], state]
    }
)

// TODO use Stubs on shape mismatch
export const replace = new Func<Neuron>(
    new Shape([Star], [Star]),
    (inputs: Neuron[][], state: Op) => {
        return [[inputs[0].map(neuron => new Neuron(state, neuron.ups, neuron.dns))], state]
    }
)

// TODO how to capture mapping inputs to single input
// TODO fix unusual circular JSON error
// TODO build, test, and export reusable networks supporting basic evo algs

