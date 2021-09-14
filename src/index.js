import acto from '@abcnews/alternating-case-to-object';
import { proxy } from '@abcnews/dev-proxy';
import { whenDOMReady } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import { fetchOne } from '@abcnews/terminus-fetch';
import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { articleDocumentToAppProps, parseConfigFromMount } from './utils/index';
import './global.css.js';

let fetch = fetchOne;

// DEBUG ONLY
if (window.__corebot__) {
  fetch = () => Promise.resolve(__corebot__);
}

Promise.all([proxy('core-bot'), whenDOMReady]).then(() => {
  const rootEls = selectMounts('corebot').map((rootEl, index, rootEls) => {
    const { id, dialog, embed } = parseConfigFromMount(rootEl);

    if (!id) {
      throw new Error(`No Core Bot ID found`);
    }

    fetch(id)
      .then(doc =>
        render(
          <App
            dialogPosition={dialog}
            embedAlignment={embed}
            isOnlyInstance={rootEls.length === 1}
            {...articleDocumentToAppProps(doc)}
          />,
          rootEl
        )
      )
      .catch(err => {
        throw new Error(`Couldn't fetch Core Bot script`);
      });

    rootEl.setAttribute('data-embed', embed);

    return rootEl;
  });

  const [, footerEl] = [...document.querySelectorAll('[data-component="SiteFooter"], nav.global')];

  if (footerEl && window.IntersectionObserver) {
    new IntersectionObserver(
      entries => {
        const method = entries[0].isIntersecting ? 'add' : 'remove';

        rootEls.forEach(rootEl => rootEl.classList[method]('is-over-footer'));
      },
      {
        root: null,
        rootMargin: '10%',
        threshold: 0
      }
    ).observe(footerEl);
  }
});
