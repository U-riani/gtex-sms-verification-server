// controllers/smsController.js
import { SMS } from "@gosmsge/gosmsge-node";
import dotenv from "dotenv";
// import User from "../models/User.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import User from "../models/User.js";
import crypto from "crypto";
import Otp from "../models/Otp.js";

// const sms = new SMS(process.env.GTEX_API_KEY);
const sms = new SMS(process.env.GOSMS_API_KEY);
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

export const sendOtp = async (req, res) => {
  try {
    const { phoneNumber, selectedBrands, language } = req.body;
    const normalizedPhone = String(phoneNumber || "")
      .replace(/\D/g, "")
      .trim();

    const safeLang = ["en", "ka", "ru"].includes(language) ? language : "en";

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        error: "Phone number required",
      });
    }

    // // 🚫 BLOCK DUPLICATE PHONE EARLY
    // const existingUser = await User.findOne({
    //   "phone.full": normalizedPhone,
    // });

    // if (existingUser) {
    //   return res.status(409).json({
    //     success: false,
    //     error: "Phone number already registered",
    //   });
    // }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    const normalizedBrands = (selectedBrands || []).map((b) =>
      encodeURIComponent(b.trim())
    );

    const safeBrands = Array.isArray(selectedBrands)
      ? selectedBrands.map((b) => b.trim()).sort()
      : [];

    const urlBrands =
      normalizedBrands && normalizedBrands.length > 0
        ? normalizedBrands.join("-")
        : "default";

    await Otp.findOneAndUpdate(
      { phoneNumber: normalizedPhone },
      {
        otpHash,
        brands: safeBrands,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    //     await sms.send(
    //       normalizedPhone,
    //       `Your verification code is:
    // ${otp}
    // Please read Terms & Conditions:
    // http://gtex-sms-verification.netlify.app/terms-and-conditions/${urlBrands}`,
    //       "GTEX"
    //     );

    await sms.send(
      normalizedPhone,
      `Your verification code is: 
${otp}
Please read Terms & Conditions:
http://gtex-sms-verification.netlify.app/${safeLang}/terms-and-conditions/${urlBrands}`,
      "UniStep"
    );

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, code, brands } = req.body;

    const normalizedPhone = String(phoneNumber || "")
      .replace(/\D/g, "")
      .trim();

    if (!normalizedPhone || !code) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (!Array.isArray(brands)) {
      return res.status(400).json({
        success: false,
        message: "Missing verification context",
      });
    }
    const record = await Otp.findOne({ phoneNumber: normalizedPhone });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Code expired or not found",
      });
    }

    const safeRequestBrands = brands.map((b) => b.trim()).sort();
    const safeRecordBrands = record.brands.slice().sort();

    const sameBrands =
      safeRequestBrands.length === safeRecordBrands.length &&
      safeRequestBrands.every((b, i) => b === safeRecordBrands[i]);
    if (!sameBrands) {
      await Otp.deleteOne({ phoneNumber: normalizedPhone });
      return res.status(400).json({
        success: false,
        message: "Verification context changed",
      });
    }

    if (Date.now() > record.expiresAt.getTime()) {
      await Otp.deleteOne({ phoneNumber: normalizedPhone });
      return res.status(400).json({
        success: false,
        message: "Code expired",
      });
    }

    const isValid = hashOtp(code) === record.otpHash;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid code",
      });
    }

    await Otp.deleteOne({ phoneNumber: normalizedPhone });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const createSender = async (req, res) => {
  try {
    const result = await sms.createSender("MyCompany");
    return res.json({
      success: true,
      result,
    });
  } catch (err) {
    console.log("Error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
