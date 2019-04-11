import { distributeElements } from '../utils/dagre';
import React from 'react';
import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  LinkModel,
  DefaultPortModel,
  DiagramWidget,
  DefaultLinkModel
} from 'storm-react-diagrams';
import 'storm-react-diagrams/dist/style.min.css';
import { useStyle } from 'styled-hooks';
import { useContext } from '../state';
import { getContentText } from '../content';

export default function Debugger() {
  const { state } = useContext();
  const className = useStyle`
    display: flex;
    height: 100vh;
  `;

  const engine = new DiagramEngine();

  engine.installDefaultFactories();

  const model = new DiagramModel();
  const nodes = {};
  const links = [];

  state.graph.nodes.forEach(node => {
    nodes[node.id] = new DefaultNodeModel(
      node.contents.map(content => `${getContentText(content).slice(0, 20)}…`).join(' '),
      '#999'
    );
  });

  state.graph.edges.forEach((edge, index) => {
    const fromNode = nodes[edge.from];
    const toNode = nodes[edge.to];
    const edgeNodeId = `edge_${edge.to}`;
    let edgeNode = nodes[edgeNodeId];

    if (!edgeNode) {
      edgeNode = new DefaultNodeModel(getContentText(edge.content), '#66C');
      nodes[edgeNodeId] = edgeNode;
    }

    if (fromNode) {
      const fromNodeOut = fromNode.addOutPort(' ');
      const edgeNodeIn = edgeNode.addInPort(' ');

      links.push(fromNodeOut.link(edgeNodeIn));
    }

    if (toNode) {
      const edgeNodeOut = edgeNode.addOutPort(' ');
      const toNodeIn = toNode.addInPort(' ');

      links.push(edgeNodeOut.link(toNodeIn));
    }
  });

  Object.keys(nodes).forEach(key => model.addNode(nodes[key]));
  links.forEach(link => model.addLink(link));

  const serialized = model.serializeDiagram();
  const distributedSerializedDiagram = distributeElements(serialized);
  const deSerializedModel = new DiagramModel();

  deSerializedModel.deSerializeDiagram(distributedSerializedDiagram, engine);
  engine.setDiagramModel(deSerializedModel);

  return (
    <div className={className}>
      <DiagramWidget diagramEngine={engine} />
    </div>
  );
}
