import { DialogOverlay, DialogContent } from '@reach/dialog';
import VisuallyHidden from '@reach/visually-hidden';
import React, { useState } from 'react';
import { useTransition, animated, config } from 'react-spring';
import { useStyle } from 'styled-hooks';
import Chat from '../Chat';
import Icons from '../Icons';
import Power from '../Power';

const AnimatedDialogOverlay = animated(DialogOverlay);
const AnimatedDialogContent = animated(DialogContent);

const DIALOG_TRANSITION_STATES = {
  config: config.stiff,
  from: { opacity: 0, transform: 'translate3d(0, 1rem, 0)' },
  enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  leave: { opacity: 0, transform: 'translate3d(0, -1rem, 0)' }
};

export default function App({ articleId }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const transitions = useTransition(isDialogOpen, null, DIALOG_TRANSITION_STATES);
  const overlayClassName = useStyle`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
    background: hsla(0, 0%, 0%, 0.75);
  `;
  const contentClassName = useStyle`
    position: fixed;
    right: 0.75rem;
    bottom: 4.25rem;
    box-sizing: border-box;
    margin: 0;
    outline: none;
    border-radius: 0.25rem;
    padding: 0.5rem;
    width: calc(100vw - 1.5rem);
    max-width: 24rem;
    height: calc(100vh - 5rem);
    max-height: 36rem;
    overflow: auto;
    background: white;
  `;

  return (
    <div>
      <Icons />
      <Power text="Open" icon="text-sms" action={() => setIsDialogOpen(true)} />
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <AnimatedDialogOverlay
              key={key}
              className={overlayClassName}
              style={{ opacity: props.opacity }}
              onDismiss={() => setIsDialogOpen(false)}
            >
              <Power text="Close" icon="close" action={() => setIsDialogOpen(false)} />
              <AnimatedDialogContent className={contentClassName} style={{ transform: props.transform }}>
                <Chat />
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}
    </div>
  );
}
