import React, { useEffect, useRef, useState } from 'react';
import { useStyle } from 'styled-hooks';
import { useContext, ACTION_TYPES } from '../state';

export default function Input() {
  const { state, dispatch } = useContext();
  const { prompts } = state;

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

  const key = prompts.map(({ id }) => id).join('_');

  return (
    <div key={key} className={className}>
      {prompts.map(({ targetNodeId, markup }, index) => (
        <button
          key={`${index}-of-${key}`}
          style={{ animationDelay: `${0.25 + index * 0.125}s` }}
          className={actionClassName}
          onClick={() => dispatch({ type: ACTION_TYPES.CHOOSE_PROMPT, data: { targetNodeId, markup, dispatch } })}
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      ))}
    </div>
  );
}
