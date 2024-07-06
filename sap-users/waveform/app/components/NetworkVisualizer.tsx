import React, { useEffect, useRef } from "react";
import { Network, Node, Edge, DataSet } from "vis-network";
import { Neuron } from "../../../../sap/src/sap";

interface NetworkVisualizerProps {
  rootNeuron: Neuron<any>;
}

const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({
  rootNeuron,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    function addNeuronToGraph(
      neuron: Neuron<any>,
      parentId: string | null = null
    ) {
      const id =
        neuron.op.constructor.name + Math.random().toString(36).substr(2, 9);
      nodes.push({ id, label: neuron.op.label });

      if (parentId) {
        edges.push({ from: parentId, to: id });
      }

      neuron.dns.forEach((downstreamNeuron) => {
        addNeuronToGraph(downstreamNeuron, id);
      });
    }

    addNeuronToGraph(rootNeuron);

    const data = {
      nodes,
      edges,
    };

    const options = {
      layout: {
        hierarchical: {
          direction: "UD",
          sortMethod: "directed",
        },
      },
      edges: {
        arrows: "to",
      },
    };

    new Network(containerRef.current, data, options);
  }, [rootNeuron]);

  return <div ref={containerRef} style={{ height: "600px", width: "100%" }} />;
};

export default NetworkVisualizer;
