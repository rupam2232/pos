// Defines the Order no counter schema and model for MongoDB using Mongoose
import { Schema, model, Types, Document } from "mongoose";

/**
 * TypeScript interface for a OrderNoCounter document.
 * Represents the order number counter for a specific restaurant.
 */
export interface orderNoCounterSchema extends Document {
  restaurantId: Types.ObjectId;
  orderNo: number;
}

/**
 * Mongoose schema for the OrderNoCounter document.
 */
const orderNoCounterSchema: Schema<orderNoCounterSchema> = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      unique: true,
      immutable: true,
    },
    orderNo: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

/**
 * Mongoose model for the OrderNoCounter schema.
 */
export const OrderNoCounter = model<orderNoCounterSchema>(
  "OrderNoCounter",
  orderNoCounterSchema
);
