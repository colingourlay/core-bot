import React from 'react';
import { useStyle } from 'styled-hooks';
import { Provider, useReducer, OPEN_DIALOG_ACTION } from '../state';
import Card from './Card';
import Dialog from './Dialog';
import Icons from './Icons';
import Input from './Input';
import Output from './Output';
import Power from './Power';

export default function App(props) {
  const { state, dispatch } = useReducer(props);

  return (
    <Provider state={state} dispatch={dispatch}>
      <div>
        <Icons />
        <Card />
        <Power text="Open" icon="text-sms" action={() => dispatch(OPEN_DIALOG_ACTION)} />
        <Dialog>{() => [<Output key="output" />, <Input key="input" />]}</Dialog>
      </div>
    </Provider>
  );
}
