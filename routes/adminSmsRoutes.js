// server/routes/adminSmsRoutes.js
import express from "express";
import { requireAdmin } from "../middlewares/adminAuth.js";
import { sendBulkSms } from "../controllers/adminSmsController.js";

const router = express.Router();

router.post("/bulk", requireAdmin, sendBulkSms);

export default router;
