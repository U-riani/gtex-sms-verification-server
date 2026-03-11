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

router.get("/", getTemplates);
router.get("/:id", getTemplateById);
router.post("/", createTemplate);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);

export default router;
