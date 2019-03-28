import React, { useEffect, useRef } from 'react';
import { useStyle } from 'styled-hooks';
import { useIntrinsicWidth } from '../hooks';

export default function Message({ markup, isGuest = false, ...props }) {
  const className = useStyle`
    align-self: ${isGuest ? 'flex-end' : 'flex-start'};
    box-sizing: content-box;
    margin: ${isGuest ? '2px 0 2px auto' : '2px auto 2px 0'};
    border-radius: 4px;
    padding: 8px 12px;
    background-color: ${isGuest ? '#01cfff' : '#eee'};
  `;

  const contentClassName = useStyle`
    color: black;
    font-family: ABCSans;
    font-size: 16px;
    font-weight: 300;
    
    & a {
      color: #0058cc;
      text-decoration: underline;
    }

    & > :forst-child {
      margin-top: 0;
    }

    & > :last-child {
      margin-bottom: 0;
    }

    & > li {
      list-style-position: inside;
    }
`;

  const contentRef = useRef();
  const contentWidth = useIntrinsicWidth(contentRef);

  return (
    <div className={className} data-actor={isGuest ? 'guest' : 'host'} style={{ width: contentWidth }} {...props}>
      <span ref={contentRef} className={contentClassName} dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
