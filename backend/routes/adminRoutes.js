import express from "express";
import bcrypt from "bcryptjs"; 
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js"; 

const router = express.Router();

/**
 * @route   GET /api/admin/attendance
 * @desc    Get today's attendance summary for all users (Present/Absent)
 */
router.get("/attendance", auth, isAdmin, async (req, res) => {
  try {
    // 1. Get the start and end of the current day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 2. Fetch all users with the role 'user'
    const users = await User.find({ role: "user" }).select("name email");

    // 3. Fetch attendance records specifically for today
    const todayRecords = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // 4. Map through all users to check if they have a record for today
    const summary = users.map(user => {
      const record = todayRecords.find(r => r.user.toString() === user._id.toString());
      return {
        _id: user._id, // Keep the ID for React keys
        user: { name: user.name, email: user.email }, // Matches your frontend .user?.name
        date: record ? record.date : new Date(), // Use record date or today's date
        image: record ? record.image : null,
        marked: !!record // Extra flag for frontend styling (Optional)
      };
    });

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching attendance summary" });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get list of all users for the UserList page
 */
router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/attendance/full-report", auth, isAdmin, async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("user", "name email") // Join with User data
      .sort({ date: -1 }); // Newest first
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate report" });
  }
});

/**
 * @route   POST /api/admin/create-user
 * @desc    Admin manually creating a new user account
 */
router.post("/create-user", auth, isAdmin, async (req, res) => {
  try {
    // Destructured bankAccount from req.body
    const { name, email, password, role, address, bankAccount } = req.body;

    // 1. Validation
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Create Instance with bankAccount
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user", 
      address,
      bankAccount, // Saved to database
      active: true 
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;