import express from "express";
import {
  registerUser,
  updateUser,
  getAllUsers,
  getUser,
  getPaginatedUsers,
} from "../controllers/userController.js";

const router = express.Router();
// 🔥 HARD STOP OPTIONS FOR THIS ROUTER
router.options("*", (req, res) => {
  res.sendStatus(204);
});
router.post("/register", registerUser);
router.get("/", getAllUsers);
router.get("/paginated", getPaginatedUsers);
router.get("/:id", getUser);
router.patch("/:id", updateUser);

export default router;
 