import VisuallyHidden from '@reach/visually-hidden';
import React from 'react';
import { useStyle } from 'styled-hooks';
import { DEFAULTS } from '../constants';
import { useContext, OPEN_DIALOG_ACTION } from '../state';

const PATHS = {
  ON:
    'M14 15.167L15.167 14 21 19.833 26.833 14 28 15.167 22.167 21 28 26.833 26.833 28 21 22.167 15.167 28 14 26.833 19.833 21 14 15.167z',
  OFF:
    'M31.928 26.2H32v8.067l-6.6-6.6H13a3 3 0 0 1-3-3V15a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v10.667c0 .184-.025.363-.072.533z'
};

let nextId = 0;

export default function Power({ isOn, onClick }) {
  const { state } = useContext();
  const className = useStyle`
    opacity: ${!isOn && state.isDialogOpen ? 0 : 1};
    z-index: 9999;
    display: inline-block;
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
    box-shadow: 0 4px 10px 0  rgba(20, 79, 102, 0.3);
    color: #000;
    cursor: pointer;
    transition: opacity 0.25s, transform 0.5s;

    @media (min-width: 480px) {
      right: 32px;
    }

    @media (min-height: 720px) {
      bottom: 32px;
    }

    .is-over-footer & {
      transform: translate(0, 100px);
    }

    label {
      position: absolute;
      top: 12px;
      right: 50px;
      border-radius: 16px;
      padding: 5px 10px 4px;
      background-color: inherit;
      box-shadow: inherit;
      font-family: ABCSans;
      font-size: 11px;
      font-weight: 600;
      line-height: 1;
      letter-spacing: 1px;
      white-space: nowrap;
      transition: opacity 0.25s;
    }

    span {
      position: absolute;
      top: 50%;
      right: 50%;
    }
  `;
  const id = `${className.replace(' ', '')}${nextId++}`;

  return (
    <button
      id={id}
      className={className}
      onClick={onClick}
      data-sketch-symbol={process.env.NODE_ENV === 'production' ? null : `Power/${isOn ? 'On' : 'Off'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" aria-hidden>
        <path d={isOn ? PATHS.ON : PATHS.OFF} />
      </svg>
      {isOn ? (
        <VisuallyHidden>{'Close the ABC News Bot'}</VisuallyHidden>
      ) : (
        <label htmlFor={id}>{state.history.length > 1 ? DEFAULTS.RESUME_CTA : state.cta || DEFAULTS.START_CTA}</label>
      )}
    </button>
  );
}
