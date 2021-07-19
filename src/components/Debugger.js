import { parse } from 'flowchart.js';
import React, { useEffect, useRef } from 'react';
import { useStyle } from 'styled-hooks';
import pkg from '../../package';
import { useContext } from '../state';
import { getContentText } from '../content';

const { name } = pkg;

const DIAGRAM_CONFIG = {
  'arrow-end': 'block-wide-long',
  'element-color': 'transparent',
  'font-family': 'ABCSans',
  'font-size': 11,
  'line-length': 100,
  'line-width': 2,
  flowstate: {
    host: {
      // 'element-color': '#000'
    },
    guest: {
      fill: '#144f66',
      'font-color': '#fff',
      'line-length': 50
    }
  },
  symbols: {
    end: {
      'element-color': 'red'
    }
  }
};
const PARALLEL_DIRECTIONS = ['bottom', 'right', 'top', 'left'];
const RESERVED_TEXT_PATTERN = /=>|->|:>|@>|\|/g;
const MESSAGE_MAX_LENGTH = 30;

function contentIdToLabelText(contentId) {
  return getContentText(contentId).replace(RESERVED_TEXT_PATTERN, '').trim();
}

export default function Debugger() {
  const { state } = useContext();
  const ref = useRef();
  const className = useStyle`
    height: 100vh;
    overflow: auto;

    & > svg {
      margin: 5vmin;
      flex: 0 0 auto;
    }
  `;

  const nodes = {};

  state.graph.nodes.forEach((node, index) => {
    const isEnd = !state.graph.edges.find(edge => edge.from === node.id);

    nodes[node.id] = `${isEnd ? 'end' : 'parallel'}: ${node.contents
      .map(contentId => {
        const text = contentIdToLabelText(contentId);

        return text.slice(0, MESSAGE_MAX_LENGTH) + (text.length > MESSAGE_MAX_LENGTH ? '…' : '');
      })
      .join('\n')}|host`;
  });

  const edges = [];

  if (!state.graph.edges.find(edge => !edge.from)) {
    nodes._ = `start: ${state.title}|guest`;
    edges.push([`_`, `${state.graph.nodes[0].id}`]);
  }

  state.graph.edges.forEach((edge, index) => {
    const { from, to } = edge;
    const edgeNodeId = `_${to}_${content}`;

    if (!nodes[edgeNodeId]) {
      nodes[edgeNodeId] = `${edge.from ? 'operation' : 'start'}: ${
        edge.content ? contentIdToLabelText(edge.content) : state.title
      }|guest`;
      edges.push([edgeNodeId, to]);
    }

    if (from) {
      const existingFromNodes = edges.filter(edge => edge[0].split('(')[0] === from);
      const fromPathIndex = existingFromNodes.length % 4;

      edges.push([
        `${from}(path${fromPathIndex + 1}, ${PARALLEL_DIRECTIONS[fromPathIndex]})`,
        `${edgeNodeId}(${PARALLEL_DIRECTIONS[(fromPathIndex + 2) % 4]})`
      ]);
    }
  });

  const input = `${Object.keys(nodes).reduce((memo, key) => `${memo}\n${key}=>${nodes[key]}`, '')}
${edges.reduce((memo, edge) => `${memo}\n${edge.join('->')}`, '')}`;

  console.groupCollapsed(`[${name}] Diagram`);
  console.debug(nodes);
  console.debug(edges);
  console.debug(input);
  console.groupEnd();

  useEffect(() => {
    const diagram = flowchart.parse(input);

    diagram.drawSVG(ref.current, DIAGRAM_CONFIG);
  }, []);

  return <div ref={ref} className={className} />;
}
