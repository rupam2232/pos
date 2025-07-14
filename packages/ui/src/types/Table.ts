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
  currentOrder: {
    orderId: string;
    status: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled";
    totalAmount: number;
    paymentMethod?: "online" | "cash";
    isPaid: boolean;
  }
}
