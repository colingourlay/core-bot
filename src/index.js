import { whenDOMReady } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import { fetchOne } from '@abcnews/terminus-fetch';
import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { articleDocumentToAppProps } from './utils/index';
import './global.css.js';

let fetch = fetchOne;

// DEBUG ONLY
if (window.__corebot__) {
  fetch = (_, done) => done(null, __corebot__);
}

Promise.all([proxy('core-bot'), whenDOMReady]).then(() => {
  const [rootEl] = selectMounts('corebot');

  if (!rootEl) {
    throw new Error(`No Core Bot mount point found`);
  }

  const [, coreBotId] = getMountValue(rootEl).match(/corebot(\d+)?/) || [];

  if (!coreBotId) {
    throw new Error(`No Core Bot ID found`);
  }

  fetch(coreBotId, (err, doc) => {
    if (err) {
      throw new Error(`Couldn't fetch Core Bot script`);
    }

    render(<App {...articleDocumentToAppProps(doc)} />, rootEl);
  });

  const [, footerEl] = [...document.querySelectorAll('[data-component="SiteFooter"], nav.global')];

  if (footerEl && window.IntersectionObserver) {
    new IntersectionObserver(
      (entries) => {
        rootEl.classList[entries[0].isIntersecting ? 'add' : 'remove']('is-over-footer');
      },
      {
        root: null,
        rootMargin: '10%',
        threshold: 0,
      }
    ).observe(footerEl);
  }
});
