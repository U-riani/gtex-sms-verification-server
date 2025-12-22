// server/routes/adminSmsHistoryRoutes.js
import express from "express";
import { requireAdmin } from "../middlewares/adminAuth.js";
import {
  getSmsHistory,
  exportSmsHistoryCsv,
} from "../controllers/adminSmsHistoryController.js";
import { retryFailedSms } from "../controllers/adminSmsRetryController.js";
import { getTemplateStats } from "../controllers/adminSmsAnalyticsController.js";

const router = express.Router();

router.use(requireAdmin);

// history list
router.get("/sms/history", getSmsHistory);

// retry failed
router.post("/sms/retry", retryFailedSms);

// CSV export (GET!)
router.get("/sms/history/export", exportSmsHistoryCsv);

router.get("/sms/analytics/templates", getTemplateStats);

export default router;
