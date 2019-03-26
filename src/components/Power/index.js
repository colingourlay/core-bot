import VisuallyHidden from '@reach/visually-hidden';
import React from 'react';
import { useStyle } from 'styled-hooks';

export default function Power({ text, icon, action }) {
  const className = useStyle`
    display: inline-block;
    position: fixed;
    right: 12px;
    bottom: 12px;
    margin: 0;
    border: 0;
    border-radius: 4px;
    padding: 4px;
    background-color: #01cfff;
    color: #000;
    line-height: 1;

    svg {
      width: 32px;
      min-width: 32px;
      height: 32px;
    }
  `;

  const href = `#dls-icon-${icon}`;

  return (
    <button className={className} onClick={action}>
      <VisuallyHidden>{text}</VisuallyHidden>
      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <use href={href} xlinkHref={href} />
      </svg>
    </button>
  );
}
