// routes/segmentRoutes.js
import express from "express";
import {
dashboardStats
} from "../controllers/adminDashboardController.js";
import { requireAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

router.use(requireAdmin);

router.get("/", dashboardStats);

export default router;
