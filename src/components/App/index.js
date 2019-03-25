import { DialogOverlay, DialogContent } from '@reach/dialog';
import VisuallyHidden from '@reach/visually-hidden';
import React, { useState } from 'react';
import { useTransition, animated } from 'react-spring';
import { useStyle } from 'styled-hooks';
import Chat from '../Chat';
import Icons from '../Icons';
import Power from '../Power';

const AnimatedDialogOverlay = animated(DialogOverlay);
const AnimatedDialogContent = animated(DialogContent);

const DIALOG_TRANSITION_STATES = {
  from: { opacity: 0, transform: 'translate3d(0, -10px, 0)' },
  enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  leave: { opacity: 0, transform: 'translate3d(0, 10px, 0)' }
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
    width: 50vw;
    margin: 10vh auto;
    background: white;
    padding: 2rem;
    outline: none;
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
