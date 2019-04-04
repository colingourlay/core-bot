import React from 'react';
import Sequenza from 'sequenza';

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
  CHOOSE_PROMPT: 7
};

export const OPEN_DIALOG_ACTION = { type: ACTION_TYPES.OPEN_DIALOG };
export const CLOSE_DIALOG_ACTION = { type: ACTION_TYPES.CLOSE_DIALOG };

function getNextHostMessages(node) {
  return node.notes.map(note => ({ markup: note }));
}

function getNextPrompts(node, graph) {
  return node.next.reduce(
    (memo, id) => memo.concat(graph.nodes[id].prompts.map(prompt => ({ targetNodeId: id, markup: prompt }))),
    []
  );
}

function scheduleHostActivity(nodeId, graph, dispatch) {
  const targetNode = graph.nodes[nodeId];
  const nextHostMessages = getNextHostMessages(targetNode, graph);
  const nextPrompts = getNextPrompts(targetNode, graph);
  const sequenza = new Sequenza();

  nextHostMessages.forEach((message, index) => {
    sequenza.queue({
      callback: () => dispatch({ type: ACTION_TYPES.HOST_COMPOSING }),
      delay: index ? 750 : 1250
    });
    sequenza.queue({
      callback: () => dispatch({ type: ACTION_TYPES.HOST_MESSAGE, data: message }),
      delay: Math.min(1250 + (message.markup ? message.markup.split(' ').length * 100 : 1000), 3000)
    });
  });
  sequenza.queue({
    callback: () => dispatch({ type: ACTION_TYPES.UPDATE_PROMPTS, data: nextPrompts }),
    delay: 1750
  });
  sequenza.start();
}

function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.OPEN_DIALOG:
      return { ...state, isDialogOpen: true };
    case ACTION_TYPES.CLOSE_DIALOG:
      return { ...state, isDialogOpen: false };
    case ACTION_TYPES.HOST_COMPOSING:
      const history = state.history;
      const lastMessage = history[history.length - 1];

      if (lastMessage.isGuest) {
        delete lastMessage.box;
        delete lastMessage.parentBox;
      }

      return { ...state, isHostComposing: true, history };
    case ACTION_TYPES.HOST_MESSAGE:
      return { ...state, isHostComposing: false, history: state.history.concat([action.data]) };
    case ACTION_TYPES.HOST_START:
      const startNodePrompt = state.graph.nodes[state.graph.startId].prompts[0];
      const firstGuestMessage = { markup: startNodePrompt || state.title, isGuest: true };

      scheduleHostActivity(state.graph.startId, state.graph, action.data.dispatch);

      return { ...state, history: state.history.concat([firstGuestMessage]) };
    case ACTION_TYPES.UPDATE_PROMPTS:
      return { ...state, prompts: action.data };
    case ACTION_TYPES.CHOOSE_PROMPT:
      const { targetNodeId, markup, box, parentBox, dispatch } = action.data;
      const nextGuestMessage = { markup, isGuest: true, box, parentBox };

      scheduleHostActivity(targetNodeId, state.graph, dispatch);

      return { ...state, prompts: [], history: state.history.concat([nextGuestMessage]) };
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
