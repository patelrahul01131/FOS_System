import User from "../models/userRoutes.js"; // Ensure this path matches your User model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// LOGIN FUNCTION
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user and explicitly select password (if hidden in schema)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4. Send response
    res.status(200).json({
      token,
      role: user.role,
      name: user.name,
      userId: user._id
    });

  } catch (error) {
    console.error("Login Error:", error);
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