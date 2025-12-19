// server/routes/adminSmsHistoryRoutes.js
import express from "express";
import { requireAdmin } from "../middlewares/adminAuth.js";
import { getSmsHistory } from "../controllers/adminSmsHistoryController.js";

const router = express.Router();

router.use(requireAdmin);
router.get("/sms/history", getSmsHistory);

export default router;
