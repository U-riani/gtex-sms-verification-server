// server/routes/adminSmsCampaignRoutes.js
import express from "express";
import { requireAdmin } from "../middlewares/adminAuth.js";
import { startSmsCampaign, listCampaigns, getCampaignDetails } from "../controllers/smsCampaignController.js";

const router = express.Router();

router.use(requireAdmin);

router.post("/sms/campaigns", startSmsCampaign);
router.get("/sms/campaigns", listCampaigns);
router.get("/sms/campaigns/:id", getCampaignDetails);

export default router;
