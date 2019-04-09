import React, { useState } from 'react';
import { useStyle } from 'styled-hooks';
import Media from './Media';

export default function ImageEmbed({ src, alt, aspectRatio }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const className = useStyle`
    vertical-align: top;
    opacity: ${isLoaded ? 1 : 0};
    transition: opacity 0.5s;
  `;

  return (
    <Media aspectRatio={aspectRatio}>
      <img className={className} src={src} alt={alt || null} title={alt || null} onLoad={() => setIsLoaded(true)} />
    </Media>
  );
}
