import { SMS } from "@gosmsge/gosmsge-node";
import dotenv from "dotenv";
dotenv.config();

const sms = new SMS(process.env.GOSMS_API_KEY);

export const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber)
      return res.status(400).json({ error: "Phone number required" });

    // Call GoSMS OTP API
    const result = await sms.sendOtp(phoneNumber);

    console.log("OTP sent:", result);

    // result.hash MUST be stored on your server, tied to phoneNumber
    return res.json({
      success: true,
      hash: result.hash,
      balance: result.balance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, hash, code } = req.body;

    if (!phoneNumber || !hash || !code)
      return res.status(400).json({ error: "Missing fields" });

    const result = await sms.verifyOtp(phoneNumber, hash, code);

    if (result.verify) {
      return res.json({ success: true });
    }

    return res.status(400).json({
      success: false,
      message: result.error || "Invalid code",
    });
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
