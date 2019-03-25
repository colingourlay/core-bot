import VisuallyHidden from '@reach/visually-hidden';
import React from 'react';
import { useStyle } from 'styled-hooks';

export default function Power({ text, icon, action }) {
  const className = useStyle`
    display: inline-block;
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    margin: 0;
    border: 0;
    /* border-radius: 50%; */
    border-radius: 0.25rem;
    padding: 0.25rem;
    background-color: #01cfff;
    color: #000;
    line-height: 1;

    svg {
      width: 2rem;
      min-width: 2rem;
      height: 2rem;
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
