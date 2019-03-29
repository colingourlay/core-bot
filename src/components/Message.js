import React, { useEffect, useRef } from 'react';
import { useStyle } from 'styled-hooks';

export default function Message({ markup, isGuest = false, /*sink*/ children, ...props }) {
  const className = useStyle`
    position: relative;
    align-self: ${isGuest ? 'flex-end' : 'flex-start'};
    box-sizing: content-box;
    margin: ${isGuest ? '0 0 10px 15px' : '0 15px 10px 0'};
    border-radius: ${isGuest ? '4px 0 0 12px' : ' 0 4px 12px 0'};
    padding: 10px 15px;
    max-width: calc(100% - 15px);
    background-color: ${isGuest ? '#144f66' : '#fff'};
    box-shadow: 0 5px 20px 0  rgba(20, 79, 102, 0.4);

    &[data-actor="host"] + &[data-actor="guest"] {
      margin-top: 5px;
    }

    &[data-actor="host"]:first-child,
    &[data-actor="guest"] + &[data-actor="host"] {
      margin-top: 25px;

      &::before {
        content: 'ABC News Bot';
        position: absolute;
        top: -20px;
        left: 15px;
        color: #144f66;
        font-family: ABCSans;
        font-size: 11px;
        font-weight: 300;
        letter-spacing: 0.25px;
      }
    }
`;

  const contentClassName = useStyle`
    color: ${isGuest ? '#fff' : '#000'};
    font-family: ABCSans;
    font-size: 15px;
    line-height: 1.5;
    letter-spacing: 0.25px;
    
    & a {
      color: #002aff;
      text-decoration: none;
    }

    & > :first-child {
      margin-top: 0;
    }

    & > :last-child {
      margin-bottom: 0;
    }

    & > li {
      list-style-position: inside;
    }
`;

  return (
    <div
      className={className}
      data-actor={isGuest ? 'guest' : 'host'}
      data-sketch-symbol={`Message/${isGuest ? 'Guest' : 'Host'}`}
      {...props}
    >
      <div className={contentClassName} dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
