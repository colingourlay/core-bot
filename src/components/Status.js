import React from 'react';
import { useStyle } from 'styled-hooks';
import { DEFAULTS, CUBIC_BEZIER_EASING } from '../constants';

const TRANSPARENT_BOX_SHADOW = '0 5px 20px 0  rgba(20, 79, 102, 0)';

export default function Status({ text }) {
  const className = useStyle`
    display: flex;
    justify-content: stretch;
    align-items: center;
    margin: 16px 16px 0;
    padding: 0;
    width: calc(100% - 32px);
    background-image: none;
    color: #144f66;
    list-style: none;
    animation: ${isStatic ? 'none' : `enterStatus 0.5s ${CUBIC_BEZIER_EASING} forwards`};

    &::before,
    &::after {
      content: '';
      opacity: 0.25;
      display: block;
      flex: 1 0 auto;
      height: 1px;
      background-color: currentColor;
    }

    & > div {
      flex: 0 0 auto;
      margin: 0 8px;
      font-family: ABCSans;
      font-size: 11px;
      font-weight: 300;
      letter-spacing: 0.25px;
      text-transform: uppercase;
    }

    @keyframes enterStatus {
      from {
        opacity: 0;
        transform: translate(0, 100%);
      }
      to {
        opacity: 1;
        transforom: none;
      }
    }
  `;

  return (
    <li className={className}>
      <div>{text}</div>
    </li>
  );
}
