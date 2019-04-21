import alternatingCaseToObject from '@abcnews/alternating-case-to-object';
import { name } from '../../package';
import { IS_DEBUG } from '../constants';
import { listContent, parseContent, preloadEmoji } from '../content';

const SP = ' ';
const NBSP = String.fromCharCode(160);
const THEN_PROPS = ['then', 'and', 'or'];
const URL_CMID_PATTERN = /\/([0-9]+)(\/|([\?\#].*)?$|-[0-9]+x[0-9]+-)/;

function validateGraph(graph) {
  // Log the graph
  console.debug(graph);

  const { nodes, edges } = graph;

  // Ensure every node (except the start node) has at least one prompt
  nodes.forEach(({ id }, index) => {
    if (index > 0 && !edges.find(edge => edge.to === id && edge.content)) {
      throw new Error(`"${id}" must have at least one prompt`);
    }
  });

  // Ensure every node has at least one note
  nodes.forEach(({ id, contents }) => {
    if (contents.length === 0) {
      throw new Error(`"${id}" must have at least one note`);
    }
  });

  // Ensure every node referenced by an edge exists (except any edge that
  // points to the entry node, which won't have a `from` property)
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
  nodes.forEach(({ id }, index) => {
    if (index > 0 && !edges.find(edge => edge.to === id && edge.from != null)) {
      console.warn(`"${id}" is unreachable`);
    }
  });

  // Warn about dead-end nodes
  nodes.forEach(({ id }) => {
    if (!edges.find(edge => edge.from === id)) {
      console.warn(`"${id}" is a dead end`);
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

function createGraph(markup) {
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
        prompts: [],
        thenIds: getPropsIds(THEN_PROPS, alternatingCaseToObject(propsString || ''))
      };

      return sections.push(currentSection);
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

  sections.forEach(({ id, notes, prompts, thenIds }, index) => {
    nodes.push({ id, contents: notes });

    if (index === 0 && prompts.length > 0) {
      edges.push({ to: id, content: prompts[0] });
    }

    thenIds.forEach(thenId => {
      const thenSection = sections.find(section => section.id === thenId);

      if (!thenSection) {
        // This will be caught by the validator
        return edges.push({ from: id, to: thenId, content: null });
      }

      thenSection.prompts.forEach(prompt => {
        if (!edges.find(edge => edge.from === id && edge.to === thenId && edge.content === prompt)) {
          edges.push({ from: id, to: thenId, content: prompt });
        }
      });
    });
  });

  return {
    nodes,
    edges
  };
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
  const titleContentId = parseContent(((titleContentSourceEl.textContent = title), titleContentSourceEl));
  const graph = createGraph(doc.text);

  if (IS_DEBUG) {
    console.groupCollapsed(`[${name}] Graph`);
    try {
      validateGraph(graph);
    } catch (err) {
      console.error(err);
      alert(`[${name}] ${err.message}`);
    }
    console.groupEnd();
    console.groupCollapsed(`[${name}] Content`);
    console.debug(listContent());
    console.groupEnd();
  }

  // Preload and cache emoji images
  setTimeout(() => {
    preloadEmoji();
  }, 1000);

  return {
    id,
    title,
    author,
    cta,
    titleContentId,
    graph
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
