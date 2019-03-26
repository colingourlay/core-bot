import React, { useRef } from 'react';
import { useStyle } from 'styled-hooks';
import { useIntrinsicWidth } from '../../hooks';

export default function Bubble({ bg, isGuest = false, children, ...props }) {
  const spanRef = useRef();
  const spanWidth = useIntrinsicWidth(spanRef);
  const className = useStyle`
    align-self: ${isGuest ? 'flex-end' : 'flex-start'};
    box-sizing: content-box;
    margin: ${isGuest ? '2px 0 2px auto' : '2px auto 2px 0'};
    border-radius: 4px;
    padding: 8px 12px;
    max-width: 66%;
    background-color: ${isGuest ? '#01cfff' : '#eee'};
    font-size: 16px;
  `;

  return (
    <div className={className} data-actor={isGuest ? 'guest' : 'host'} {...props} style={{ width: spanWidth }}>
      <span ref={spanRef}>{children}</span>
    </div>
  );
}
