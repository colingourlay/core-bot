import alternatingCaseToObject from '@abcnews/alternating-case-to-object';
import twemoji from 'twemoji';
import { name } from '../../package';
import { IS_DEBUG } from '../constants';
import smartquotes from './smartquotes';

const SP = ' ';
const NBSP = String.fromCharCode(160);
const NEXT_PROPS = ['then', 'and', 'or'];
// https://reactnativecafe.com/emojis-in-javascript/#Conclusion
const EMOJI_PATTERN = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
const EMOJI_PRESENTATION_PATTERN = /\uFE0F/g;
const BEGINS_WITH_EMOJI_PATTERN = new RegExp(`^${EMOJI_PATTERN.source}`);
const ENDS_WITH_EMOJI_PATTERN = new RegExp(`${EMOJI_PATTERN.source}$`);
const ESCAPED_UNICODE_CHARACTERS_PATTERN = /%u\w+/g;
const EMOJI_IMAGE_URL_PATTERN = /src="([^"]+)"/g;
const TWEMOJI_PARSING_OPTIONS = {
  folder: 'svg',
  ext: '.svg'
};

const emojiImageCache = {};

function parseMessage(node) {
  return node.innerHTML;
}

function replaceEmoji(markup) {
  return twemoji.parse(markup, TWEMOJI_PARSING_OPTIONS);
}

function formatEmoji(markup, emojiUsed) {
  const input = markup;
  const matchedEmoji = input.match(EMOJI_PATTERN);
  const indexOfBeginningEmoji = input.search(BEGINS_WITH_EMOJI_PATTERN);
  const indexOfEndingEmoji = input.search(ENDS_WITH_EMOJI_PATTERN);

  if (matchedEmoji) {
    const escaped = escape(input);
    const remaining = escaped.replace(ESCAPED_UNICODE_CHARACTERS_PATTERN, '');

    if (indexOfBeginningEmoji === 0 && matchedEmoji.length === 1) {
      const first = input.slice(0, matchedEmoji[0].length);
      const last = input.slice(matchedEmoji[0].length);

      markup = `<span class="has-icon-emoji">
        <span class="icon-emoji">${replaceEmoji(first)}</span>
        <span>${last}</span>
      </span>`;
    } else if (indexOfEndingEmoji > -1 && matchedEmoji.length === 1) {
      const first = input.slice(0, indexOfEndingEmoji);
      const last = input.slice(indexOfEndingEmoji);

      markup = `<span class="has-icon-emoji">
        <span>${first}</span>
        <span class="icon-emoji">${replaceEmoji(last)}</span>
      </span>`;
    } else {
      markup = replaceEmoji(input);

      if (remaining.length === 0 && matchedEmoji.length < 4) {
        markup = `<span class="only-emoji">${markup}</span>`;
      }
    }

    // Cache emoji image URLs
    let result;
    while ((result = EMOJI_IMAGE_URL_PATTERN.exec(markup)) !== null) {
      emojiUsed.add(result[1]);
    }

    // Safari doesn't always use presentation selectors, so clean them out
    markup = markup.replace(EMOJI_PRESENTATION_PATTERN, '');
  }

  return markup;
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

function createGraph(markup) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, 'text/html');
  const emojiUsed = new Set();
  const graph = {
    nodes: {},
    startId: null
  };
  let currentNode = null;

  smartquotes(doc.body);

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

    if (!currentNode || String(el.textContent).trim().length === 0) {
      return;
    }

    if (el.tagName.indexOf('H') === 0) {
      currentNode.prompts.push(formatEmoji(el.innerHTML, emojiUsed));
    } else {
      currentNode.notes.push(formatEmoji(parseMessage(el), emojiUsed));
    }
  });

  // Preload and cache emoji images
  setTimeout(() => {
    [...emojiUsed].forEach(imageURL => {
      emojiImageCache[imageURL] = new Image();
      emojiImageCache[imageURL].src = imageURL;
    });
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

  return { id, title, author, cta, graph: createGraph(doc.text) };
}

export function widont(text) {
  const words = text.split(SP);
  const lastTwoWordsText = words.slice(-2).join(SP);

  return `${words.slice(0, -2).join(SP)} ${lastTwoWordsText.replace(' ', lastTwoWordsText.length > 15 ? SP : NBSP)}`;
}
