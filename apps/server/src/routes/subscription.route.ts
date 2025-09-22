import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { createSubscription, getSubscriptionDetails } from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyAuth);

router.get("/", getSubscriptionDetails);
router.post("/create", createSubscription);

export default router;
