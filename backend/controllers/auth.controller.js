import User from "../models/User.js"; // Ensure this path matches your User model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// LOGIN FUNCTION
// backend/controllers/auth.controller.js

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user AND explicitly include the password field
    // The '+password' tells Mongoose to include the hidden field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log("User not found in database:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ... generate token and send response ...
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// REGISTER FUNCTION (To seed your first Admin in Atlas)
export const register = async (req, res) => {
  try {
    const { name, email, password, role, bankAccount, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      bankAccount,
      address
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
};