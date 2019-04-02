import React from 'react';

export default function Ellipsis() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 8" preserveAspectRatio="xMidYMid">
      <g transform="translate(4 4)">
        <circle cx="0" cy="0" r="4" fill="#d0dce0">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="-0.25s"
            calcMode="spline"
            keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
            values="0;1;0"
            keyTimes="0;0.5;1"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
      <g transform="translate(15 4)">
        <circle cx="0" cy="0" r="4" fill="#7295a3">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="-0.125s"
            calcMode="spline"
            keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
            values="0;1;0"
            keyTimes="0;0.5;1"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
      <g transform="translate(26 4)">
        <circle cx="0" cy="0" r="4" fill="#144f66">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="0"
            calcMode="spline"
            keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
            values="0;1;0"
            keyTimes="0;0.5;1"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  );
}
