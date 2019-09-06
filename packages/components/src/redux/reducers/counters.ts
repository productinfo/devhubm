import _ from 'lodash'
import { REHYDRATE } from '@wora/redux'

import { Reducer } from '../types'

const initialState = {
  loginSuccess: 0,
}

export type State = typeof initialState

export const countReducer: Reducer<State> = (
  state = initialState,
  action,
): State => {
  switch (action.type) {
    case REHYDRATE as any: {

      return {
        ...initialState,
        ...(_.pick(state, Object.keys(initialState)) as any),
      }
    }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loginSuccess: (state.loginSuccess || 0) + 1,
      }

    default:
      return state
  }
}
