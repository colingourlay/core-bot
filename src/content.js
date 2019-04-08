import capiFetch from '@abcnews/capi-fetch';
import React from 'react';
import twemoji from 'twemoji';
import Richtext from './components/content/Richtext';
import smartquotes from './utils/smartquotes';

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

const CONTENT_TYPES = {
  RICHTEXT: 1
};

const CONTENT_COMPONENTS = {
  [CONTENT_TYPES.RICHTEXT]: Richtext
};

const emojiImageCache = {};
const emojiUsed = new Set();
const contentStore = {};
let nextId = 0;

export function parseContent(el) {
  let props;
  let type;

  if (false) {
    // We only have RICHTEXT for now:
  } else {
    smartquotes(el);
    props = { markup: formatEmoji(el.innerHTML) };
    type = CONTENT_TYPES.RICHTEXT;
  }

  contentStore[++nextId] = { type, props };

  return nextId;
}

export function renderContent(id) {
  const content = contentStore[id];

  if (!content) {
    return null;
  }

  const { type, props } = content;
  const ContentComponent = CONTENT_COMPONENTS[type];

  return <ContentComponent {...props} />;
}

export function preloadEmoji() {
  [...emojiUsed].forEach(imageURL => {
    emojiImageCache[imageURL] = new Image();
    emojiImageCache[imageURL].src = imageURL;
  });
}

function replaceEmoji(markup) {
  return twemoji.parse(markup, TWEMOJI_PARSING_OPTIONS);
}

function formatEmoji(markup) {
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
