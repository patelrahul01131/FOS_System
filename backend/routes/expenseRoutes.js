import express from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import Expense from "../models/Expense.js";

const router = express.Router();

// 1. Get own expenses
router.get("/my-expenses", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// 2. Admin Report
router.get("/report", auth, isAdmin, async (req, res) => {
  try {
    const { userId, type, range, startDate, endDate, category } = req.query;
    let query = {};

    if (category === "office") {
      query.user = null; 
    } else if (userId) {
      query.user = userId;
    } else {
      query.user = { $ne: null }; 
    }

    if (type) query.type = type;

    let start = new Date();
    if (range === "monthly") {
      start.setDate(1);
      query.date = { $gte: start.setHours(0,0,0,0) };
    } else if (range === "halfyear") {
      start.setMonth(start.getMonth() - 6);
      query.date = { $gte: start.setHours(0,0,0,0) };
    } else if (range === "yearly") {
      start.setMonth(0, 1);
      query.date = { $gte: start.setHours(0,0,0,0) };
    } else if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate).setHours(0,0,0,0), 
        $lte: new Date(endDate).setHours(23,59,59,999) 
      };
    }

    const expenses = await Expense.find(query)
      .populate("user", "name email")
      .sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching report" });
  }
});

// 3. Today's Dashboard List
router.get("/today", auth, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// 4. Add Expense
router.post("/", auth, async (req, res) => {
  try {
    const { type, amount, note } = req.body;
    const newExpense = new Expense({
      user: req.user.id, 
      type,
      amount: Number(amount),
      note,
      date: new Date()
    });

    await newExpense.save();
    res.status(201).json({ message: "Expense added successfully", expense: newExpense });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// 5. Update Expense (Admin or Owner)
router.put("/:id", auth, async (req, res) => {
  try {
    const { type, amount, note } = req.body;
    let expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const isOwner = expense.user && expense.user.toString() === req.user.id;
    const isAdminUser = req.user.role === 'admin';

    if (!isOwner && !isAdminUser) {
      return res.status(401).json({ message: "User not authorized to modify this record" });
    }

    expense.type = type || expense.type;
    expense.amount = amount ? Number(amount) : expense.amount;
    expense.note = note !== undefined ? note : expense.note;

    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// 6. Delete Expense (Admin or Owner)
router.delete("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const isOwner = expense.user && expense.user.toString() === req.user.id;
    const isAdminUser = req.user.role === 'admin';

    if (!isOwner && !isAdminUser) {
      return res.status(401).json({ message: "User not authorized to delete this record" });
    }

    await expense.deleteOne();
    res.json({ message: "Expense removed" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;