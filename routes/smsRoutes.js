import express from "express";
import { sendOtp, createSender, verifyOtp } from "../controllers/smsController.js";

const router = express.Router();

router.post("/create-sender", createSender);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
