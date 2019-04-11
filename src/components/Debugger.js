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
      node.contents.map(content => `${getContentText(content).slice(0, 20)}…`).join(' ')
    );
  });

  state.graph.edges.forEach(edge => {
    const nodeFrom = nodes[edge.from];
    const graphNodeFrom = state.graph.nodes.find(node => node.id === edge.from);

    if (!nodeFrom) {
      return;
    }

    const nodeTo = nodes[edge.to];
    const portOut = nodeFrom.addOutPort(' ');
    const portTo = nodeTo.addInPort(' ');
    const link = portOut.link(portTo);

    link.addLabel(getContentText(edge.content));
    links.push(link);
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
