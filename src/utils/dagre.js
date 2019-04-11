import { graphlib, layout } from 'dagre';

const SIZE = {
  width: 240,
  height: 240
};

export function distributeElements(model) {
  const nodes = distributeGraph(model);

  nodes.forEach(node => {
    const modelNode = model.nodes.find(item => item.id === node.id);

    modelNode.x = node.x - node.width / 2;
    modelNode.y = node.y - node.height / 2;
  });

  return model;
}

function distributeGraph(model) {
  const nodes = mapElements(model);
  const edges = mapEdges(model);
  const graph = new graphlib.Graph();

  graph.setGraph({});
  graph.setDefaultEdgeLabel(() => ({}));
  nodes.forEach(node => {
    graph.setNode(node.id, node.metadata);
  });
  edges.forEach(edge => {
    if (edge.from && edge.to) {
      graph.setEdge(edge.from, edge.to);
    }
  });
  layout(graph);

  return graph.nodes().map(node => graph.node(node));
}

function mapElements(model) {
  return model.nodes.map(node => ({ id: node.id, metadata: { ...SIZE, id: node.id } }));
}

function mapEdges(model) {
  return model.links
    .map(link => ({
      from: link.source,
      to: link.target
    }))
    .filter(item => model.nodes.find(node => node.id === item.from) && model.nodes.find(node => node.id === item.to));
}
