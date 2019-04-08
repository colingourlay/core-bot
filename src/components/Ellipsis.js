import React from 'react';
import { useStyle } from 'styled-hooks';

export default function Ellipsis() {
  const className = useStyle`
    margin: 7px 16px 8px;
    
    & > * {
      display: inline-block;
      border-radius: 50%;
      width: 8px;
      height: 8px;
      background-color: #144f66;
      animation: opacityCycle 0.5s linear alternate infinite;
    }

    & > * + * {
      margin-left: 4px;
      animation-delay: 0.25s;
    }

    & > :last-child {
      animation-delay: 0.5s;
    }

    @keyframes opacityCycle {
      from {
        opacity: 1;
      }
      to {
        opacity: 0.2;
      }
    }
  `;
  return (
    <div
      className={className}
      role="presentation"
      data-sketch-symbol={process.env.NODE_ENV === 'production' ? null : 'Ellipsis'}
    >
      <span />
      <span />
      <span />
    </div>
  );
}
