import React from 'react';
import { useStyle } from 'styled-hooks';
import Dialog from './Dialog';
import Icons from './Icons';
import Input from './Input';
import Output from './Output';
import Power from './Power';
import { Provider, useReducer, OPEN_DIALOG_ACTION } from '../state';

export default function App({ graph }) {
  const { state, dispatch } = useReducer(graph);

  return (
    <Provider state={state} dispatch={dispatch}>
      <div>
        <Icons />
        {/* <button onClick={() => dispatch(OPEN_DIALOG_ACTION)} style={{ fontFamily: 'ABCSans' }}>
          Inline Opener
        </button> */}
        <Power text="Open" icon="text-sms" action={() => dispatch(OPEN_DIALOG_ACTION)} />
        <Dialog>{() => [<Output key="output" />, <Input key="input" />]}</Dialog>
      </div>
    </Provider>
  );
}
