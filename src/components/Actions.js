import React, { useEffect, useRef, useState } from 'react';
import { useStyle } from 'styled-hooks';

export default function Actions({ actions, takeAction }) {
  const className = useStyle`
    padding: 0 8px;
    background-color: #eee;
    box-shadow: inset 0 4px 4px -2px rgba(0,0,0,0.25);
  `;

  const actionClassName = useStyle`
    display: block;
    margin: 8px 0 8px auto;
    border: 0;
    border-radius: 4px;
    padding: 8px 12px;
    background-color: #01cfff;
    color: #000;
    font-family: ABCSans;
    font-size: 16px;
    transition: opacity .5s, transform .5s;
    animation: actionEnter 0.75s backwards;

    @keyframes actionEnter {
      from {
        opacity: 0;
        transform: translate(12px, 0);
      }
      to {
        transform: none;
        opacity: 1;
      }
    }

    &:first-child {
      margin-top: 12px;
    }

    &[disabled]:not(:focus) {
      opacity: 0;
    }

    &[disabled]:focus {
      transform: translate(-300%, 0);
    }
  `;

  const ids = actions.map(({ id }) => id).join('_');

  return (
    <div key={ids} className={className}>
      {actions.map(({ id, markup }, index) => (
        <button
          key={`${index}-of-${ids}`}
          style={{ animationDelay: `${0.25 + index * 0.125}s` }}
          className={actionClassName}
          onClick={() => takeAction(id, markup)}
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      ))}
    </div>
  );
}
