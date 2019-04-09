import React from 'react';
import { useStyle } from 'styled-hooks';

export default function Sizer({ aspectRatio }) {
  const className = useStyle`
    border-radius: inherit;
    padding-top: ${aspectRatio * 100}%;
    width: 100%;
    height: 0;
    background-color: #ccc;
  `;

  return <div className={className} data-sketch-symbol={process.env.NODE_ENV === 'production' ? null : 'Sizer'} />;
}
