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

  //1) setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  //2) setup the diagram model
  const model = new DiagramModel();
  const nodes = {};
  const links = [];

  state.graph.nodes.forEach(node => {
    // nodes[node.id] = new DefaultNodeModel(`${getContentText(node.contents[0]).slice(0, 20)}…`);
    nodes[node.id] = new DefaultNodeModel(
      node.contents.map(content => `${getContentText(content).slice(0, 20)}…`).join(' '),
      '#999'
    );
  });

  state.graph.edges.forEach((edge, index) => {
    const nodeFrom = nodes[edge.from];
    const nodeTo = nodes[edge.to];
    const node = (nodes[`edge_${index}`] = new DefaultNodeModel(getContentText(edge.content), '#66C'));

    nodes[`edge_${index}`] = node;

    if (nodeFrom) {
      const nodeFromOut = nodeFrom.addOutPort(' ');
      const nodeIn = node.addInPort(' ');

      links.push(nodeFromOut.link(nodeIn));
    }

    if (nodeTo) {
      const nodeOut = node.addOutPort(' ');
      const nodeToIn = nodeTo.addInPort(' ');

      links.push(nodeOut.link(nodeToIn));
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
