//server/routes/adminRoutes.js
import express from "express";
import { requireAdmin } from "../middlewares/adminAuth.js";
import {
  getPaginatedUsers,
  getUser,
  updateUser,
} from "../controllers/userController.js";
import { advancedUserSearch } from "../controllers/adminUserAdvancedController.js";

const router = express.Router();

// Protect EVERYTHING below
router.use(requireAdmin);

router.get("/paginated", requireAdmin, getPaginatedUsers);
router.get("/:id", requireAdmin, getUser);
router.patch("/:id", requireAdmin, updateUser);
router.post("/advanced-search", requireAdmin, advancedUserSearch);

export default router;
