import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { ApiError } from "./utils/ApiError.js";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import restaurantRoute from "./routes/restaurant.route.js";
import mediaRoute from "./routes/media.route.js";
import tableRoute from "./routes/table.route.js";
import foodItemRoute from "./routes/foodItem.route.js";
import orderRoute from "./routes/order.route.js";
import otpRoute from "./routes/otp.route.js";
import paymentRoute from "./routes/payment.route.js";

// Create Express app instance
const app = express();

// Parse incoming JSON requests with a size limit
app.use(express.json({ limit: "16kb" }));
// Parse URL-encoded data with a size limit
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// Serve static files from the "public" directory
app.use(express.static("public"));
// Parse cookies from incoming requests
app.use(cookieParser());
// Add security-related HTTP headers
app.use(helmet());

// Determine if the app is running in development mode
const isDev = process.env.NODE_ENV === "development";
// Get allowed CORS origins from environment variable and trim whitespace
const allowedOrigins = process.env
  .CORS_ORIGIN!.split(",")
  .map((origin) => origin.trim());

// Configure CORS middleware with dynamic origin checking
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl) in development
      if (!origin && isDev) return callback(null, true);
      // Block requests with no origin in production
      if (!origin) return callback(null, false);
      // Allow requests from allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        // Block requests from disallowed origins
        return callback(new Error("CORS policy: Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies and credentials in CORS requests
  })
);

app.use("/api/v1/user", userRoute)
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/restaurant", restaurantRoute)
app.use("/api/v1/table", tableRoute)
app.use("/api/v1/media", mediaRoute)
app.use("/api/v1/food-item", foodItemRoute)
app.use("/api/v1/order", orderRoute)
app.use("/api/v1/otp", otpRoute)
app.use("/api/v1/payment", paymentRoute)

// Global error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the error stack trace for debugging
  if (err instanceof ApiError) {
    // Handle custom API errors
    res.status(err.status).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  } else {
    // Handle all other errors as internal server errors
    res.status(500).json({
      success: false,
      message: err.message ?? "Internal Server Error",
      errors: [],
    });
  }
});

// Export the configured Express app
export { app };
