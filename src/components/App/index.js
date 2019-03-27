import { DialogOverlay, DialogContent } from '@reach/dialog';
import VisuallyHidden from '@reach/visually-hidden';
import React, { useState } from 'react';
import { useTransition, animated, config } from 'react-spring';
import { useStyle } from 'styled-hooks';
import Actions from '../Actions';
import Chat from '../Chat';
import Icons from '../Icons';
import Power from '../Power';
import ScrollLock from '../ScrollLock';
import { useChatHistory, useNextActions } from '../../hooks';

const AnimatedDialogOverlay = animated(DialogOverlay);
const AnimatedDialogContent = animated(DialogContent);

const DIALOG_TRANSITION_STATES = {
  config: config.stiff,
  from: { opacity: 0, transform: 'translate3d(0, 16px, 0)' },
  enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  leave: { opacity: 0, transform: 'translate3d(0, -16px, 0)' }
};

export default function App({ graph }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chatHistory, addMessages] = useChatHistory(graph);
  const [nextActions, takeAction] = useNextActions(graph, addMessages);
  const transitions = useTransition(isDialogOpen, null, DIALOG_TRANSITION_STATES);
  const overlayClassName = useStyle`
    z-index: 10000;
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
    <div>
      <Icons />
      <button onClick={() => setIsDialogOpen(true)} style={{ fontFamily: 'ABCSans' }}>
        Inline Opener
      </button>
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
              <ScrollLock />
              <Power text="Close" icon="close" action={() => setIsDialogOpen(false)} />
              <AnimatedDialogContent className={contentClassName} style={{ transform: props.transform }}>
                <Chat messages={chatHistory} />
                <Actions actions={nextActions} takeAction={takeAction} />
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}
    </div>
  );
}
