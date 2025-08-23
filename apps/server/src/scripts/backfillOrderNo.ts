// run this script using "node --loader ts-node/esm -r dotenv/config src/scripts/backfillOrderNo.ts" from /server directory
import connectDB from "../db/index.js";
import { Order } from "../models/order.model.js";
import { OrderNoCounter } from "../models/orderNoCounter.model.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({
  path: "./.env",
});

async function backfillOrderNo() {
  await connectDB();

  // Get all unique restaurant IDs
  const restaurantIds = await Order.distinct("restaurantId");

  for (const restaurantId of restaurantIds) {
    // Find all orders for this restaurant, sorted by creation date
    const orders = await Order.find({ restaurantId }).sort({ createdAt: 1 });

    let counter = 1;
    for (const order of orders) {
      if (order.orderNo === undefined || order.orderNo === null) {
        order.orderNo = counter;
        console.log(`Setting orderNo for order ${order._id} to ${order.orderNo}`);
        await order.save();
        console.log(`Updated order ${order._id} with orderNo ${order.orderNo} counter ${counter}`);
        counter++;
      } else {
        // If an order already has orderNo, make sure counter is always ahead
        if (order.orderNo >= counter) {
          counter = order.orderNo + 1;
        }
      }
    }

    // Sync the OrderNoCounter for this restaurant
    await OrderNoCounter.findOneAndUpdate(
      { restaurantId },
      { orderNo: counter - 1 },
      { upsert: true }
    );
    console.log(
      `Restaurant ${restaurantId}: Backfilled ${orders.length} orders, last orderNo: ${counter - 1}`
    );
  }

  console.log("Backfill complete!");
  await mongoose.disconnect();
  console.log("Disconnected from DB");
  process.exit(0);
}

backfillOrderNo().catch((err) => {
  console.error("Error during backfill:", err);
  process.exit(1);
});
