import React from 'react';
import { useStyle } from 'styled-hooks';
import Sizer from './Sizer';

export default function Media({ aspectRatio, children }) {
  const className = useStyle`
    position: relative;
    border-radius: inherit;
    width: 280px;
    max-width: 100%;

    &:first-child {
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
    }

    &:last-child {
      border-bottom-left-radius: inherit;
      border-bottom-right-radius: inherit;
    }

    & > :last-child {
      position: absolute;
      top: 0;
      left: 0;
      border-radius: inherit;
      width: 100%;
      height: 100%;
    }
  `;

  return (
    <div className={className} data-sketch-symbol={process.env.NODE_ENV === 'production' ? null : 'Media'}>
      <Sizer aspectRatio={aspectRatio} />
      {React.Children.only(children)}
    </div>
  );
}
