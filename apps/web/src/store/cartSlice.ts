import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  foodId: string;
  variantName?: string;
  quantity: number;
  foodName: string; // Name of the food item
  price: number; // Base price of the food item
  discountedPrice?: number; // Optional final price after discount
  imageUrl?: string; // Optional array of image URLs
  foodType: "veg" | "non-veg"; // Type of the food (veg or non-veg)
  isAvailable: boolean; // Whether the item is currently available
  description?: string; // Optional description of the food item
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
