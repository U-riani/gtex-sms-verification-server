// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Import dependencies
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import smsRoutes from "./routes/smsRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Connect to MongoDB
connectDB();

const app = express();

// Configure CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://gtex-sms-verification.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);


// Parse JSON bodies
app.use(express.json());
 
// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

// Routes
app.use("/api/sms", smsRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "title2" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
