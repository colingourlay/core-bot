import React, { useEffect, useRef } from 'react';
import { useStyle } from 'styled-hooks';
import { useIntrinsicWidth } from '../../hooks';

export default function Message({ markup, isGuest = false, ...props }) {
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
    color: black;
    font-family: ABCSans;
    font-size: 16px;
    word-wrap: break-word;
  `;

  return (
    <div className={className} data-actor={isGuest ? 'guest' : 'host'} style={{ width: spanWidth }} {...props}>
      <span ref={spanRef} dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
