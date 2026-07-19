import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import leadReducer from './slices/leadSlice';
import emailReducer from './slices/emailSlice';
import projectReducer from './slices/projectSlice';
import followUpReducer from './slices/followUpSlice';
import settingsReducer from './slices/settingsSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    leads: leadReducer,
    emails: emailReducer,
    projects: projectReducer,
    followUps: followUpReducer,
    settings: settingsReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['emails/compose/pending'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
