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

export interface FullOrderDetailsType {
  _id: string;
  restaurant: {
    _id: string;
    restaurantName: string;
    slug: string;
    taxRate: number;
    isTaxIncludedInPrice: number;
    taxLabel: string | null;
  };
  status:
    | "pending"
    | "preparing"
    | "ready"
    | "served"
    | "completed"
    | "cancelled";
  finalAmount: number;
  isPaid: boolean;
  notes: string | null;
  externalOrderId: string | null;
  externalPlatform: string | null;
  kitchenStaffId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  table: {
    _id: string;
    tableName: string;
    qrSlug: string;
  };
  orderedFoodItems: {
    foodItemId: string;
    variantName: string;
    quantity: number;
    price: number;
    foodName: string;
    firstImageUrl: string | null;
    foodType: "veg" | "non-veg" | "vegan";
    isVariantOrder: boolean;
    variantDetails: {
      variantName: string;
      price: number;
      discountedPrice: number;
      isAvailable: boolean;
      _id: string;
    } | null;
  }[];
  createdAt: string;
}

//         "orderedFoodItems": [
//             {
//                 "foodItemId": "685048cd7f116d5a1a8669b7",
//                 "variantName": "Half Chicken Biriyani",
//                 "quantity": 2,
//                 "price": 40,
//                 "foodName": "Chicken Biriyani",
//                 "firstImageUrl": "https://res.cloudinary.com/rupam-mondal/image/upload/v1750091808/POS/menu-item-images/restaurants-683dec080648d6c1337131b2/y5xdb86uwoeyr2cmvrky.jpg",
//                 "foodType": "non-veg",
//                 "isVariantOrder": true,
//                 "variantDetails": {
//                     "variantName": "Half Chicken Biriyani",
//                     "price": 50,
//                     "discountedPrice": 40,
//                     "isAvailable": true,
//                     "_id": "685048cd7f116d5a1a8669b8"
//                 }
//             },
//             {
//                 "foodItemId": "685048cd7f116d5a1a8669b7",
//                 "variantName": "Egg Biriyani",
//                 "quantity": 1,
//                 "price": 45,
//                 "foodName": "Chicken Biriyani",
//                 "firstImageUrl": "https://res.cloudinary.com/rupam-mondal/image/upload/v1750091808/POS/menu-item-images/restaurants-683dec080648d6c1337131b2/y5xdb86uwoeyr2cmvrky.jpg",
//                 "foodType": "non-veg",
//                 "isVariantOrder": true,
//                 "variantDetails": {
//                     "variantName": "Egg Biriyani",
//                     "price": 60,
//                     "discountedPrice": 45,
//                     "isAvailable": true,
//                     "_id": "685048cd7f116d5a1a8669b9"
//                 }
//             }
//         ]
