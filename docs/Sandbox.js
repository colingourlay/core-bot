import React, { useEffect, useRef } from 'react';
import { useStyle } from 'styled-hooks';
import { getAllContent } from '../src/content';
import { Provider, useReducer } from '../src/state';
import { articleDocumentToAppProps } from '../src/utils/index';
import __corebot__ from '../public/__corebot__';

const appProps = articleDocumentToAppProps(__corebot__);

export default function Sandbox({ name, isInsideDialog = false, isFixedTrap = false, children, ...overrideAppProps }) {
  const { state, dispatch } = useReducer({ ...appProps, isStatic: true, ...overrideAppProps });
  const content = getAllContent();
  const ref = useRef();
  const className = useStyle`
    transform: ${isFixedTrap ? 'translate3d(0, 0, 0)' : 'none'};
    display: flex;
    flex-direction: column;
    padding: ${isInsideDialog ? '0 0 15px 0' : 0};
    max-width: ${isInsideDialog ? '345px' : 'none'};
    min-height: 60px;
    background-color: ${isInsideDialog ? 'rgb(237, 241, 242)' : 'none'};

    & > * {
    }
  `;

  useEffect(() => {
    const componentEl = ref.current.querySelector(':not([data-x])');

    if (name && componentEl) {
      componentEl.setAttribute('data-sketch-symbol', name);
    }
  });

  return (
    <Provider state={state} dispatch={dispatch}>
      <div ref={ref} className={className}>
        {typeof children === 'function' ? children(state, content) : children}
      </div>
    </Provider>
  );
}
