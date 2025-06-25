import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Payment } from "../models/payment.model.js";
import { Order } from "../models/order.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const razorpayWebhook = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new ApiError(400, "Webhook body is required");
  }
  const webhookSignature = req.get("X-Razorpay-Signature");
  //   const webhookEventId = req.get("X-Razorpay-Event-Id");
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSignature || !webhookSecret) {
    throw new ApiError(400, "Webhook signature or secret is missing");
  }
  if (
    !validateWebhookSignature(
      req.body,
      webhookSignature,
      webhookSecret
    )
  ) {
    throw new ApiError(400, "Invalid webhook signature");
  }

  // Parse the webhook body
  const webhookBody = JSON.parse(req.body.toString("utf8"));
  //   const event = webhookBody.event;
  const paymentEntity = webhookBody.payload?.payment?.entity;
  //   const paymentId = paymentEntity.id;
  //   const orderId = paymentEntity.order_id;
  //   const id = paymentEntity.notes.id;
  //   const receipt = paymentEntity.notes.receipt;

  if (!paymentEntity) {
    throw new ApiError(400, "Payment entity is missing in webhook body");
  }

  const paymentDoc = await Payment.findOne({
    gatewayOrderId: paymentEntity.order_id,
    paymentGateway: "Razorpay",
    status: "pending",
    orderId: paymentEntity.notes.orderId,
  });
  if (!paymentDoc) {
    throw new ApiError(404, "Payment record not found for this order_id");
  }

  const order = await Order.findById(paymentDoc.orderId);
  if (!order) {
    res.status(200).json(new ApiResponse(200, true, "Order not found"));
  } else if (order?.isPaid === true) {
    paymentDoc.status = "paid";
    await paymentDoc.save();
    res.status(200).json(new ApiResponse(200, true, "Order already paid"));
  } else {
    if (paymentEntity.status === "captured") {
      paymentDoc.status = "paid";
      paymentDoc.gatewayPaymentId = paymentEntity.id;
      paymentDoc.transactionId =
        paymentEntity.acquirer_data?.upi_transaction_id ||
        paymentEntity.acquirer_data?.rrn ||
        null;
      await paymentDoc.save();

      // Update order status to paid
      order.isPaid =  true;
      await order.save();
    } else if (paymentEntity.status === "failed") {
      paymentDoc.status = "failed";
      await paymentDoc.save();
    }
    res
      .status(200)
      .json(new ApiResponse(200, true, "Webhook processed successfully"));
  }
});
