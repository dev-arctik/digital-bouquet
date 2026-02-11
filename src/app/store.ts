// Redux store configuration.
// Only the garden slice is persisted to localStorage via redux-persist.
// The builder slice is ephemeral and resets on page refresh.

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import builderReducer from '../features/builder/builderSlice';
import gardenReducer from '../features/garden/gardenSlice';

// Persist config targets only the garden slice
const gardenPersistConfig = {
  key: 'garden',
  storage,
};

const rootReducer = combineReducers({
  builder: builderReducer,
  garden: persistReducer(gardenPersistConfig, gardenReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  // Ignore redux-persist action types in the serializable check
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Infer types from the store itself for type-safe hooks
export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
