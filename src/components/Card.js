import VisuallyHidden from '@reach/visually-hidden';
import React from 'react';
import { useStyle } from 'styled-hooks';
import { useContext, OPEN_DIALOG_ACTION } from '../state';
import Power from './Power';

export default function Card({ text, icon, action }) {
  const { state, dispatch } = useContext();
  const className = useStyle`
    box-sizing: border-box;
    border: 1px solid #eee;
    border-radius: 2px;
    padding: 8px;
    background-color: #fff;

    h3 {
      margin: 0 0 8px !important;
      font-family: ABCSans;
      font-size: 18px !important;
      font-weight: normal;
      line-height: 1.25;
    }

    button {
      display: block;
      margin: 0;
      border: 0;
      border-radius: 4px;
      padding: 8px 12px;
      width: 100%;
      background-color: #01cfff;
      color: #000;
      font-size: 16px;
      font-weight: normal;
      line-height: 1.25;
      text-transform: uppercase;
    }
  `;

  return (
    <div className={className}>
      <VisuallyHidden>ABC News Chat Bot</VisuallyHidden>
      <h3>{state.title}</h3>
      <button onClick={() => dispatch(OPEN_DIALOG_ACTION)}>Ask the News&nbsp;Bot</button>
    </div>
  );
}
