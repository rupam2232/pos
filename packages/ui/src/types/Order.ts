export type Order = {
  _id: string;
  restaurantId: string;
  status:
    | "pending"
    | "preparing"
    | "ready"
    | "served"
    | "completed"
    | "cancelled";
  finalAmount: number;
  isPaid: boolean;
  externalPlatform: string | null;
  table: {
    _id: string;
    tableName: string;
    qrSlug: string;
  };
  orderedFoodItems: {
    foodItemId: string;
    variantName: string;
    foodName: string;
    foodType: "veg" | "non-veg" | "vegan";
    quantity: number;
    price: number;
    isVariantOrder: boolean;
  }[];
  createdAt: string;
};

export type OrderDetails = {
  orders: Order[];
  page: number;
  limit: number;
  totalPages: number;
  totalOrders: number;
} | null;