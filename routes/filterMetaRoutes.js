// routes/filterMetaRoutes.js

import express from "express";
import { getDistinctValues } from "../controllers/filterMetaController.js";

const router = express.Router();

router.get("/distinct", getDistinctValues);

export default router;
