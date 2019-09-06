// import { Dispatch, Reducer as ReduxReducer } from 'redux' TODO

import { ExtractActionFromActionCreator } from './base'

import * as actions from '../actions'
// import { rootReducer } from '../reducers'

export type AllActions = ExtractActionFromActionCreator<
  typeof actions[keyof typeof actions]
>

export type Reducer<S = any> = (state: S | undefined, action: AllActions) => S

export type RootState = any

export type Middleware = () => (
  next: any,
) => (action: AllActions) => any
