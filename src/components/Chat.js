import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import scrollIntoView from 'scroll-into-view';
import { useStyle } from 'styled-hooks';
import { useContext } from '../state';
import Prompts from './Prompts';
import Message from './Message';

const IS_SMOOTH_SCROLL_SUPPORTED = 'scrollBehavior' in document.documentElement.style;
const SCROLL_INTO_VIEW_ARG = IS_SMOOTH_SCROLL_SUPPORTED
  ? { behavior: 'smooth', block: 'end', inline: 'nearest' }
  : false;

export default function Chat() {
  const { state } = useContext();
  const ref = useRef();
  const bottomRef = useRef();
  const className = useStyle`
    overflow: scroll;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    margin-right: -32px;
    padding: 500px 32px 0 0;
  `;
  const messagesClassName = useStyle`
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

    // Enable body scrolling ro resume on un-mount;
    return clearAllBodyScrollLocks;
  }, []);

  useEffect(() => {
    // Scroll to at bottom (animated if possible) when messages are added
    if (bottomRef.current) {
      scrollIntoView(bottomRef.current, {
        time: 500,
        validTarget: target => target === ref.current
      });
    }
  }, [state.history.length, state.prompts.length, state.isHostComposing]);

  return (
    <div ref={ref} className={className} data-sketch-symbol="Chat">
      <div className={messagesClassName}>
        {state.history.map((props, index) => (
          <Message key={index} isLast={index + 1 === state.history.length} {...props} />
        ))}
        {state.isHostComposing && <Message key={'composing'} isComposer={true} />}
      </div>
      <Prompts />
      <div ref={bottomRef} className={bottomClassName} />
    </div>
  );
}
