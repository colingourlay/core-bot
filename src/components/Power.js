import VisuallyHidden from '@reach/visually-hidden';
import React from 'react';
import { useStyle } from 'styled-hooks';

const PATHS = {
  ON:
    'M14 15.167L15.167 14 21 19.833 26.833 14 28 15.167 22.167 21 28 26.833 26.833 28 21 22.167 15.167 28 14 26.833 19.833 21 14 15.167z',
  OFF:
    'M31.928 26.2H32v8.067l-6.6-6.6H13a3 3 0 0 1-3-3V15a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v10.667c0 .184-.025.363-.072.533z'
};

export default function Power({ isOn, onClick }) {
  const className = useStyle`
    z-index: 9999;
    display: inline-block;
    overflow: hidden;
    position: fixed;
    right: 12px;
    bottom: 12px;
    margin: 0;
    border: 0;
    border-radius: 50%;
    padding: 0;
    width: 42px;
    height: 42px;
    background-color: rgba(255, 255, 255, 0.85);
    box-shadow: 0 4px 10px 0  rgba(20, 79, 102, 0.4);
    color: #000;
  `;

  return (
    <button className={className} onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" aria-hidden>
        <path d={isOn ? PATHS.ON : PATHS.OFF} />
      </svg>
      <VisuallyHidden>{`${isOn ? 'Close' : 'Open'} the ABC News Bot`}</VisuallyHidden>
    </button>
  );
}
