// server/services/sender/emailSemder.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendEmail(cfg, user, message) {
  if (!user?.email) {
    return {
      success: false,
      error: "User has no email",
    };
  }

  try {
    const info = await transporter.sendMail({
      to: user.email,
      subject: cfg.subject || "Notification",
      text: message,
    });

    return {
      success: true,
      providerId: info.messageId,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

