// server/routes/adminSmsCampaignRoutes.js
import express from "express";
import { requireAdmin } from "../middlewares/adminAuth.js";
import { startSmsCampaign, listCampaigns, getCampaignDetails } from "../controllers/smsCampaignController.js";

const router = express.Router();

router.use(requireAdmin);

router.post("/", startSmsCampaign);
router.get("/", listCampaigns);
router.get("/:id", getCampaignDetails);
export default router;
