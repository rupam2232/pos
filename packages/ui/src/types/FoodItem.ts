export interface FoodVariant extends Document {
  _id: string; // Unique identifier for the variant
  variantName: string; // Name/label of the variant (e.g., "Large", "Spicy")
  price: number; // Price for this variant
  description?: string; // Description for this variant
  discountedPrice?: number; // Optional final price after discount for this variant
  isAvailable: boolean; // Whether this variant is currently available
}

export interface FoodItem {
  _id: string; // Unique identifier for the food item
  foodName: string; // Name of the food item
  price: number; // Base price of the food item
  discountedPrice?: number; // Optional final price after discount
//   hasVariants: boolean; // Whether this item has variants
//   variants: FoodVariant[]; // Array of variants (if any)
  imageUrls?: string[]; // Optional array of image URLs
//   category?: string; // Optional category (e.g., "Indian", "Snacks")
  foodType: "veg" | "non-veg"; // Type of the food (veg or non-veg)
//   description?: string; // Optional description of the food item
//   tags?: string[]; // Optional tags for search/filtering (e.g., "Spicy", "Veg")
  isAvailable: boolean; // Whether the item is currently available
  createdAt: Date; // Timestamp when the document was first created (set automatically, never changes)
}

export type AllFoodItems = {
  foodItems: FoodItem[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
};
