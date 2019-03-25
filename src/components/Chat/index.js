import React from 'react';
import { useStyle } from 'styled-hooks';

export default function Chat() {
  const className = useStyle`
    color: red;
  `;

  return (
    <div className={className}>
      <p>Hello there. I am Core Bot</p>
    </div>
  );
}
