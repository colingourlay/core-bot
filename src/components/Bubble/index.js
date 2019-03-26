import React, { useRef } from 'react';
import { useStyle } from 'styled-hooks';
import { useIntrinsicWidth } from '../../hooks';

export default function Bubble({ bg, isGuest = false, children, ...props }) {
  const spanRef = useRef();
  const spanWidth = useIntrinsicWidth(spanRef);
  const className = useStyle`
    align-self: ${isGuest ? 'flex-end' : 'flex-start'};
    box-sizing: content-box;
    margin: ${isGuest ? '0.125rem 0 0.125rem auto' : '0.125rem auto 0.125rem 0'};
    border-radius: 0.25rem;
    padding: 0.5rem 0.75rem;
    max-width: 66%;
    background-color: ${isGuest ? '#01cfff' : '#eee'};
  `;

  return (
    <div className={className} data-actor={isGuest ? 'guest' : 'host'} {...props} style={{ width: spanWidth }}>
      <span ref={spanRef}>{children}</span>
    </div>
  );
}
