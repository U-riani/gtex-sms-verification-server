// server/routes/adminSmsTemplateRoutes.js
import express from "express";
import { requireAdmin } from "../middlewares/adminAuth.js";
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  deleteTemplate,
  updateTemplate,
} from "../controllers/adminSmsTemplateController.js";

const router = express.Router();

router.use(requireAdmin);

router.get("/templates", getTemplates);
router.get("/templates/:id", getTemplateById);
router.post("/templates", createTemplate);
router.put("/templates/:id", updateTemplate);
router.delete("/templates/:id", deleteTemplate);

export default router;
