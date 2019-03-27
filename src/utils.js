import alternatingCaseToObject from '@abcnews/alternating-case-to-object';

const NEXT_PROPS = ['then', 'and', 'or'];

function parseMessage(node) {
  return node.innerHTML;
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
      const [, id, propsString] = el.getAttribute('name').match(/([a-z]+)([A-Z].*)/) || [];

      if (!id) {
        return;
      }

      currentNode = {
        id,
        messages: []
      };

      const stringProps = alternatingCaseToObject(propsString);

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
        currentNode.action = null;
      }

      return;
    }

    if (!currentNode || String(el.textContent).trim().length === 0) {
      return;
    }

    if (typeof currentNode.action === 'undefined') {
      currentNode.action = el.textContent;
    } else {
      currentNode.messages.push(parseMessage(el));
    }
  });

  return graph;
}
