import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import scrollIntoView from 'scroll-into-view';
import { useStyle } from 'styled-hooks';
import { useContext, ACTION_TYPES } from '../state';
import Bubble from './Bubble';
import Prompts from './Prompts';

const IS_SMOOTH_SCROLL_SUPPORTED = 'scrollBehavior' in document.documentElement.style;
const SCROLL_INTO_VIEW_ARG = IS_SMOOTH_SCROLL_SUPPORTED
  ? { behavior: 'smooth', block: 'end', inline: 'nearest' }
  : false;

export default function Chat() {
  const { state, dispatch } = useContext();
  const ref = useRef();
  const bottomRef = useRef();
  const className = useStyle`
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 425px 0 0 0;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  `;
  const bubblesClassName = useStyle`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
  `;
  const bottomClassName = useStyle`
    margin-top: 15px;
    height: 1px;
  `;

  useLayoutEffect(() => {
    if (ref.current) {
      // Start scrolled to the bottom when initially mounted
      ref.current.scrollTop = ref.current.scrollHeight;
      // Stop body from scrolling (helping the Dialog out a bit here)
      disableBodyScroll(ref.current);
    }

    if (!state.history.length) {
      dispatch({ type: ACTION_TYPES.HOST_START, data: { dispatch } });
    }

    // Enable body scrolling ro resume on un-mount;
    return clearAllBodyScrollLocks;
  }, []);

  useEffect(() => {
    // Scroll to the bottom when messages are added, but only if the
    // visitor isn't currenlty scrolling (including flick inertia)
    if (bottomRef.current) {
      const initialScrollTop = ref.current.scrollTop;

      requestAnimationFrame(() => {
        if (initialScrollTop !== ref.current.scrollTop) {
          return;
        }

        scrollIntoView(bottomRef.current, {
          time: 500,
          validTarget: target => target === ref.current
        });
      });
    }
  }, [state.history.length, state.prompts.length, state.isHostComposing]);

  return (
    <div ref={ref} className={className} data-sketch-symbol={process.env.NODE_ENV === 'production' ? null : 'Chat'}>
      <div className={bubblesClassName}>
        {state.history.map((props, index) => (
          <Bubble key={index} isLast={index + 1 === state.history.length && state.prompts.length === 0} {...props} />
        ))}
        {state.isHostComposing && <Bubble key={'composing'} isComposer={true} />}
      </div>
      <Prompts />
      <div ref={bottomRef} className={bottomClassName} />
    </div>
  );
}
