import express from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js"; // <--- ADD THIS IMPORT
import Expense from "../models/Expense.js";

const router = express.Router();

// 1. User: Get their own past expenses
router.get("/my-expenses", auth, async (req, res) => {
  try {
    // Correctly filter by the logged-in user's ID
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// 2. Admin: Get filtered reports (Requires isAdmin)
// backend/routes/expenseRoutes.js

// This matches: GET http://localhost:5000/api/expenses/report
router.get("/report", auth, isAdmin, async (req, res) => {
  try {
    const { userId, type, range, startDate, endDate, category } = req.query;
    let query = {};

    // 1. Filter by Category
    if (category === "office") {
      query.user = null; 
    } else if (userId) {
      query.user = userId;
    } else {
      query.user = { $ne: null }; 
    }

    if (type) query.type = type;

    // 2. Date Filtering Logic
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
    console.error(err);
    res.status(500).json({ message: "Error fetching report" });
  }
});

// 3. User: Get today's expenses for dashboard
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

// 4. POST: Add new expense
router.post("/", auth, async (req, res) => {
  try {
    const { type, amount, note } = req.body;
    const newExpense = new Expense({
      user: req.user.id, 
      type,
      amount: Number(amount), // Ensure it's a number
      note,
      date: new Date()
    });

    await newExpense.save();
    res.status(201).json({ message: "Expense added successfully", expense: newExpense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;