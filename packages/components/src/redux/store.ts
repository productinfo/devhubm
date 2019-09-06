import { composeWithDevTools } from 'redux-devtools-extension'
import {
  applyMiddleware,
  createMigrate,
  createStore,
} from '@wora/redux'
import createSagaMiddleware from 'redux-saga'
import { registerSelectors } from 'reselect-tools'

import { analyticsMiddleware } from './middlewares/analytics'
import { bugsnagMiddleware } from './middlewares/bugsnag'
import migrations from './migrations'
import { rootReducer } from './reducers'
import { rootSaga } from './sagas'
import * as selectors from './selectors'

if (__DEV__) {
  registerSelectors(selectors)
}

export function configureStore(key = 'root') {
  /*const persistConfig: PersistConfig = {
    blacklist: ['navigation'],
    key,
    migrate: createMigrate(migrations as any, { debug: __DEV__ }),
    storage,
    throttle: 500,
    version: 13,
  }
  const persistedReducer = persistReducer(persistConfig, rootReducer)*/

  /*
  // TODO: Fix this
  // Make it keep the current open modal opened
  // Also make sure the middlewares (persist, saga, devtools, etc)
  // keep working as expected
  if (__DEV__) {
    if ((module as any).hot) {
      ;(module as any).hot.accept(() => {
        store.replaceReducer(persistedReducer)
      })
    }
  }
  */

  const sagaMiddleware = createSagaMiddleware()

  const store = createStore(
    rootReducer,
    composeWithDevTools(
      applyMiddleware(bugsnagMiddleware, analyticsMiddleware, sagaMiddleware),
    ),
    undefined,
    {
      key,
      migrate: createMigrate(migrations as any, { debug: __DEV__ }),
      version: 13,
      multiple: true,
      blacklist: ['navigation'],
    }
  )


  sagaMiddleware.run(rootSaga)

  return { store }
}
