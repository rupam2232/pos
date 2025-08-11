import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type OrderHistoryItem = {
  restaurantSlug: string;
  orderIds: string[];
};

const orderHistorySlice = createSlice({
  name: "orderHistory",
  initialState: [] as OrderHistoryItem[],
  reducers: {
    addOrder: (
      state,
      action: PayloadAction<{ restaurantSlug: string; orderId: string }>
    ) => {
      const { restaurantSlug, orderId } = action.payload;
      const existingRestaurant = state.find(
        (item) => item.restaurantSlug === restaurantSlug
      );
      if (existingRestaurant) {
        const existingOrderId = existingRestaurant.orderIds.find(
          (id) => id === orderId
        );
        if (!existingOrderId) {
          existingRestaurant.orderIds.unshift(orderId);
        }
      } else {
        state.push({
          restaurantSlug,
          orderIds: [orderId],
        });
      }
    },
    clearOrderHistory: () => {
      return [];
    },
  },
});

export const { addOrder, clearOrderHistory } = orderHistorySlice.actions;

export default orderHistorySlice.reducer;
