import VisuallyHidden from '@reach/visually-hidden';
import React, { useRef, useState } from 'react';
import { useStyle } from 'styled-hooks';
import { renderContent } from '../content';
import { useContext, ACTION_TYPES } from '../state';

export default function Prompts() {
  const { state, dispatch } = useContext();
  const [chosenIndex, setChosenIndex] = useState(null);
  const { history, prompts } = state;
  const seenContentIds = history.map(x => x.contentId);

  const ref = useRef();
  const className = useStyle`
    margin: 30px 8px 0;

    &[data-has-chosen] {
      pointer-events: none;
    }

    & label {
      display: block;
      margin: 0 0 0 16px;
      color: #144f66;
      font-family: ABCSans;
      font-size: 15px;
      font-weight: 600;
      line-height: 1;
      transition: opacity 0.25s;
    }

    &[data-has-chosen] label {
      opacity: 0;
    }

    & ol {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    & li {
      margin: 0;
      padding: 0;
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
    color: #fff;
    text-align: left;
    cursor: pointer;
    transition: opacity 0.125s, background-color 0.125s;

    &[data-was-previously-chosen] {
      opacity: 0.25;
      background-color: #144f66;
    }

    [data-has-chosen] &:not([data-is-chosen]) {
      opacity: 0;
    }

    [data-has-chosen] &[data-is-chosen] {
      background-color: #144f66;
    }
  `;

  const key = prompts.map(({ id }) => id).join('_');

  return (
    <div
      key={key}
      ref={ref}
      className={className}
      data-has-chosen={chosenIndex !== null ? '' : null}
      data-sketch-symbol={process.env.NODE_ENV === 'production' ? null : 'Prompts'}
    >
      {prompts.length > 1 && <label role="pesentation">Choose one</label>}
      <ol role="menu" aria-label={prompts.length ? 'Chat Prompts' : null} aria-live="polite" aria-atomic="false">
        {prompts.map(({ contentId, targetNodeId }, index) => {
          let hasChosenPrompt;

          function choosePrompt(event) {
            if (hasChosenPrompt) {
              return;
            }

            hasChosenPrompt = true;

            const el = event.currentTarget;
            const box = el.getBoundingClientRect();
            const parentBox = ref.current.getBoundingClientRect();
            const action = {
              type: ACTION_TYPES.CHOOSE_PROMPT,
              data: {
                contentId,
                targetNodeId,
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
            <li key={`${index}-of-${key}`}>
              <VisuallyHidden>{`Prompt ${index + 1}:`}</VisuallyHidden>
              <button
                className={promptClassName}
                role="menuitem"
                data-was-previously-chosen={seenContentIds.indexOf(contentId) > -1 ? '' : null}
                data-is-chosen={chosenIndex === index ? '' : null}
                onClick={choosePrompt}
              >
                {renderContent(contentId)}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
