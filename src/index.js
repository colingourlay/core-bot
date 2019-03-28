import capiFetch from '@abcnews/capi-fetch';
import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { createGraph } from './utils';
import { DialogOverlay } from '@reach/dialog';
import './global.css';

const root = document.querySelector(`a[name^="corebot"]`);
const [, coreBotId, coreBotPropsString] = root.getAttribute('name').match(/corebot(\d+)(.*)/) || [];

if (!coreBotId) {
  throw new Error('No Core Bot ID found');
}

let appProps;

function init() {
  render(<App {...appProps} />, root);
}

capiFetch(coreBotId, (err, doc) => {
  if (err) {
    throw new Error(`Couldn't fetch Core Bot script`);
  }

  if (!doc.text) {
    throw new Error(`Core Bot script has no text`);
  }

  appProps = { graph: createGraph(doc.text), title: doc.title };

  init();
});

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
