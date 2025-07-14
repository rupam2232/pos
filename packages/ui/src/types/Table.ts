export interface Table {
  _id: string;
  tableName: string;
  qrSlug: string;
  seatCount: number;
  isOccupied: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TableDetails extends Table {
  restaurantDetails: {
    restaurantName: string;
    address?: string;
    slug: string;
  };
  currentOrder?: {
    orderId: string;
    status:
      | "pending"
      | "preparing"
      | "ready"
      | "served"
      | "completed"
      | "cancelled";
    finalAmount: number;
    foodItems: {
      foodItemId: string;
      variantName?: string;
      quantity: number;
      price: number;
      finalPrice: number;
    }[];
    createdAt: string;
    updatedAt: string;
  };
}

export type AllTables = {
  tables: Table[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
};
