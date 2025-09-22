import {
  validatePaymentVerification,
  validateWebhookSignature,
} from "razorpay/dist/utils/razorpay-utils.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Payment } from "../models/payment.model.js";
import { Order } from "../models/order.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { SubscriptionHistory } from "../models/subscriptionHistory.model.js";
import { startSession } from "mongoose";

export const razorpayWebhook = asyncHandler(async (req, res, next) => {
  if (!req.body) {
    throw new ApiError(400, "Webhook body is required");
  }
  // Start a MongoDB session for transaction
  const session = await startSession();
  try {
    session.startTransaction();
    const webhookSignature = req.get("X-Razorpay-Signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSignature || !webhookSecret) {
      throw new ApiError(400, "Webhook signature or secret is missing");
    }
    if (
      !validateWebhookSignature(
        JSON.stringify(req.body),
        webhookSignature,
        webhookSecret
      )
    ) {
      throw new ApiError(400, "Invalid webhook signature");
    }

    const webhookBody = req.body;
    const paymentEntity = webhookBody.payload?.payment?.entity;
    const webhookEvent = webhookBody.event;

    if (!paymentEntity || !webhookEvent) {
      throw new ApiError(400, "Invalid webhook payload");
    }

    if (
      webhookEvent !== "payment.captured" &&
      webhookEvent !== "payment.failed"
    ) {
      res
        .status(200)
        .json(new ApiResponse(200, true, "Event not relevant for processing"));
    } else if (webhookEvent === "payment.captured") {
      if (paymentEntity.status !== "captured") {
        throw new ApiError(400, "Payment status is not captured");
      }
      if (paymentEntity.notes?.paymentType === "subscription") {
        const period = paymentEntity.notes.period ?? "monthly";
        if (period === "monthly") {
          if (paymentEntity.notes?.plan === "starter") {
            if (paymentEntity.amount !== 30000) {
              throw new ApiError(
                400,
                "Payment amount does not match the plan selected"
              );
            }
          } else if (paymentEntity.notes?.plan === "medium") {
            if (paymentEntity.amount !== 50000) {
              throw new ApiError(
                400,
                "Payment amount does not match the plan selected"
              );
            }
          } else if (paymentEntity.notes?.plan === "pro") {
            if (paymentEntity.amount !== 80000) {
              throw new ApiError(
                400,
                "Payment amount does not match the plan selected"
              );
            }
          } else {
            throw new ApiError(400, "Invalid plan selected");
          }
        } else {
          throw new ApiError(400, "Invalid period selected");
        }

        const subscription = await Subscription.findOneAndUpdate(
          { userId: paymentEntity.notes?.userId },
          {
            isSubscriptionActive: true,
            plan: paymentEntity.notes?.plan,
            isTrial: false,
            trialExpiresAt: undefined,
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(
              Date.now() +
                (period === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
            ),
          },
          { new: true, upsert: true }
        ).session(session);

        if (!subscription) {
          throw new ApiError(500, "Failed to create or update subscription");
        }

        await SubscriptionHistory.create(
          [
            {
              userId: subscription.userId,
              plan: subscription.plan,
              amount: paymentEntity.amount / 100,
              isTrial: false,
              subscriptionStartDate: subscription.subscriptionStartDate,
              subscriptionEndDate: subscription.subscriptionEndDate,
              transactionId: paymentEntity.id,
              paymentGateway: "Razorpay",
            },
          ],
          { session }
        );
      } else if (paymentEntity.notes?.paymentType === "order") {
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
          res
            .status(200)
            .json(new ApiResponse(200, true, "Order already paid"));
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
            order.isPaid = true;
            await order.save();
          } else if (paymentEntity.status === "failed") {
            paymentDoc.status = "failed";
            await paymentDoc.save();
          }
        }
      }
    }
    // Commit transaction to save all changes atomically
    await session.commitTransaction();
    session.endSession();
    res
      .status(200)
      .json(new ApiResponse(200, true, "Webhook processed successfully"));
  } catch (error) {
    // Rollback transaction on error
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  if (
    !req.body ||
    !req.body.paymentId ||
    !req.body.orderId ||
    !req.body.signature
  ) {
    throw new ApiError(400, "paymentId, orderId and signature are required");
  }

  if (
    !validatePaymentVerification(
      { order_id: req.body.orderId, payment_id: req.body.paymentId },
      req.body.signature,
      process.env.RAZORPAY_KEY_SECRET!
    )
  ) {
    throw new ApiError(400, "Payment verification failed");
  }

  res
    .status(200)
    .json(new ApiResponse(200, true, "Payment verification successful"));
  // const paymentDoc = await Payment.findOne({
  //   gatewayOrderId: req.body.orderId,
  //   paymentGateway: "Razorpay",
  //   status: "pending",
  //   orderId: req.body.orderId,
  // });
  // if (!paymentDoc) {
  //   throw new ApiError(404, "Payment record not found for this orderId");
  // }
  // if (paymentDoc.status === "paid") {
  //    res
  //     .status(200)
  //     .json(new ApiResponse(200, paymentDoc, "Payment already verified"));
  //     return;
  // }
  // const payment = await razorpay.payments.fetch(req.body.paymentId);
  // if (payment.status === "captured") {
  //   paymentDoc.status = "paid";
  //   paymentDoc.gatewayPaymentId = payment.id;
  //   paymentDoc.transactionId =
  //     payment.acquirer_data?.upi_transaction_id ||
  //     payment.acquirer_data?.rrn ||
  //     null;
  //   await paymentDoc.save();
  // } else if (payment.status === "failed") {
  //   paymentDoc.status = "failed";
  //   await paymentDoc.save();
  //   throw new ApiError(400, "Payment verification failed");
  // }
  // res
  //   .status(200)
  //   .json(new ApiResponse(200, paymentDoc, "Payment verified successfully"));
});
