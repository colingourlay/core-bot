import React from 'react';
import { useStyle } from 'styled-hooks';
import { Provider, useReducer, OPEN_DIALOG_ACTION } from '../state';
import Card from './Card';
import Dialog from './Dialog';
import Chat from './Chat';
import Power from './Power';

export default function App(props) {
  const { state, dispatch } = useReducer(props);

  return (
    <Provider state={state} dispatch={dispatch}>
      <div>
        <Card />
        <Power onClick={() => dispatch(OPEN_DIALOG_ACTION)} />
        <Dialog>{() => <Chat />}</Dialog>
      </div>
    </Provider>
  );
}
