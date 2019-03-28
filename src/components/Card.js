import VisuallyHidden from '@reach/visually-hidden';
import React from 'react';
import { useStyle } from 'styled-hooks';
import { useContext, OPEN_DIALOG_ACTION } from '../state';
import Power from './Power';

export default function Card({ text, icon, action }) {
  const { state, dispatch } = useContext();
  const className = useStyle`
    position: relative;
    box-sizing: border-box;
    border-radius: 2px;
    padding: 8px 0 0 5px;
  `;

  const innerClassName = useStyle`
    padding: 26px 15px 18px;
    background-color: #DDE7EB;

    h3 {
      margin: 0 0 10px !important;
      color: #144f66;
      font-family: ABCSans;
      font-size: 16px !important;
      font-weight: 600;
      line-height: 1.4;
      letter-spacing: 0.5px;

      &:first-line {
        text-align: left;
      }
    }

    button {
      display: block;
      margin: 0;
      border: 0;
      border-radius: 4px;
      padding: 10px 15px;
      width: 100%;
      background-color: #144f66;
      background-image: linear-gradient(30deg, #1e7799 0%, #144f66 100%);
      box-shadow: 0 4px 10px 0  rgba(20, 79, 102, 0.4);
      color: #fff;
      font-family: ABCSans;
      font-size: 12px;
      font-weight: 300;
      line-height: 1.4;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  `;

  const iconClassName = useStyle`
    position: absolute;
    top: 0;
    left: 0;
  `;

  return (
    <div className={className}>
      <div className={innerClassName}>
        <VisuallyHidden>ABC News Chat Bot</VisuallyHidden>
        <h3>{state.title}</h3>
        <button onClick={() => dispatch(OPEN_DIALOG_ACTION)}>Ask the ABC&nbsp;News&nbsp;Bot</button>
      </div>
      <svg className={iconClassName} xmlns="http://www.w3.org/2000/svg" width="30" height="29" aria-hidden>
        <path d="M30 18v11l-9-9H5a5 5 0 0 1-5-5V2a2 2 0 0 1 2-2h26a2 2 0 0 1 2 2v16z" />
      </svg>
    </div>
  );
}
