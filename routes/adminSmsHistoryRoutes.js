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
router.get("/", getSmsHistory);
router.post("/retry", retryFailedSms);
router.get("/export", exportSmsHistoryCsv);
router.post("/advanced", advancedSmsHistorySearch);

export default router;
