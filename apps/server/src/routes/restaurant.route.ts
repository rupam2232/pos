import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import {
  checkUniqueRestaurantSlug,
  createRestaurant,
  addRestaurantCategory,
  getAllRestaurantofOwner,
  getRestaurantBySlug,
  getRestaurantofStaff,
  removeRestaurantCategories,
  setRestaurantTax,
  toggleRestaurantOpenStatus,
  updateRestaurantDetails,
  updateRestaurantLogo,
  getRestaurantCategories,
  getStaffDashboardStats,
  getOwnerDashboardStats,
} from "../controllers/restaurant.controller.js";
import { rateLimit } from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isSubscriptionActive } from "../middlewares/subscriptionCheck.middleware.js";

const router = Router();

const createLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  limit: 1, // Limit each IP to 1 requests per `window` (here, per 1 minutes).
  standardHeaders: "draft-8", //draft-8: `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  handler: () => {
    throw new ApiError(429, "Too many attempts, please try again in a minute.");
  },
});

const logoUploadLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  limit: 2, // Limit each IP to 2 requests per `window` (here, per 1 minutes).
  standardHeaders: "draft-8", //draft-8: `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  handler: () => {
    throw new ApiError(429, "Too many attempts, please try again in a minute.");
  },
});

const isProduction = process.env?.NODE_ENV === "production";

router.post(
  "/create",
  isProduction ? createLimit : (req, res, next) => next(),
  verifyAuth,
  isProduction ? isSubscriptionActive : (req, res, next) => next(),
  createRestaurant
);

router.get("/owner", verifyAuth, getAllRestaurantofOwner);
router.get("/staff", verifyAuth, getRestaurantofStaff);

router
  .route("/:slug")
  .get(getRestaurantBySlug)
  .patch(verifyAuth, updateRestaurantDetails);
router.post(
  "/:slug/toggle-open-status",
  verifyAuth,
  toggleRestaurantOpenStatus
);
router
  .route("/:slug/categories")
  .get(getRestaurantCategories)
  .post(verifyAuth, isProduction ? isSubscriptionActive : (req, res, next) => next(), addRestaurantCategory)
  .patch(verifyAuth, removeRestaurantCategories);

router.post("/:slug/tax", verifyAuth, setRestaurantTax);

router.get("/:slug/staff-dashboard-stats", verifyAuth, getStaffDashboardStats);

router.get("/:slug/owner-dashboard-stats", verifyAuth, getOwnerDashboardStats);

router.get("/:slug/is-unique-slug", verifyAuth, checkUniqueRestaurantSlug);

router.post(
  "/:slug/update-logo",
  isProduction ? logoUploadLimit : (req, res, next) => next(),
  verifyAuth,
  upload.single("restaurantLogo"),
  updateRestaurantLogo
);

export default router;
