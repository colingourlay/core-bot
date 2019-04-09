import React from 'react';
import Sequenza from 'sequenza';
import Visibility from 'visibilityjs';
import { track } from './utils/behaviour';

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
  EXIT_LINK: 8,
  WINDOW_UNLOAD: 9
};

export const OPEN_DIALOG_ACTION = { type: ACTION_TYPES.OPEN_DIALOG };
export const CLOSE_DIALOG_ACTION = { type: ACTION_TYPES.CLOSE_DIALOG };
export const WINDOW_UNLOAD_ACTION = { type: ACTION_TYPES.WINDOW_UNLOAD };

function getNextHostNotes(node) {
  return node.notes.map(contentId => ({ contentId }));
}

function getNextPrompts(node, graph) {
  return node.next.reduce(
    (memo, id) => memo.concat(graph.nodes[id].prompts.map(contentId => ({ contentId, targetNodeId: id }))),
    []
  );
}

function scheduleHostActivity(nodeId, graph, dispatch) {
  const targetNode = graph.nodes[nodeId];
  const nextHostNotes = getNextHostNotes(targetNode, graph);
  const nextPrompts = getNextPrompts(targetNode, graph);
  const sequenza = new Sequenza();

  nextHostNotes.forEach((note, index) => {
    sequenza.queue({
      callback: () => dispatch({ type: ACTION_TYPES.HOST_COMPOSING }),
      delay: index ? 750 : 1250
    });
    sequenza.queue({
      callback: () => dispatch({ type: ACTION_TYPES.HOST_MESSAGE, data: note }),
      delay: 2000
    });
  });
  sequenza.queue({
    callback: () => dispatch({ type: ACTION_TYPES.UPDATE_PROMPTS, data: nextPrompts }),
    delay: 1750
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

      return { ...state, isDialogOpen: false };
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
      const startNodePrompt = state.graph.nodes[state.graph.startId].prompts[0];
      const firstGuestPrompt = { contentId: startNodePrompt || state.titleContentId, isGuest: true };

      scheduleHostActivity(state.graph.startId, state.graph, action.data.dispatch);

      return { ...state, history: state.history.concat([firstGuestPrompt]) };
    case ACTION_TYPES.UPDATE_PROMPTS:
      return { ...state, prompts: action.data };
    case ACTION_TYPES.CHOOSE_PROMPT:
      const { contentId, targetNodeId, markup, box, parentBox, dispatch } = action.data;
      const nextGuestPrompt = { contentId, isGuest: true, box, parentBox };

      scheduleHostActivity(targetNodeId, state.graph, dispatch);
      session.prompts++;
      track(state.id, 'prompt-target', targetNodeId);

      return { ...state, prompts: [], history: state.history.concat([nextGuestPrompt]) };
    case ACTION_TYPES.EXIT_LINK:
      track(state.id, 'exit-link', action.data);

      return state;
    case ACTION_TYPES.WINDOW_UNLOAD:
      if (session.hasStarted) {
        track(state.id, 'session-prompts', session.prompts);
        track(state.id, 'session-duration', Math.floor(session.duration / 5) * 5);
      }

      return state;
    default:
      throw new Error('Unrecognised action');
  }
}

function getInitialState(props) {
  const { graph } = props;
  const startNode = graph.nodes[graph.startId];

  return {
    ...props,
    history: [],
    isDialogOpen: false,
    prompts: []
  };
}

export function useReducer(props) {
  const [state, dispatch] = React.useReducer(reducer, getInitialState(props));

  return { state, dispatch };
}
