import alternatingCaseToObject from '@abcnews/alternating-case-to-object';
import { name } from '../package';

const NEXT_PROPS = ['then', 'and', 'or'];
const IS_DEBUG = String(window.location.host).indexOf('nucwed') > -1;

function parseMessage(node) {
  return node.innerHTML;
}

function validateGraph(graph) {
  const nodeIds = Object.keys(graph.nodes);
  const nodesList = nodeIds.map(id => graph.nodes[id]);

  // Log the graph
  console.debug(graph);

  // Ensure every node (except the start node) has at least one action
  nodesList.forEach(({ id, actions }) => {
    if (id !== graph.startId && actions.length === 0) {
      throw new Error(`Node #${id} must have at least one action`);
    }
  });

  // Ensure every node has at least one message
  nodesList.forEach(({ id, messages }) => {
    if (messages.length === 0) {
      throw new Error(`Node #${id} must have at least one message`);
    }
  });

  // Ensure every node referenced by another node exists
  nodesList.forEach(({ id, next }) => {
    next.forEach(nextId => {
      if (!graph.nodes[nextId]) {
        throw new Error(`Node #${id} references #${nextId}, which does not exist`);
      }
    });
  });

  // Ensure there are no infinite loops
  nodesList.forEach(({ id, next }) => {
    if (next.indexOf(id) > -1) {
      throw new Error(`Node #${id} creates an infinite loop`);
    }
  });

  // Warn about unreachable nodes
  nodesList.forEach(({ id }) => {
    const references = nodesList.reduce((memo, node) => {
      if (node.id !== id && node.next.indexOf(id) > -1) {
        return memo.concat(node.id);
      }

      return memo;
    }, []);

    if (references === 0) {
      console.warn(`Node #${id} unreachable`);
    }
  });

  // Warn about dead-end nodes
  nodesList.forEach(({ id, next }) => {
    if (next.length === 0) {
      console.warn(`Node #${id} is a dead-end`);
    }
  });
}

export function createGraph(markup) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, 'text/html');
  const graph = {
    startId: null,
    nodes: {}
  };
  let currentNode = null;

  [...doc.body.children].forEach(el => {
    if (el.tagName === 'A' && el.hasAttribute('name')) {
      const [, id, propsString] = el.getAttribute('name').match(/([a-z][a-z0-9]*)([A-Z].*)?/) || [];

      if (!id) {
        return;
      }

      if (graph.nodes[id]) {
        const err = new Error(`Node #${id} is already defined`);
        alert(`[${name}] ${err.message}`);
        throw err;
      }

      currentNode = {
        id,
        actions: [],
        messages: []
      };

      const stringProps = alternatingCaseToObject(propsString || '');

      currentNode.next = NEXT_PROPS.reduce((memo, prop) => {
        const value = stringProps[prop];

        if (stringProps[prop]) {
          return memo.concat(Array.isArray(value) ? value : [value]);
        }

        return memo;
      }, []);

      graph.nodes[id] = currentNode;

      if (!graph.startId) {
        graph.startId = id;
      }

      return;
    }

    if (!currentNode || String(el.textContent).trim().length === 0) {
      return;
    }

    if (el.tagName.indexOf('H') === 0) {
      currentNode.actions.push(el.innerHTML);
    } else {
      currentNode.messages.push(parseMessage(el));
    }
  });

  if (IS_DEBUG) {
    console.group(`[${name}] Validate Graph`);
    try {
      validateGraph(graph);
    } catch (err) {
      console.error(err);
      alert(`[${name}] ${err.message}`);
    }
    console.groupEnd();
  }

  return graph;
}
