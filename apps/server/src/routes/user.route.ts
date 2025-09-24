import { Router } from "express";
import { getCurrentUser } from "../controllers/user.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router()

router.get("/me", verifyAuth, getCurrentUser)

export default router