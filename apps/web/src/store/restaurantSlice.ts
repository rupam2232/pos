import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RestaurantMinimalInfo } from "@repo/ui/types/Restaurant";

export interface RestaurantsState {
  restaurants: {
    _id: string;
    restaurantName: string;
    slug: string;
  }[];
  activeRestaurant?: RestaurantMinimalInfo | null;
}

const initialState: RestaurantsState = {
  restaurants: [],
  activeRestaurant: null,
};

const restaurantsSlice = createSlice({
  name: "restaurantsSlice",
  initialState,
  reducers: {
    setAllRestaurants(
      state,
      action: PayloadAction<RestaurantsState["restaurants"]>
    ) {
      state.restaurants = action.payload;
    },
    addRestaurant(
      state,
      action: PayloadAction<{
        _id: string;
        restaurantName: string;
        slug: string;
      }>
    ) {
      state.restaurants.push(action.payload);
    },
    setActiveRestaurant(
      state,
      action: PayloadAction<RestaurantsState["activeRestaurant"]>
    ) {
      state.activeRestaurant = action.payload;
    },
  },
});

export const { setAllRestaurants, addRestaurant, setActiveRestaurant } =
  restaurantsSlice.actions;
export default restaurantsSlice.reducer;
