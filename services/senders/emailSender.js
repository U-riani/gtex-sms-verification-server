import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendEmail(cfg, user, message) {
  if (!user.email) throw new Error("User has no email");

  await transporter.sendMail({
    to: user.email,
    subject: cfg.subject || "Notification",
    text: message,
  });
}
