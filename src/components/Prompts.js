import React, { useState } from 'react';
import { useStyle } from 'styled-hooks';
import { useContext, ACTION_TYPES } from '../state';
import Message from './Message';

export default function Prompts() {
  const { state, dispatch } = useContext();
  const [chosenIndex, setChosenIndex] = useState(null);
  const { prompts } = state;

  const className = useStyle`
    margin: 30px 8px 0;

    &:not(:empty):before {
      content: ${prompts.length > 1 ? `'Choose one'` : 'none'};
      display: block;
      margin: 0 0 0 16px;
      color: #144f66;
      font-family: ABCSans;
      font-size: 15px;
      font-weight: 600;
      line-height: 1;
      transition: opacity 0.25s;
    }

    &[data-has-chosen] {
      pointer-events: none;

      &:not(:empty):before {
        opacity: 0;
      }
    }
  `;

  const promptClassName = useStyle`
    display: block;
    margin: 8px 0 0;
    border: 0;
    border-radius: 4px;
    padding: 0;
    width: 100%;
    background-color: #000;
    text-align: left;
    transition: opacity 0.125s, background-color 0.125s;

    [data-has-chosen] > &:not([data-is-chosen]) {
      opacity: 0;
    }

    [data-has-chosen] > &[data-is-chosen] {
      background-color: #144f66;
    }
  `;

  const key = prompts.map(({ id }) => id).join('_');

  return (
    <div
      key={key}
      className={className}
      data-has-chosen={chosenIndex !== null ? '' : null}
      data-sketch-symbol="Prompts"
    >
      {prompts.map(({ targetNodeId, markup }, index) => {
        let hasChosenPrompt;

        function choosePrompt(event) {
          if (hasChosenPrompt) {
            return;
          }

          hasChosenPrompt = true;

          const el = event.currentTarget;
          const box = el.getBoundingClientRect();
          const parentBox = el.parentElement.getBoundingClientRect();
          const action = {
            type: ACTION_TYPES.CHOOSE_PROMPT,
            data: {
              targetNodeId,
              markup,
              box,
              parentBox,
              dispatch
            }
          };

          setChosenIndex(index);
          setTimeout(() => {
            dispatch(action);
            setTimeout(() => setChosenIndex(null), 250); // reset state
          }, 125);
        }

        return (
          <button
            key={`${index}-of-${key}`}
            className={promptClassName}
            data-is-chosen={chosenIndex === index ? '' : null}
            onClick={choosePrompt}
          >
            <Message isInverted markup={markup} />
          </button>
        );
      })}
    </div>
  );
}
