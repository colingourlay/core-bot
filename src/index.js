import capiFetch from '@abcnews/capi-fetch';
import React from 'react';
import { render } from 'react-dom';
import { injectGlobal } from 'styled-hooks';
import App from './components/App';
import { articleDocumentToAppProps } from './utils/index';

injectGlobal`
  @font-face {
    font-family: ABCSans;
    font-display: swap;
    src: url('//www.abc.net.au/res/fonts/abcsans/abcsans-light.woff') format('woff');
    font-weight: 300;
    font-style: normal;
    font-stretch: normal;
  }
  
  @font-face {
    font-family: ABCSans;
    font-display: swap;
    src: url('//www.abc.net.au/res/fonts/abcsans/abcsans-regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
    font-stretch: normal;
  }
  
  @font-face {
    font-family: ABCSans;
    font-display: swap;
    src: url('//www.abc.net.au/res/fonts/abcsans/abcsans-regularitalic.woff') format('woff');
    font-weight: 400;
    font-style: italic;
    font-stretch: normal;
  }
  
  @font-face {
    font-family: ABCSans;
    font-display: swap;
    src: url('//www.abc.net.au/res/fonts/abcsans/abcsans-bold.woff') format('woff');
    font-weight: 600;
    font-style: normal;
    font-stretch: normal;
  }
  
  @font-face {
    font-family: ABCSans;
    font-display: swap;
    src: url('//www.abc.net.au/res/fonts/abcsans/abcsans-black.woff') format('woff');
    font-weight: 800;
    font-style: normal;
    font-stretch: normal;
  }
  
  a[name^='corebot']:not(:empty) {
    clear: right;
    float: right;
    margin: 0 0 16px 16px;
    width: calc(50% - 8px);
    max-width: 175px;
    min-width: 150px;
    color: inherit;
    text-decoration: none;
  }  
`;

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
  function initHot() {
    try {
      init();
    } catch (err) {
      import('./components/ErrorBox').then(exports => {
        const ErrorBox = exports.default;
        render(<ErrorBox error={err} />, rootEl);
      });
    }
  }

  module.hot.accept('./components/App', initHot);
  module.hot.accept('./components/Debugger', initHot);
}
