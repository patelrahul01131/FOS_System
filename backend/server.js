import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/userRoutes.js";
import initSocket from "./sockets/socket.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// Initialize Socket and attach to app for route access
const io = initSocket(server);
app.set("socketio", io); 

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fos";

app.use(cors({
  origin: "https://satnamsales.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

mongoose.connect(dbURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/expenses", expenseRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});