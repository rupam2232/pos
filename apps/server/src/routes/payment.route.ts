import { Router } from "express";
import { razorpayWebhook } from "../controllers/payment.controller.js";
import express from "express";

const router = Router();

// Webhook route for Razorpay payments
router.post(
  "/razorpay/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

export default router;