import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !user.active) return res.sendStatus(401);
  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.sendStatus(401);
  const token = jwt.sign(
    { id: user._id, role: user.role },
    "FOS_SECRET"
  );
  res.json({ token, role: user.role });
});

export default router;
