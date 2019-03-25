import React from 'react';
import { useStyle } from 'styled-hooks';

export default function Chat() {
  const className = useStyle`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    min-height: 100%;
    color: black;
    font-family: ABCSans;
    word-wrap: break-word;

    & > * {
      display: inline-flex;
      margin: 0.125rem auto 0.125rem 0;
      border-radius: 0.25rem;
      padding: 0.5rem 0.75rem;
      max-width: 75%;
      background-color: #eee;
    }

    & > [data-actor="guest"] {
      align-self: flex-end;
      margin: 0.125rem 0 0.125rem auto;
      background-color: #01cfff;
    }

    & > [data-actor="host"] + [data-actor="guest"],
    & > [data-actor="guest"] + [data-actor="host"] {
      margin-top: 0.5rem;
    }
  `;

  return (
    <div className={className}>
      <p data-actor="host">Hello there. I am the host. I can answer your questions.</p>
      <p data-actor="host">Hello there. I am the host. I can answer your questions.</p>
      <p data-actor="host">Hello there. I am the host.</p>
      <p data-actor="guest">Hello there. I am a guest</p>
      <p data-actor="host">Hello there. I am the host</p>
      <p data-actor="guest">Hello there. I am a guest. Can you answer my questions?</p>
    </div>
  );
}
