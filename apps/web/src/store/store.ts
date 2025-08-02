"use client";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { UserState } from "./authSlice";
import restaurantsReducer, { RestaurantsState } from "./restaurantSlice";
import cartReducer, { CartItem } from "./cartSlice";

type State = {
  auth: {
    status: UserState["status"];
    user: UserState["user"];
  };
  restaurantsSlice: RestaurantsState;
  cart: CartItem[];
};

const preloadedState: State = (() => {
  try {
    const stored = localStorage.getItem("userState");
    return stored
      ? JSON.parse(stored)
      : {
          auth: {
            status: false,
            user: null,
          },
          restaurantsSlice: {
            restaurants: [],
            activeRestaurant: null,
          },
          cart: [],
        };
  } catch {
    return {
      auth: {
        status: false,
        user: null,
      },
      restaurantsSlice: {
        restaurants: [],
        activeRestaurant: null,
      },
      cart: [],
    };
  }
})();

const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurantsSlice: restaurantsReducer,
    cart: cartReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  localStorage.setItem("userState", JSON.stringify(store.getState()));
});

// Infer the type of store
export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
