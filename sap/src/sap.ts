// sap.ts

export class Star {}

export class NOOP {}

export type Operand = number | Neuron

// a list of input vectors, and a list of output vectors
// the Star type represents variable-length
export class Shape {
    constructor(
        public ins: (number | Star)[],
        public outs: (number | Star)[]
    ) {}
}

// A function tagged with its associated shape
export class Func<T extends Operand = any> {
    constructor(
        public shape: Shape,
        public fn: (inputs: T[][], state: any) => [(T[] | NOOP)[], any]
    ) {}
}

// a template for building a Neuron
export class Op<T extends Operand = any> {
    constructor(
        public func: Func<T>,
        public initState: any = null,
        public label: string = 'Op',
    ) {}
    tag(label: string): Op<T> {
        const newOp = { ...this }
        newOp.label = label
        return newOp
    }
}

// Neurons receive and store inputs until they have received them all,
// at which point they call their operation and broadcast output
export class Neuron<T extends Operand = any> {
    protected ins: T[][] = []
    protected received: number = 0
    protected state: any = []

    constructor(
        public op: Op<T>,
        public ups: Neuron<T>[][] = [],
        public dns: Neuron<T>[] = []
    ) {
        this.reset()
    }

    input(value: T[], source: Neuron<T> | void): void {
        var channel
        // source will only be void when the network is initially called
        if (source) {
            channel = this.ins.findIndex((input, index) => {
                if (input.length !== 0) return false
                const up = this.ups[index]
                return up.includes(source)
            })
        } else {
            channel = 0
        }
        this.ins[channel] = value
        this.received++
        if (this.received >= this.op.func.shape.ins.length) {
            this.process()
        }
    }

    protected process(): void {
        const [outputs, newState] = this.op.func.fn(this.ins, this.state)
        this.state = newState
        this.reset()
        this.dns.forEach((neuron, index) => {
            if (outputs[index] === NOOP) return
            neuron.input(outputs[index] as T[], this)
        })
    }

    protected reset(): void {
        this.ins = new Array(this.op.func.shape.ins.length).fill(null).map(() => [])
        this.received = 0
        this.state = this.op.initState
    }
}