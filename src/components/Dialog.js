import { DialogOverlay, DialogContent } from '@reach/dialog';
import React, { Fragment } from 'react';
import { useTransition, animated, config } from 'react-spring';
import useViewportSize from 'react-hook-viewport-size';
import { useStyle } from 'styled-hooks';
import { useContext, CLOSE_DIALOG_ACTION } from '../state';
import Power from './Power';

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
  const [, viewportHeight] = useViewportSize();
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
    width: calc(100vw - 24px);
    max-width: 384px;
    height: ${viewportHeight - 80}px;
    max-height: 576px;
    background: rgb(237, 241, 242);
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 60px;
      background-image: linear-gradient(to bottom, rgba(237, 241, 242, 1), rgba(237, 241, 242, 0));
      pointer-events: none;
    }
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
              <Power isOn onClick={() => dispatch(CLOSE_DIALOG_ACTION)} />
              <AnimatedDialogContent className={contentClassName} style={{ transform: props.transform }}>
                {children()}
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}
    </Fragment>
  );
}
