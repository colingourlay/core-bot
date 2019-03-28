import React from 'react';

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
  HOST_MESSAGE: 3,
  CHOOSE_PROMPT: 4
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

function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.OPEN_DIALOG:
      return { ...state, isDialogOpen: true };
    case ACTION_TYPES.CLOSE_DIALOG:
      return { ...state, isDialogOpen: false };
    case ACTION_TYPES.HOST_MESSAGE:
      return { ...state, history: state.history.concat([action.data]) };
    case ACTION_TYPES.UPDATE_PROMPTS:
      return { ...state, prompts: action.data };
    case ACTION_TYPES.CHOOSE_PROMPT:
      const { targetNodeId, markup, dispatch } = action.data;
      const targetNode = state.graph.nodes[targetNodeId];
      const nextGuestMessage = { markup, isGuest: true };
      const nextHostMessages = getNextHostMessages(targetNode, state.graph);
      const nextPrompts = getNextPrompts(targetNode, state.graph);
      const messageInterval = setInterval(() => {
        if (nextHostMessages.length) {
          return dispatch({ type: ACTION_TYPES.HOST_MESSAGE, data: nextHostMessages.shift() });
        }

        clearInterval(messageInterval);
        dispatch({ type: ACTION_TYPES.UPDATE_PROMPTS, data: nextPrompts });
      }, 2000);

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
    history: startNode.notes.map(message => ({ markup: message })),
    isDialogOpen: false,
    prompts: getNextPrompts(startNode, graph)
  };
}

export function useReducer(props) {
  const [state, dispatch] = React.useReducer(reducer, getInitialState(props));

  return { state, dispatch };
}
