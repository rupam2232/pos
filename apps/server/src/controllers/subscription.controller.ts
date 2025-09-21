import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { razorpay } from "../utils/razorpay.js";

export const getSubscriptionDetails = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ userId: req.user!._id });
  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscription,
        "Subscription details fetched successfully"
      )
    );
});

export const createOrUpdateSubscription = asyncHandler(async (req, res) => {
  const {
    plan,
    isTrial,
    trialExpiresAt,
    subscriptionStartDate,
    subscriptionEndDate,
  } = req.body;

  const subscription = await Subscription.findOneAndUpdate(
    { userId: req.user!._id },
    {
      plan,
      isTrial,
      trialExpiresAt,
      subscriptionStartDate,
      subscriptionEndDate,
    },
    { new: true, upsert: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscription,
        "Subscription created/updated successfully"
      )
    );
});

export const createSubscription = asyncHandler(async (req, res) => {
  if (!req.body || !req.body.plan) {
    throw new ApiError(400, "Plan is required to create a subscription");
  }
  let amount = 300;
  if (req.body.plan === "starter") {
    amount = 300;
  } else if (req.body.plan === "medium") {
    amount = 500;
  } else if (req.body.plan === "pro") {
    amount = 800;
  } else {
    throw new ApiError(400, "Invalid plan selected");
  }

  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: `receipt_${Math.random().toString(36).substring(2, 15)}`,
    notes: {
      email: req.user!.email,
    },
  };

  const order = await razorpay.orders.create(options);

  res
    .status(201)
    .json(new ApiResponse(201, order, "Razorpay order created successfully"));
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ userId: req.user!._id });
  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }
  await subscription.deleteOne();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Subscription canceled successfully"));
});
