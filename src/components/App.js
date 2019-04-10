import React, { useEffect } from 'react';
import { useStyle } from 'styled-hooks';
import { Provider, useReducer, OPEN_DIALOG_ACTION, WINDOW_UNLOAD_ACTION } from '../state';
import Card from './Card';
import Dialog from './Dialog';
import Chat from './Chat';
import Power from './Power';

export default function App(props) {
  const { state, dispatch } = useReducer(props);

  useEffect(() => {
    function onUnload() {
      dispatch(WINDOW_UNLOAD_ACTION);
    }

    window.addEventListener('unload', onUnload);

    return () => {
      window.removeEventListener('unload', onUnload);
    };
  }, []);

  return (
    <Provider state={state} dispatch={dispatch}>
      <div>
        <Card />
        <Power onClick={() => dispatch(OPEN_DIALOG_ACTION)} />
        {state.isDialogOpen && (
          <Dialog>
            <Chat />
          </Dialog>
        )}
      </div>
    </Provider>
  );
}
