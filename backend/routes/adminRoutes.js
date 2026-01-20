import express from "express";
import bcrypt from "bcryptjs"; 
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js"; 
import LocationHistory from "../models/LocationHistory.js";

const router = express.Router();

// GET TODAY'S SUMMARY
router.get("/attendance", auth, isAdmin, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const users = await User.find({ role: "user" }).select("name email");
    const todayRecords = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const summary = users.map(user => {
      const record = todayRecords.find(r => r.user.toString() === user._id.toString());
      return {
        _id: user._id,
        user: { name: user.name, email: user.email },
        date: record ? record.date : new Date(),
        image: record ? record.image : null,
        marked: !!record
      };
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: "Error fetching attendance summary" });
  }
});

// GET ALL USERS
router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// UPDATE USER (Necessary for Edit Button)
router.put("/users/:id", auth, isAdmin, async (req, res) => {
  try {
    const { name, email, bankAccount, address } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, bankAccount, address },
      { new: true }
    ).select("-password");
    
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
});

// DELETE USER (Necessary for Delete Button)
router.delete("/users/:id", auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

// GET LOCATION HISTORY
router.get("/location-history/:userId", auth, isAdmin, async (req, res) => {
  try {
    const { date } = req.query; 
    if (!date) return res.status(400).json({ message: "Date is required" });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const history = await LocationHistory.find({
      userId: req.params.userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: 1 }); 

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Error fetching location history" });
  }
});

// FULL REPORT
router.get("/attendance/full-report", auth, isAdmin, async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("user", "name email")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate report" });
  }
});

// CREATE USER
router.post("/create-user", auth, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role, address, bankAccount } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name, email, password: hashedPassword,
      role: role || "user", 
      address, bankAccount, active: true 
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;