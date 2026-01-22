// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import smsRoutes from "./routes/smsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminSmsRoutes from "./routes/adminSmsRoutes.js";
import adminSmsTemplateRoutes from "./routes/adminSmsTemplateRoutes.js";
import adminSmsHistoryRoutes from "./routes/adminSmsHistoryRoutes.js";
import adminSmsCampain from "./routes/adminSmsCampaignRoutes.js";
import filterMetaRoutes from "./routes/filterMetaRoutes.js";
import segmentRoutes from "./routes/segmentRoutes.js";
import dashboard from "./routes/adminDashboardROutes.js";

connectDB();

const app = express();

// // 🔥 HARD STOP for preflight (Express 5 fix)
// app.use((req, res, next) => {
//   if (req.method === "OPTIONS") {
//     res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
//     res.header(
//       "Access-Control-Allow-Methods",
//       "GET,POST,PUT,DELETE,OPTIONS"
//     );
//     res.header(
//       "Access-Control-Allow-Headers",
//       "Content-Type, Authorization"
//     );
//     return res.sendStatus(204);
//   }
//   next();
// });

// ✅ CORS middleware
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://gtex-sms-verification.netlify.app",
      "https://sms-verification.netlify.app",
    ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Debug logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

app.use("/api/filters", filterMetaRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminSmsRoutes);
app.use("/api/admin/sms/templates", adminSmsTemplateRoutes);
app.use("/api/admin", adminSmsHistoryRoutes);
app.use("/api/admin", adminSmsCampain);
app.use("/api/admin/segments", segmentRoutes);
app.use("/api/admin/dashboard", dashboard);

app.get("/", (req, res) => {
  res.json({ message: "title2" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
