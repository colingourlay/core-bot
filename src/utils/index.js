import acto from '@abcnews/alternating-case-to-object';
import { getMountValue } from '@abcnews/mount-utils';
import pkg from '../../package';
import { IS_DEBUG } from '../constants';
import { listContent, parseContent, preloadEmoji } from '../content';

const { name } = pkg;

const SP = ' ';
const NBSP = String.fromCharCode(160);
const THEN_PROPS = ['then', 'and', 'or'];
const MARKER_PATTERN = /^#\w+$/;
const MARKER_ID_AND_PROPS_STRING_PATTERN = /([a-z][a-z0-9]*)([A-Z].*)?/;
const URL_CMID_PATTERN = /\/([0-9]+)(\/|([\?\#].*)?$|-[0-9]+x[0-9]+-)/;
const DEFAULT_CONFIG = {
  dialog: 'corner', // or 'middle'
  embed: 'right' // or 'left' or 'full'
};

export function parseConfigFromMount(el) {
  const value = getMountValue(el);
  const [, id] = value.match(/corebot(\d+)?/) || [];
  return {
    ...DEFAULT_CONFIG,
    ...acto(value),
    id
  };
}

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

function isMarker(el) {
  return el.tagName === 'P' && el.textContent.match(MARKER_PATTERN);
}

function createGraph(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sections = [];
  let currentSection = [];
  const nodes = [];
  const edges = [];

  Array.from(doc.body.firstChild.children).forEach(el => {
    if (isMarker(el)) {
      const [, id, propsString] = el.textContent.match(MARKER_ID_AND_PROPS_STRING_PATTERN) || [];

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
        thenIds: getPropsIds(THEN_PROPS, acto(propsString || ''))
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
    } else if (el.innerHTML !== '<br>') {
      // ^^^ CM10 has some sneaky `<p><br></p>`s we want to skip
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

function childAttributes(child) {
  if (!child.parameters) {
    return '';
  }

  return Object.keys(child.parameters).reduce((memo, key) => `${memo} ${key}="${child.parameters[key]}"`, '');
}

// TODO: element attributes
function childToHTML(child) {
  return child.type === 'text'
    ? child.content
    : child.children
    ? `<${child.tagname}${childAttributes(child)}>${child.children.reduce(
        (memo, child) => `${memo}${childToHTML(child)}`,
        ''
      )}</${child.tagname}>`
    : `<${child.tagname}${childAttributes(child)} />`;
}

export function articleDocumentToAppProps(doc) {
  if (!doc.text) {
    throw new Error(`Document has no text`);
  }

  const id = doc.id;
  const title = doc.title;
  const author = doc.byLine ? doc.byLine.plain : '';
  const cta = (x => (x.indexOf('#') === 0 ? null : x.trim()))(doc.synopsis || '');
  const titleContentSourceEl = document.createElement('p');
  const titleContentId = parseContent(((titleContentSourceEl.textContent = title), titleContentSourceEl));
  const graph = createGraph(childToHTML(doc.text.json));

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

  if (words.length < 3) {
    return text;
  }

  const allButLastTwoWords = words.slice(0, -2);
  const [secondLastWord, lastWord] = words.slice(-2);

  return `${allButLastTwoWords.join(SP)} ${[secondLastWord, lastWord].join(lastWord.length > 6 ? SP : NBSP)}`;
}

export function urlToCMID(url) {
  return (url.match(URL_CMID_PATTERN) || [])[1];
}

export function pickRendition(renditions) {
  return (
    renditions.length === 1 ? renditions : renditions.filter(x => (x.ratio ? x.ratio === '3x2' : true) && x.width > 400)
  )[0];
}
