import { configureStore } from "@reduxjs/toolkit";
import userDetailReducer from "./Features/UserDetailSlice";
import settingReducer from "./Features/settingsSlice";
import adminReducer from "./Features/Adminslice";

export const store = configureStore({
  reducer: {
    userDetail: userDetailReducer,
    settings: settingReducer,
    admin: adminReducer,
  },
});
