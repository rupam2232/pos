import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";
import { verifyOptionalAuth } from "../middlewares/optionalAuth.middleware.js";
import { isSubscriptionActive } from "../middlewares/subscriptionCheck.middleware.js";
import { createSubscription, getSubscriptionDetails } from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyAuth);

router.get("/", getSubscriptionDetails);
router.post("/create", createSubscription);

export default router;
