import alternatingCaseToObject from '@abcnews/alternating-case-to-object';
import { name } from '../../package';
import { IS_DEBUG } from '../constants';
import { parseContent, preloadEmoji } from '../content';

const SP = ' ';
const NBSP = String.fromCharCode(160);
const NEXT_PROPS = ['then', 'and', 'or'];
const TO_PROPS = ['to', 'then', 'and', 'or'];
const FROM_PROPS = ['from', 'and', 'or'];
const URL_CMID_PATTERN = /\/([0-9]+)(\/|([\?\#].*)?$|-[0-9]+x[0-9]+-)/;

function validateExperimentalGraph(graph) {
  // Log the graph
  console.debug(graph);

  const { nodes, edges } = graph;

  // Ensure every node (except the start node) has at least one prompt
  nodes.forEach(({ id }) => {
    if (!edges.find(edge => edge.to === id && edge.content)) {
      throw new Error(`"${id}" must have at least one prompt`);
    }
  });

  // Ensure every node has at least one note
  nodes.forEach(({ id, contents }) => {
    if (contents.length === 0) {
      throw new Error(`"${id}" must have at least one note`);
    }
  });

  // Ensure every node referenced by an edge exists
  edges.forEach(({ from, to }) => {
    [to].splice(0, 0, from).forEach(id => {
      if (!nodes.find(node => node.id === id)) {
        throw new Error(`"${id}" is referenced by an edge, but does not exist`);
      }
    });
  });

  // Ensure there are no infinite loops
  edges.forEach(({ from, to }) => {
    if (from === to) {
      throw new Error(`"${id}" creates an infinite loop`);
    }
  });

  // Warn about unreachable nodes
  nodes.forEach(({ id }) => {
    if (!edges.find(edge => edge.to === id)) {
      console.warn(`"${id}" is unreachable`);
    }
  });

  // Warn about dead-end nodes
  nodes.forEach(({ id }) => {
    if (!edges.find(edge => edge.from === id && edge.to == null)) {
      console.warn(`"${id}" is unreachable`);
    }
  });
}

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

function getPropsIds(propNames, stringProps) {
  return propNames.reduce((memo, prop) => {
    const value = stringProps[prop];

    if (stringProps[prop]) {
      return memo.concat(Array.isArray(value) ? value : [value]);
    }

    return memo;
  }, []);
}

function createExperimentalGraph(markup) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, 'text/html');
  const sections = [];
  let currentSection = [];
  const nodes = [];
  const edges = [];

  Array.from(doc.body.children).forEach(el => {
    if (el.tagName === 'A' && el.hasAttribute('name')) {
      const [, id, propsString] = el.getAttribute('name').match(/([a-z][a-z0-9]*)([A-Z].*)?/) || [];

      if (!id) {
        return;
      }

      if (nodes.find(node => node.id === id)) {
        const err = new Error(`"${id}" is already defined`);
        alert(`[${name}] ${err.message}`);
        throw err;
      }

      currentSection = {
        id,
        notes: [],
        prompts: []
      };
      sections.push(currentSection);

      const stringProps = alternatingCaseToObject(propsString || '');

      currentSection.toIds = getPropsIds(TO_PROPS, stringProps);
      currentSection.fromIds = currentSection.toIds.length ? [] : getPropsIds(FROM_PROPS, stringProps);

      return;
    }

    if (!currentSection || (el.children.length === 0 && String(el.textContent).trim().length === 0)) {
      return;
    }

    if (el.tagName.indexOf('H') === 0) {
      const promptSourceEl = document.createElement('p');

      promptSourceEl.textContent = el.textContent;
      currentSection.prompts.push(parseContent(promptSourceEl));
    } else {
      currentSection.notes.push(parseContent(el.cloneNode(true)));
    }
  });

  sections.forEach(({ id, prompts, toIds, fromIds }, index) => {
    if (index === 0 && prompts.length) {
      edges.push({ to: id }); // for intiial prompts
    }

    toIds.forEach(toId => {
      if (!edges.find(edge => edge.from === id && edge.to === toId)) {
        edges.push({ from: id, to: toId });
      }
    });
    fromIds.forEach(fromId => {
      if (!edges.find(edge => edge.from === fromId && edge.to === id)) {
        edges.push({ from: fromId, to: id });
      }
    });
  });

  sections.forEach(({ id, notes, prompts }) => {
    nodes.push({ id, contents: notes });
    prompts.forEach(content => {
      edges
        .filter(edge => edge.to === id)
        .forEach(edge => {
          edge.content = content;
        });
    });
  });

  const graph = {
    nodes,
    edges
  };

  // Preload and cache emoji images
  setTimeout(() => {
    preloadEmoji();
  }, 1000);

  if (IS_DEBUG) {
    console.groupCollapsed(`[${name}] Validate Experimental Graph`);
    try {
      validateExperimentalGraph(graph);
    } catch (err) {
      console.error(err);
      alert(`[${name}] ${err.message}`);
    }
    console.groupEnd();
  }

  return graph;
}

function createGraph(markup) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, 'text/html');
  const graph = {
    nodes: {},
    startId: null
  };
  let currentNode = null;

  Array.from(doc.body.children).forEach(el => {
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

      currentNode.next = getPropsIds(NEXT_PROPS, stringProps);
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

  console.log(createExperimentalGraph(doc.text));

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
  return (renditions.length === 1
    ? renditions
    : renditions.filter(x => (x.ratio ? x.ratio === '3x2' : true) && x.width > 400))[0];
}
