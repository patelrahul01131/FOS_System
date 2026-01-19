import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
// import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/userRoutes.js";
import initSocket from "./sockets/socket.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fos";

app.use(cors({
  origin: "https://satnamsales.vercel.app", // Your specific Vercel URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// app.use(cors());
// app.use(cors({ origin: "https://satnamsales.vercel.app" }));
app.use(express.json());

// mongoose.connect("mongodb://127.0.0.1:27017/fos");

mongoose.connect(dbURI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    // On Render, we want to know why it's failing
    if (dbURI.includes("127.0.0.1")) {
      console.error("HINT: Your app is trying to connect to localhost instead of Atlas!");
    }
  });

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/api/users/test", (req, res) => {
    res.json({ message: "Route is reachable!" });
});

app.get("/", (req, res) => {
  res.status(200).send("FOS Backend Server is Live and Running!");
});

initSocket(server);

// server.listen(5000, () => console.log("Backend running on 5000"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
