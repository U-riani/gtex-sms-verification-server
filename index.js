// 1) Load env FIRST
import dotenv from "dotenv";
dotenv.config();

// 2) Import core dependencies
import express from "express";
import cors from "cors";
// import mongoose from "mongoose";
import connectDB from "./config/db.js";
import smsRoutes from "./routes/smsRoutes.js";
import userRoutes from "./routes/userRoutes.js";

connectDB();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://gtex-sms-verification.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());

// 5) Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log("MongoDB error:", err));

// // 6) Import routes AFTER dotenv is loaded
// import smsRoutes from "./routes/smsRoutes.js";
// import userRoutes from "./routes/userRoutes.js";

// 7) Use routes
app.use("/api/sms", smsRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  try {
    res.json({ message: "title2" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// // FIX: server starts ONLY after Mongo connects
// const startServer = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 5000, // optional but recommended
//     });

//     console.log("MongoDB connected");

//     app.listen(process.env.PORT, () => {
//       console.log(`Server running on port ${process.env.PORT}`);
//     });
//   } catch (err) {
//     console.error("MongoDB connection failed:", err.message);
//   }
// };

// startServer();
