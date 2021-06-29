import React from 'react';
import Sequenza from 'sequenza';
import Visibility from 'visibilityjs';
import pkg from '../package';
import { track } from './utils/behaviour';
import { IS_DEBUG } from './constants';
import { getContentReadingTime } from './content';

const { name } = pkg;

export const Context = React.createContext({});

export function Provider({ children, state, dispatch }) {
  if (!children) {
    return null;
  }

  return <Context.Provider value={{ state, dispatch }}>{React.Children.only(children)}</Context.Provider>;
}

export const Consumer = Context.Consumer;

export function useContext() {
  return React.useContext(Context);
}

export const ACTION_TYPES = {
  WINDOW_UNLOAD: 'WINDOW_UNLOAD',
  SHOW_POWER_CTA: 'SHOW_POWER_CTA',
  OPEN_DIALOG: 'OPEN_DIALOG',
  OPEN_DEBUG_DIALOG: 'OPEN_DEBUG_DIALOG',
  CLOSE_DIALOG: 'CLOSE_DIALOG',
  HOST_COMPOSING: 'HOST_COMPOSING',
  HOST_MESSAGE: 'HOST_MESSAGE',
  HOST_START: 'HOST_START',
  UPDATE_PROMPTS: 'UPDATE_PROMPTS',
  CHOOSE_PROMPT: 'CHOOSE_PROMPT',
  END_CONVERSATION: 'END_CONVERSATION',
  EXIT_LINK: 'EXIT_LINK'
};

function getHostMessages(nodeId, graph) {
  return graph.nodes.find(({ id }) => id === nodeId).contents.map(contentId => ({ contentId }));
}

function getGuestPrompts(nodeId, graph) {
  return graph.edges
    .filter(({ from }) => from === nodeId)
    .map(({ content, to }) => ({ contentId: content, targetNodeId: to }));
}

function scheduleHostActivity(nodeId, graph, dispatch) {
  const hostMessages = getHostMessages(nodeId, graph);
  const guestPrompts = getGuestPrompts(nodeId, graph);
  const sequenza = new Sequenza();
  let nextReadDelay = 1500;

  hostMessages.forEach((note, index) => {
    const totalMessageDelay = nextReadDelay + 1500;

    sequenza.queue({
      callback: () => dispatch({ type: ACTION_TYPES.HOST_COMPOSING }),
      delay: totalMessageDelay / 3
    });
    sequenza.queue({
      callback: () => dispatch({ type: ACTION_TYPES.HOST_MESSAGE, payload: note }),
      delay: (totalMessageDelay / 3) * 2
    });
    nextReadDelay = getContentReadingTime(note.contentId);
  });
  sequenza.queue({
    callback: () =>
      dispatch(
        guestPrompts.length
          ? { type: ACTION_TYPES.UPDATE_PROMPTS, payload: guestPrompts }
          : { type: ACTION_TYPES.END_CONVERSATION }
      ),
    delay: nextReadDelay
  });

  sequenza.start();
}

const session = {
  hasStarted: false,
  prompts: 0,
  duration: 0,
  durationUpdateInterval: null
};

function reducer(state, action) {
  const { type, payload } = action;

  if (IS_DEBUG) {
    console.debug(...[`[${name}]`, type, payload].filter(x => x));
  }

  switch (type) {
    case ACTION_TYPES.OPEN_DIALOG:
      if (!session.hasStarted) {
        session.hasStarted = true;
        track(state.id, 'session-start');
      }

      session.durationUpdateInterval = Visibility.every(1000, () => session.duration++);

      return { ...state, isDialogOpen: true };
    case ACTION_TYPES.CLOSE_DIALOG:
      Visibility.stop(session.durationUpdateInterval);

      return { ...state, isDialogOpen: false, isDebugDialogOpen: false };
    case ACTION_TYPES.HOST_COMPOSING:
      const history = state.history;
      const mostRecent = history[history.length - 1];

      if (mostRecent.isGuest) {
        delete mostRecent.box;
        delete mostRecent.parentBox;
      }

      return { ...state, isHostComposing: true, history };
    case ACTION_TYPES.HOST_MESSAGE:
      return { ...state, isHostComposing: false, history: state.history.concat([payload]) };
    case ACTION_TYPES.HOST_START:
      const entryNode = state.graph.nodes[0];
      const entryEdge = state.graph.edges.find(({ to }) => to === entryNode.id);
      const entryContentId = entryEdge ? entryEdge.content : state.titleContentId;

      setTimeout(() => {
        scheduleHostActivity(entryNode.id, state.graph, payload.dispatch);
      }, getContentReadingTime(entryContentId));

      return {
        ...state,
        history: state.history.concat([{ contentId: entryContentId, isGuest: true }])
      };
    case ACTION_TYPES.UPDATE_PROMPTS:
      return { ...state, prompts: payload };
    case ACTION_TYPES.CHOOSE_PROMPT:
      const { contentId, targetNodeId, markup, box, parentBox, dispatch } = payload;

      setTimeout(() => {
        scheduleHostActivity(targetNodeId, state.graph, dispatch);
      }, getContentReadingTime(contentId));

      session.prompts++;
      track(state.id, 'prompt-target', targetNodeId);

      return { ...state, prompts: [], history: state.history.concat([{ contentId, isGuest: true, box, parentBox }]) };
    case ACTION_TYPES.END_CONVERSATION:
      return { ...state, hasEnded: true };
    case ACTION_TYPES.EXIT_LINK:
      track(state.id, 'exit-link', payload);

      return state;
    case ACTION_TYPES.WINDOW_UNLOAD:
      if (session.hasStarted) {
        track(state.id, 'session-prompts', session.prompts);
        track(state.id, 'session-duration', Math.floor(session.duration / 5) * 5);
      }

      return state;
    case ACTION_TYPES.OPEN_DEBUG_DIALOG:
      return { ...state, isDebugDialogOpen: true };
    case ACTION_TYPES.SHOW_POWER_CTA: {
      return { ...state, isVisitorBeyondCard: true };
    }
    default:
      throw new Error('Unrecognised action');
  }
}

function getInitialState(props) {
  return {
    hasVisitorSeenCTA: false,
    history: [],
    isDialogOpen: false,
    isDebugDialogOpen: false,
    isVisitorBeyondCard: false,
    prompts: [],
    ...props
  };
}

export function useReducer(props) {
  const [state, dispatch] = React.useReducer(reducer, getInitialState(props));

  return { state, dispatch };
}
