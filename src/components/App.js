import React, { Suspense, lazy, useEffect } from 'react';
import { useStyle } from 'styled-hooks';
import { Provider, useReducer, ACTION_TYPES } from '../state';
import Card from './Card';
import Chat from './Chat';
import Dialog from './Dialog';
import Power from './Power';
import { IS_DEBUG } from '../constants';

const Debugger = lazy(() => import(/* webpackChunkName: "Debugger" */ './Debugger'));

export default function App(props) {
  const { state, dispatch } = useReducer(props);

  useEffect(() => {
    function onUnload() {
      dispatch({ type: ACTION_TYPES.WINDOW_UNLOAD });
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
        {state.isOnlyInstance && <Power onClick={() => dispatch({ type: ACTION_TYPES.OPEN_DIALOG })} />}
        {state.isDialogOpen && (
          <Dialog>
            <Chat />
          </Dialog>
        )}
        {state.isDebugDialogOpen && (
          <Dialog isDebug>
            <Suspense fallback={`Loading...`}>
              <Debugger />
            </Suspense>
          </Dialog>
        )}
      </div>
    </Provider>
  );
}
