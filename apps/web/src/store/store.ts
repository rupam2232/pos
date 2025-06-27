"use client";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { UserState } from "./authSlice";

type AuthState = {
  auth: {
    status: UserState["status"];
    user: UserState["user"];
  };
};

const preloadedState: AuthState = (() => {
  try {
    const stored = localStorage.getItem("authState");
    return stored
      ? JSON.parse(stored)
      : {
          auth: {
            status: false,
            user: null,
          },
        };
  } catch {
    return {
      auth: {
        status: false,
        user: null,
      },
    };
  }
})();

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  localStorage.setItem("authState", JSON.stringify(store.getState()));
});

// Infer the type of store
export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
