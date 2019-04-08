import React, { useState } from 'react';
import { useStyle } from 'styled-hooks';

export default function ImageEmbed({ src, alt, aspectRatio }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const className = useStyle`
    position: relative;
    border-radius: inherit;
    width: 280px;
    max-width: 100%;

    &::before {
      content: '';
      display: block;
      padding-top: ${aspectRatio * 100}%;
      width: 100%;
      height: 0;
      bacground-color: #ccc;
    }

    & > img {
      position: absolute;
      top: 0;
      left: 0;
      border-radius: inherit;
      width: 100%;
      height: 100%;
      vertical-align: top;
      opacity: ${isLoaded ? 1 : 0};
      transition: opacity 0.5s;
    }
  `;

  return (
    <div className={className} data-sketch-symbol={process.env.NODE_ENV === 'production' ? null : 'Image'}>
      <img src={src} alt={alt || null} onLoad={() => setIsLoaded(true)} />
    </div>
  );
}
