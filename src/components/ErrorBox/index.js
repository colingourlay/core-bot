import React, { useEffect } from 'react';
import { useStyle } from 'styled-hooks';

export default function ErrorBox({ error }) {
  const className = useStyle`
    position: fixed;
    overflow: auto;
    left: 0;
    top: 0;
    z-index: 10000;
    box-sizing: border-box;
    margin: 0;
    padding: 2rem;
    width: 100vw;
    height: 100vh;
    background-color: #900;
    color: #fff;
    font-family: Menlo, Consolas, monospace;
    font-size: large;
  `;

  useEffect(() => {
    console.error(error);
  }, [error.stack]);

  return <pre className={className}>{`${String(error)}\n\n${error.stack}`}</pre>;
}
