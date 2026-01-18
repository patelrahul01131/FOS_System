import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();
router.use(auth, role("admin"));

router.post("/users", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  await User.create({ ...req.body, password: hash });
  res.sendStatus(201);
});

router.get("/users", async (req, res) => {
  res.json(await User.find());
});

router.put("/users/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.sendStatus(200);
});

export default router;
