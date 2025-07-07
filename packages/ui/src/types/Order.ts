export type Orders = {
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

// "_id": "685049b3f877688ef3a5675a",
//                 "restaurantId": "68449fc5eda89068cd01468f",
//                 "table": {
//                     "_id": "6848755b9cfefd2e781368de",
//                     "tableName": "third table",
//                     "qrSlug": "468f-92ZX"
//                 },
//                 "status": "preparing",
//                 "finalAmount": 125,
//                 "isPaid": false,
//                 "externalPlatform": null,
//                 "createdAt": "2025-06-16T16:43:31.946Z",
//                 "orderedFoodItems": [
//                     {
//                         "foodItemId": "685048cd7f116d5a1a8669b7",
//                         "variantName": "Half Chicken Biriyani",
//                         "foodName": "Chicken Biriyani",
//                         "foodType": "non-veg",
//                         "isVariantOrder": true
//                     },
//                     {
//                         "foodItemId": "685048cd7f116d5a1a8669b7",
//                         "variantName": "Egg Biriyani",
//                         "foodName": "Chicken Biriyani",
//                         "foodType": "non-veg",
//                         "isVariantOrder": true
//                     }
//                 ]
//             },
