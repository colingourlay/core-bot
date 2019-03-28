import { DialogOverlay, DialogContent } from '@reach/dialog';
import React, { Fragment } from 'react';
import { useTransition, animated, config } from 'react-spring';
import { useStyle } from 'styled-hooks';
import { useContext, CLOSE_DIALOG_ACTION } from '../state';
import Power from './Power';
import ScrollLock from './ScrollLock';

const DIALOG_TRANSITION_STATES = {
  config: config.stiff,
  from: { opacity: 0, transform: 'translate3d(0, 16px, 0)' },
  enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  leave: { opacity: 0, transform: 'translate3d(0, -16px, 0)' }
};

const AnimatedDialogOverlay = animated(DialogOverlay);
const AnimatedDialogContent = animated(DialogContent);

export default function Dialog({ children }) {
  const { state, dispatch } = useContext();
  const transitions = useTransition(state.isDialogOpen, null, DIALOG_TRANSITION_STATES);
  const overlayClassName = useStyle`
    z-index: 10000;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
    background: rgba(0, 18, 26, 0.8);
  `;
  const contentClassName = useStyle`
    position: fixed;
    right: 12px;
    bottom: 68px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    box-sizing: border-box;
    overflow: hidden;
    margin: 0;
    outline: none;
    border-radius: 4px;
    width: calc(100vw - 24px);
    max-width: 384px;
    height: calc(100vh - 80px);
    max-height: 576px;
    background: white;
  `;

  return (
    <Fragment>
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <AnimatedDialogOverlay
              key={key}
              className={overlayClassName}
              style={{ opacity: props.opacity }}
              onDismiss={() => dispatch(CLOSE_DIALOG_ACTION)}
            >
              <ScrollLock />
              <Power onClick={() => dispatch(CLOSE_DIALOG_ACTION)} />
              <AnimatedDialogContent className={contentClassName} style={{ transform: props.transform }}>
                {children()}
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}
    </Fragment>
  );
}
