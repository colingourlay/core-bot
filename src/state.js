import React from 'react';
import Sequenza from 'sequenza';
import Visibility from 'visibilityjs';
import { track } from './utils/behaviour';
import { getContentReadingTime } from './content';

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
  OPEN_DIALOG: 1,
  CLOSE_DIALOG: 2,
  HOST_COMPOSING: 3,
  HOST_MESSAGE: 4,
  HOST_START: 5,
  UPDATE_PROMPTS: 6,
  CHOOSE_PROMPT: 7,
  END_CONVERSATION: 8,
  EXIT_LINK: 9,
  WINDOW_UNLOAD: 10,
  OPEN_DEBUG_DIALOG: 11
};

export const OPEN_DIALOG_ACTION = { type: ACTION_TYPES.OPEN_DIALOG };
export const CLOSE_DIALOG_ACTION = { type: ACTION_TYPES.CLOSE_DIALOG };
export const WINDOW_UNLOAD_ACTION = { type: ACTION_TYPES.WINDOW_UNLOAD };
export const OPEN_DEBUG_DIALOG_ACTION = { type: ACTION_TYPES.OPEN_DEBUG_DIALOG };

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
      callback: () => dispatch({ type: ACTION_TYPES.HOST_MESSAGE, data: note }),
      delay: (totalMessageDelay / 3) * 2
    });
    nextReadDelay = getContentReadingTime(note.contentId);
  });
  sequenza.queue({
    callback: () =>
      dispatch(
        guestPrompts.length
          ? { type: ACTION_TYPES.UPDATE_PROMPTS, data: guestPrompts }
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
  switch (action.type) {
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
      return { ...state, isHostComposing: false, history: state.history.concat([action.data]) };
    case ACTION_TYPES.HOST_START:
      const entryNode = state.graph.nodes[0];
      const entryEdge = state.graph.edges.find(({ to }) => to === entryNode.id);
      const entryContentId = entryEdge ? entryEdge.content : state.titleContentId;

      setTimeout(() => {
        scheduleHostActivity(entryNode.id, state.graph, action.data.dispatch);
      }, getContentReadingTime(entryContentId));

      return {
        ...state,
        history: state.history.concat([{ contentId: entryContentId, isGuest: true }])
      };
    case ACTION_TYPES.UPDATE_PROMPTS:
      return { ...state, prompts: action.data };
    case ACTION_TYPES.CHOOSE_PROMPT:
      const { contentId, targetNodeId, markup, box, parentBox, dispatch } = action.data;

      setTimeout(() => {
        scheduleHostActivity(targetNodeId, state.graph, dispatch);
      }, getContentReadingTime(contentId));

      session.prompts++;
      track(state.id, 'prompt-target', targetNodeId);

      return { ...state, prompts: [], history: state.history.concat([{ contentId, isGuest: true, box, parentBox }]) };
    case ACTION_TYPES.END_CONVERSATION:
      return { ...state, hasEnded: true };
    case ACTION_TYPES.EXIT_LINK:
      track(state.id, 'exit-link', action.data);

      return state;
    case ACTION_TYPES.WINDOW_UNLOAD:
      if (session.hasStarted) {
        track(state.id, 'session-prompts', session.prompts);
        track(state.id, 'session-duration', Math.floor(session.duration / 5) * 5);
      }

      return state;
    case ACTION_TYPES.OPEN_DEBUG_DIALOG:
      return { ...state, isDebugDialogOpen: true };
    default:
      throw new Error('Unrecognised action');
  }
}

function getInitialState(props) {
  return {
    ...props,
    history: [],
    isDialogOpen: false,
    isDebugDialogOpen: false,
    prompts: []
  };
}

export function useReducer(props) {
  const [state, dispatch] = React.useReducer(reducer, getInitialState(props));

  return { state, dispatch };
}
