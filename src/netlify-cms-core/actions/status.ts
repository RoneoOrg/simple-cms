import { currentBackend } from '../backend';

import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import type { State } from '../types/redux';
import { addSnackbar } from '../redux/slices/snackbars';

export const STATUS_REQUEST = 'STATUS_REQUEST';
export const STATUS_SUCCESS = 'STATUS_SUCCESS';
export const STATUS_FAILURE = 'STATUS_FAILURE';

export function statusRequest() {
  return {
    type: STATUS_REQUEST,
  } as const;
}

export function statusSuccess(status: {
  auth: { status: boolean };
  api: { status: boolean; statusPage: string };
}) {
  return {
    type: STATUS_SUCCESS,
    payload: { status },
  } as const;
}

export function statusFailure(error: Error) {
  return {
    type: STATUS_FAILURE,
    payload: { error },
  } as const;
}

export function checkBackendStatus() {
  return async (dispatch: ThunkDispatch<State, {}, AnyAction>, getState: () => State) => {
    try {
      const state = getState();
      if (state.status.isFetching) {
        return;
      }

      dispatch(statusRequest());
      const backend = currentBackend(state.config);
      const status = await backend.status();

      const message =
        `The backend service is experiencing an outage. See ${status.api.statusPage} for more information`;
      const previousBackendDownSnackbars = state.snackbar.messages.filter(n => n.message === message);

      if (status.api.status === false) {
        if (previousBackendDownSnackbars.length === 0) {
          dispatch(addSnackbar({
            type: 'error',
            message: message
          }));
        }
        return dispatch(statusSuccess(status));
      } else if (status.api.status === true && previousBackendDownSnackbars.length > 0) {
        dispatch(addSnackbar({
          type: 'success',
          message: 'The backend service is back online'
        }));
      }

      const authError = status.auth.status === false;
      if (authError) {
        const message = 'You have been logged out, please back up any data and login again';
        const existingNotification = state.snackbar.messages.filter(n => n.message === message);
        if (!existingNotification) {
          dispatch(addSnackbar({
            type: 'error',
            message: message
          }));
        }
      }

      dispatch(statusSuccess(status));
    } catch (error: any) {
      dispatch(statusFailure(error));
    }
  };
}

export type StatusAction = ReturnType<
  typeof statusRequest | typeof statusSuccess | typeof statusFailure
>;
