import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";
import { verifyOptionalAuth } from "../middlewares/optionalAuth.middleware.js";
import { isSubscriptionActive } from "../middlewares/subscriptionCheck.middleware.js";
import { getSubscriptionDetails } from "../controllers/subscription.controller.js";

const router = Router();

router.get("/", verifyAuth, getSubscriptionDetails);

export default router;
