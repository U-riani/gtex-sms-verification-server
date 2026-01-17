// server/routes/adminSmsHistoryRoutes.js
import express from "express";
import { requireAdmin } from "../middlewares/adminAuth.js";
import {
  getSmsHistory,
  exportSmsHistoryCsv,
  advancedSmsHistorySearch,
} from "../controllers/adminSmsHistoryController.js";
import { retryFailedSms } from "../controllers/adminSmsRetryController.js";

const router = express.Router();

router.use(requireAdmin);

// history list
router.get("/sms/history", getSmsHistory);

// retry failed
router.post("/sms/retry", retryFailedSms);

// CSV export (GET!)
router.get("/sms/history/export", exportSmsHistoryCsv);

router.post("/sms/history/advanced", advancedSmsHistorySearch);

export default router;
