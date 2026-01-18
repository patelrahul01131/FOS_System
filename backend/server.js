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

// app.use(cors());
app.use(cors({ origin: "https://your-frontend.vercel.app" }));
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/fos");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/api/users/test", (req, res) => {
    res.json({ message: "Route is reachable!" });
});

initSocket(server);

server.listen(5000, () => console.log("Backend running on 5000"));
