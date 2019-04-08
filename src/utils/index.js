import alternatingCaseToObject from '@abcnews/alternating-case-to-object';
import { name } from '../../package';
import { IS_DEBUG } from '../constants';
import { parseContent, preloadEmoji } from '../content';

const SP = ' ';
const NBSP = String.fromCharCode(160);
const NEXT_PROPS = ['then', 'and', 'or'];
const URL_CMID_PATTERN = /\/([0-9]+)(\/|([\?\#].*)?$|-[0-9]+x[0-9]+-)/;

function validateGraph(graph) {
  const nodeIds = Object.keys(graph.nodes);
  const nodesList = nodeIds.map(id => graph.nodes[id]);

  // Log the graph
  console.debug(graph);

  // Ensure every node (except the start node) has at least one prompt
  nodesList.forEach(({ id, prompts }) => {
    if (id !== graph.startId && prompts.length === 0) {
      throw new Error(`"${id}" must have at least one prompt`);
    }
  });

  // Ensure every node has at least one note
  nodesList.forEach(({ id, notes }) => {
    if (notes.length === 0) {
      throw new Error(`"${id}" must have at least one note`);
    }
  });

  // Ensure every node referenced by another node exists
  nodesList.forEach(({ id, next }) => {
    next.forEach(nextId => {
      if (!graph.nodes[nextId]) {
        throw new Error(`"${id}" references "${nextId}", which does not exist`);
      }
    });
  });

  // Ensure there are no infinite loops
  nodesList.forEach(({ id, next }) => {
    if (next.indexOf(id) > -1) {
      throw new Error(`"${id}" creates an infinite loop`);
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
      console.warn(`"${id}" is unreachable`);
    }
  });

  // Warn about dead-end nodes
  nodesList.forEach(({ id, next }) => {
    if (next.length === 0) {
      console.warn(`"${id}" is a dead-end`);
    }
  });
}

function createGraph(markup) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, 'text/html');
  const graph = {
    nodes: {},
    startId: null
  };
  let currentNode = null;

  [...doc.body.children].forEach(el => {
    if (el.tagName === 'A' && el.hasAttribute('name')) {
      const [, id, propsString] = el.getAttribute('name').match(/([a-z][a-z0-9]*)([A-Z].*)?/) || [];

      if (!id) {
        return;
      }

      if (graph.nodes[id]) {
        const err = new Error(`"${id}" is already defined`);
        alert(`[${name}] ${err.message}`);
        throw err;
      }

      currentNode = {
        id,
        notes: [],
        prompts: []
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

    if (!currentNode || (el.children.length === 0 && String(el.textContent).trim().length === 0)) {
      return;
    }

    if (el.tagName.indexOf('H') === 0) {
      const promptSourceEl = document.createElement('p');

      promptSourceEl.textContent = el.textContent;
      currentNode.prompts.push(parseContent(promptSourceEl));
    } else {
      currentNode.notes.push(parseContent(el.cloneNode(true)));
    }
  });

  // Preload and cache emoji images
  setTimeout(() => {
    preloadEmoji();
  }, 1000);

  if (IS_DEBUG) {
    console.groupCollapsed(`[${name}] Validate Graph`);
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

export function articleDocumentToAppProps(doc) {
  if (!doc.text) {
    throw new Error(`Document has no text`);
  }

  const id = doc.id;
  const title = doc.title;
  const author = (doc.bylinePlain || '').trim();
  const cta = (x => (x.indexOf('#') === 0 ? null : x.trim()))(doc.teaserTextPlain || '');
  const titleContentSourceEl = document.createElement('p');
  const authorContentSourceEl = document.createElement('p');

  titleContentSourceEl.textContent = title;
  authorContentSourceEl.textContent = author;

  return {
    id,
    title,
    author,
    cta,
    titleContentId: parseContent(titleContentSourceEl),
    authorContentId: parseContent(authorContentSourceEl),
    graph: createGraph(doc.text)
  };
}

export function widont(text) {
  const words = text.split(SP);
  const lastTwoWordsText = words.slice(-2).join(SP);

  return `${words.slice(0, -2).join(SP)} ${lastTwoWordsText.replace(' ', lastTwoWordsText.length > 15 ? SP : NBSP)}`;
}

export function urlToCMID(url) {
  return (url.match(URL_CMID_PATTERN) || [])[1];
}

export function pickRendition(renditions) {
  return (renditions.length === 1 ? renditions : renditions.filter(x => x.ratio === '3x2' && x.width > 300))[0];
}
