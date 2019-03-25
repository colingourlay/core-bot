import React from 'react';
import { useStyle } from 'styled-hooks';

export default function App() {
  const className = useStyle`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    min-height: 320px;
    background-color: #ffc100;
    color: #fff;
    text-align: center;

    h1 {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      font-size: 24px !important;
      font-weight: normal !important;
      line-height: normal !important;
      letter-spacing: normal !important;
    }
  `;

  return (
    <div className={className}>
      <h1>Core Bot</h1>
    </div>
  );
}
