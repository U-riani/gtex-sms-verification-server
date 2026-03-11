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
  getSegmentById,
} from "../controllers/segmentController.js";
import { requireAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

router.use(requireAdmin);

router.get("/segments", listSegments);
router.get("/segments/:id", getSegmentById);
router.get("/segments/:id/users", getSegmentUsers);
router.post("/segments", createSegment);
router.post("/segments/undo", undoRemoveUserFromSegment);
router.post("/segments/:id/users", addUsersToSegment);
router.delete("/segments/:segmentId/users/:userId", removeUserFromSegment);
router.delete("/segments/:id", deleteSegment);
export default router;
