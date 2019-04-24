import React from 'react';
import { useStyle } from 'styled-hooks';
import Sizer from './Sizer';

export default function Media({ aspectRatio, children }) {
  const className = useStyle`
    position: relative;
    overflow: hidden;
    width: 280px;
    max-width: 100%;

    &:first-of-type {
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
    }

    &:last-of-type {
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
      object-fit: cover;
    }
  `;

  return (
    <div className={className}>
      <Sizer aspectRatio={aspectRatio} />
      {React.Children.only(children)}
    </div>
  );
}
