import capiFetch from '@abcnews/capi-fetch';
import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { articleDocumentToAppProps } from './utils/index';
import './global.css';

let fetch = capiFetch;

// DEBUG ONLY
if (window.__corebot__) {
  fetch = (_, done) => done(null, __corebot__);
}

const rootEl = document.querySelector('a[name^="corebot"]');
const [, coreBotId] = rootEl.getAttribute('name').match(/corebot(\d+)?/) || [];

if (!coreBotId) {
  throw new Error(`No Core Bot ID found`);
}

let appProps;

function init() {
  render(<App {...appProps} />, rootEl);
}

fetch(coreBotId, (err, doc) => {
  if (err) {
    throw new Error(`Couldn't fetch Core Bot script`);
  }

  appProps = articleDocumentToAppProps(doc);
  init();
});

const footerEl = document.querySelectorAll('nav.global')[1];

if (footerEl && window.IntersectionObserver) {
  new IntersectionObserver(
    entries => {
      rootEl.classList[entries[0].isIntersecting ? 'add' : 'remove']('is-over-footer');
    },
    {
      root: null,
      rootMargin: '10%',
      threshold: 0
    }
  ).observe(footerEl);
}

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      init();
    } catch (err) {
      import('./components/ErrorBox').then(exports => {
        const ErrorBox = exports.default;
        render(<ErrorBox error={err} />, root);
      });
    }
  });
}
