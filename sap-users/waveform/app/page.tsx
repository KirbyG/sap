"use client";
import React from "react";
import { Neuron } from "../../../sap/src/sap";
import {
  plusOp,
  timesOp,
  minusOp,
  divideOp,
  sinOp,
  cosOp,
  sqrtOp,
} from "../../../sap/src/operators/numeric";
import { createExitOp, createEntryOp } from "../../../sap/src/operators/flow";

import NetworkVisualizer from "./components/NetworkVisualizer";

const Home: React.FC = () => {
  // Build a simple network: sin(x * 2) + 1
  const x = createEntryOp<number>();
  const one = createEntryOp<number>();

  const entryX = new Neuron(x);
  const entry1a = new Neuron(one);
  const entry1b = new Neuron(one);
  const entry1c = new Neuron(one);
  const constant2 = new Neuron(plusOp);
  const multiply = new Neuron(timesOp);
  const sin = new Neuron(sinOp);
  const add = new Neuron(plusOp);
  const exit = new Neuron(
    createExitOp<number>((result) => console.log(result))
  );

  entryX.dns = [multiply];
  entry1a.dns = [constant2];
  entry1b.dns = [constant2];
  constant2.ups = [[entry1a], [entry1b]];
  constant2.dns = [multiply];
  multiply.ups = [[entryX], [constant2]];
  multiply.dns = [sin];
  sin.ups = [[multiply]];
  sin.dns = [add];
  entry1c.dns = [add];
  add.ups = [[sin], [entry1c]];
  add.dns = [exit];
  exit.ups = [[add]];

  return (
    <div>
      <h1>Waveform Network Visualizer</h1>
      <NetworkVisualizer rootNeuron={entryX} />
    </div>
  );
};

export default Home;
