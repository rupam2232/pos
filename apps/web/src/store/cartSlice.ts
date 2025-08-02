import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  foodId: string;
  variantName?: string;
  quantity: number;
  restaurantSlug: string;
}

const initialState: CartItem[] = [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      state.push(action.payload);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      return state.filter((item) => item.foodId !== action.payload);
    },
    editCartItem: (
      state,
      action: PayloadAction<{ foodId: string; quantity: number }>
    ) => {
      const { foodId, quantity } = action.payload;
      const existingItem = state.find((item) => item.foodId === foodId);
      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },
    clearCart: () => {
      return [];
    },
  },
});

export const { addToCart, removeFromCart, editCartItem, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
