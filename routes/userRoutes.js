import express from "express";
import {
  registerUser,
  updateUser,
  getAllUsers,
  getUser,
  getPaginatedUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/", getAllUsers);
router.get("/paginated", getPaginatedUsers);
router.get("/:id", getUser);
router.patch("/:id", updateUser);

export default router;
 