import { Router } from "express";
import { razorpayWebhook, verifyRazorpayPayment } from "../controllers/payment.controller.js";

const router = Router();

// Webhook route for Razorpay payments
router.post(
  "/razorpay/webhook",
  razorpayWebhook
);

router.post("/razorpay/verify", verifyRazorpayPayment);

export default router;