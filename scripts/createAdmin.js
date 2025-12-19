import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

await connectDB();

const email = "admin@gtex.ge";
const password = "Test123"; // change immediately after login

const exists = await Admin.findOne({ email });
if (exists) {
  console.log("Admin already exists");
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 10);

await Admin.create({
  email,
  passwordHash,
});

console.log("Admin created");
process.exit(0);
