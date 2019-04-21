import capiFetch from '@abcnews/capi-fetch';
import { name as gemoji } from 'gemoji';
import React from 'react';
import twemoji from 'twemoji';
import GIFEmbed, { GIF_URL_PATTERNS, resolveGIFEmbedContentProps } from './components/content/GIFEmbed';
import ImageEmbed from './components/content/ImageEmbed';
import LinkEmbed from './components/content/LinkEmbed';
import Richtext from './components/content/Richtext';
import VideoEmbed from './components/content/VideoEmbed';
import { pickRendition, urlToCMID } from './utils/index';
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
const GEMOJI_PATTERN = /:[\w_]+:/g;

const CONTENT_TYPES = {
  CAPI_UNRESOLVED: 1,
  GIF_EMBED: 2,
  IMAGE_EMBED: 3,
  LINK_EMBED: 4,
  RICHTEXT: 5,
  VIDEO_EMBED: 6
};

const CONTENT_COMPONENTS = {
  [CONTENT_TYPES.GIF_EMBED]: GIFEmbed,
  [CONTENT_TYPES.IMAGE_EMBED]: ImageEmbed,
  [CONTENT_TYPES.LINK_EMBED]: LinkEmbed,
  [CONTENT_TYPES.RICHTEXT]: Richtext,
  [CONTENT_TYPES.VIDEO_EMBED]: VideoEmbed
};

const emojiImageCache = {};
const emojiUsed = new Set();
const contentStore = {};
let nextId = 0;

export function parseContent(el) {
  const id = nextId++;
  const content = { type: CONTENT_TYPES.RICHTEXT, props: null };
  const soleLinkEl =
    el.children.length && el.firstChild.tagName === 'A' && el.firstChild === el.lastChild && el.firstChild;
  const soleLinkHref = soleLinkEl && soleLinkEl.getAttribute('href');

  if (soleLinkEl) {
    if (soleLinkEl.target === '_self') {
      content.type = CONTENT_TYPES.CAPI_UNRESOLVED;
      content.props = {
        cmid: urlToCMID(soleLinkEl.href),
        markup: el.innerHTML
      };
      resolveUsingCAPI(content);
    } else if (soleLinkHref.match(GIF_URL_PATTERNS.GFYCAT) || soleLinkHref.match(GIF_URL_PATTERNS.GIPHY)) {
      content.type = CONTENT_TYPES.GIF_EMBED;
      content.props = {
        url: soleLinkHref
      };
      resolveGIFEmbedContentProps(content.props);
    } else {
      content.type = CONTENT_TYPES.LINK_EMBED;
      content.props = {
        url: soleLinkHref
      };
    }
  } else {
    smartquotes(el);
    content.props = { originalMarkup: el.innerHTML, markup: formatEmoji(replaceGemoji(el.innerHTML)) };
  }

  contentStore[id] = content;

  return id;
}

function resolveUsingCAPI(content) {
  capiFetch(content.props.cmid, (err, doc) => {
    if (err) {
      return console.error(new Error(`Could not fetch document with CMID: ${content.props.cmid}`));
    }
    switch (doc.docType) {
      case 'Article':
        const thumbnailRendition = doc.thumbnailLink ? pickRendition(doc.thumbnailLink.media) : null;

        content.props = {
          url: doc.canonicalUrl,
          title: doc.title,
          imageSrc: thumbnailRendition ? thumbnailRendition.url : null,
          imageAspectRatio: thumbnailRendition ? thumbnailRendition.height / thumbnailRendition.width : null
        };
        content.type = CONTENT_TYPES.LINK_EMBED;
        break;
      case 'Image':
      case 'ImageProxy':
      case 'CustomImage':
        const imageRendition = pickRendition(doc.media);

        content.props = {
          src: imageRendition.url,
          alt: doc.alt || doc.title,
          attribution: doc.bylinePlain,
          aspectRatio: imageRendition.height / imageRendition.width
        };
        content.type = CONTENT_TYPES.IMAGE_EMBED;
        break;
      case 'Video':
        const videoRendition = pickRendition(doc.renditions);

        content.props = {
          videoSrc: videoRendition.url,
          posterSrc: doc.thumbnailLink ? doc.thumbnailLink.media[0].url : null,
          alt: doc.alt || doc.title,
          attribution: doc.bylinePlain,
          aspectRatio: videoRendition.height / videoRendition.width
        };
        content.type = CONTENT_TYPES.VIDEO_EMBED;
        break;
      default:
        content.type = CONTENT_TYPES.RICHTEXT;
        break;
    }
  });
}

export function getContentText(id) {
  const { type, props } = contentStore[id];

  switch (type) {
    case CONTENT_TYPES.RICHTEXT:
      const el = document.createElement('div');
      el.innerHTML = props.originalMarkup;
      return el.textContent.trim();
    default:
      return `[${getContentTypeName(type)}]`;
  }
}

export function renderContent(id) {
  const content = contentStore[id];

  if (!content) {
    return null;
  }

  const { type, props } = content;
  const ContentComponent = CONTENT_COMPONENTS[type];

  return ContentComponent ? <ContentComponent {...props} /> : null;
}

export function preloadEmoji() {
  Array.from(emojiUsed).forEach(imageURL => {
    emojiImageCache[imageURL] = new Image();
    emojiImageCache[imageURL].src = imageURL;
  });
}

function replaceEmoji(markup) {
  return twemoji.parse(markup, TWEMOJI_PARSING_OPTIONS);
}

function gemojiReplacer(match) {
  const result = gemoji[match.slice(1, -1)];

  return result ? result.emoji : match;
}

function replaceGemoji(markup) {
  return markup.replace(GEMOJI_PATTERN, gemojiReplacer);
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

function getContentTypeName(type) {
  const typeNames = Object.keys(CONTENT_TYPES);

  return typeNames.find(typeName => CONTENT_TYPES[typeName] === type);
}

export function listContent() {
  const typeNames = Object.keys(CONTENT_TYPES);

  return Object.keys(contentStore).map(key => {
    const { props, type } = contentStore[key];

    return {
      id: key,
      props,
      type: getContentTypeName(type)
    };
  });
}

export function getContentComposeTime(contentId) {
  return 2000;
}
