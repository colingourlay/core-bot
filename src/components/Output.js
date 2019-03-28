import React, { useEffect, useRef } from 'react';
import { useStyle } from 'styled-hooks';
import { useContext } from '../state';
import Message from './Message';

const IS_SMOOTH_SCROLL_SUPPORTED = 'scrollBehavior' in document.documentElement.style;
const SCROLL_INTO_VIEW_ARG = IS_SMOOTH_SCROLL_SUPPORTED
  ? { behavior: 'smooth', block: 'end', inline: 'nearest' }
  : false;

export default function Output() {
  const { state } = useContext();
  const ref = useRef();
  const bottomRef = useRef();
  const className = useStyle`
    overflow: scroll;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;margin-right: -32px;
    padding:192px 32px 0 0;
  `;
  const messagesClassName = useStyle`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    padding: 8px;

    & > [data-actor="host"] + [data-actor="guest"],
    & > [data-actor="guest"] + [data-actor="host"] {
      margin-top: 8px;
    }
  `;

  useEffect(() => {
    // Start scrolled to the bottom when initially mounted
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    // Scroll to at bottom (animated if possible) when messages are added
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView(SCROLL_INTO_VIEW_ARG);
    }
  }, [state.history.length, state.prompts.length]);

  return (
    <div ref={ref} className={className}>
      <div className={messagesClassName}>
        {state.history.map((props, index) => (
          <Message key={index} {...props} />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
