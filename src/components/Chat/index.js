import React from 'react';
import { useStyle } from 'styled-hooks';
import Bubble from '../Bubble';

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

    & > [data-actor="host"] + [data-actor="guest"],
    & > [data-actor="guest"] + [data-actor="host"] {
      margin-top: 0.5rem;
    }
  `;

  return (
    <div className={className}>
      <Bubble key="1">Hello there. I am the host. I can answer your questions.</Bubble>
      <Bubble>Hello there. I am the host. I suppose I can answer your questions.</Bubble>
      <Bubble>Hello there. I am the host. I do host-y things.</Bubble>
      <Bubble isGuest>Hello there. I am a guest</Bubble>
      <Bubble>Hello there. I am the host</Bubble>
      <Bubble isGuest>Hello there. I am a guest. Can you answer my questions?</Bubble>
    </div>
  );
}
