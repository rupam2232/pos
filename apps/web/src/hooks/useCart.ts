import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  syncCartWithBackend,
  addCartItemToBackend,
  removeCartItemFromBackend,
  editCartItemInBackend,
} from "@/store/cartThunks";
import type { CartItem } from "@/store/cartSlice";
import { useMemo } from "react";

export function useCart(restaurantSlug: string) {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart);
  const cartItems = useMemo(
    () => cart.filter((item) => item.restaurantSlug === restaurantSlug),
    [cart, restaurantSlug]
  );

  const syncCart = () => dispatch(syncCartWithBackend(restaurantSlug));
  const addItem = (item: CartItem) => dispatch(addCartItemToBackend(item));
  const removeItem = (item: CartItem) =>
    dispatch(removeCartItemFromBackend(item));
  const editItem = (item: CartItem) => dispatch(editCartItemInBackend(item));

  return {
    cartItems,
    syncCart,
    addItem,
    removeItem,
    editItem,
  };
}
