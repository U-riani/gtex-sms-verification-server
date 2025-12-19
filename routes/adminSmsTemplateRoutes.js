import express from "express";
import { requireAdmin } from "../middlewares/adminAuth.js";
import {
  getTemplates,
  createTemplate,
  deleteTemplate,
} from "../controllers/adminSmsTemplateController.js";

const router = express.Router();

router.use(requireAdmin);

router.get("/", getTemplates);
router.post("/", createTemplate);
router.delete("/:id", deleteTemplate);

export default router;
