import express from "express";
import auth from "../middleware/auth.js";
import Expense from "../models/Expense.js";

const router = express.Router();
router.use(auth);

router.post("/expense", async (req, res) => {
  await Expense.create({ ...req.body, userId: req.user.id });
  res.sendStatus(201);
});

export default router;
