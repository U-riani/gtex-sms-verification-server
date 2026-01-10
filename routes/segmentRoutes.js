// routes/segmentRoutes.js
import express from "express";
import {
  createSegment,
  deleteSegment,
  getSegmentUsers,
  listSegments,
  removeUserFromSegment,
  addUsersToSegment,
  undoRemoveUserFromSegment,
} from "../controllers/segmentController.js";
import { requireAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

router.use(requireAdmin);

router.get("/", listSegments);
router.get("/:id/users", getSegmentUsers);
router.post("/", createSegment);
router.post("/undo", undoRemoveUserFromSegment);
router.post("/:id/users", addUsersToSegment);
router.delete("/:segmentId/users/:userId", removeUserFromSegment);
router.delete("/:id", deleteSegment);
export default router;
