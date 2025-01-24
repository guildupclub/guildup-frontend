import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import channelReducer from "./channelSlice"
export const store = configureStore({
  reducer: {
    user: userReducer,
    channel: channelReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;