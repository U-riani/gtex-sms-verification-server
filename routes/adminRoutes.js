//routes/adminRoutes.js
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

router.get("/users/paginated", requireAdmin, getPaginatedUsers);
router.get("/users/:id", requireAdmin, getUser);
router.patch("/users/:id", requireAdmin, updateUser);
router.post("/users/advanced-search", requireAdmin, advancedUserSearch);

export default router;
