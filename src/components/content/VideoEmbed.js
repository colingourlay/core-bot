import React, { useEffect, useRef, useState } from 'react';
import { useStyle } from 'styled-hooks';
import Media from './Media';

export default function VideoEmbed({ posterSrc, videoSrc, alt, aspectRatio, isGIF, isPlaying }) {
  const ref = useRef();
  const className = useStyle`
    vertical-align: top;
  `;

  useEffect(() => {
    if (!isGIF) {
      return;
    }

    ref.current[isPlaying ? 'play' : 'pause']();
  }, [isGIF && isPlaying]);

  return (
    <Media aspectRatio={aspectRatio}>
      <video
        ref={ref}
        className={className}
        src={videoSrc}
        poster={posterSrc}
        alt={alt || null}
        title={alt || null}
        controls={!isGIF}
        loop={isGIF}
        muted={isGIF}
        playsInline={isGIF}
        webkit-playsinline={isGIF ? '' : null}
      />
    </Media>
  );
}
