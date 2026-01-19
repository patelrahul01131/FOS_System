import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

await mongoose.connect("mongodb://127.0.0.1:27017/fos");

// await User.deleteMany({});

// const adminPassword = await bcrypt.hash("123456789", 10);
// const userPassword = await bcrypt.hash("123456789", 10);

// await User.create([
//   {
//     name: "Admin",
//     email: "admin@123.com",
//     password: adminPassword,
//     role: "admin",
//     active: true
//   },
//   {
//     name: "Rahul Patel",
//     email: "rahul@gmail.com",
//     password: userPassword,
//     role: "user",
//     active: true,
//     profileImage: "https://i.pravatar.cc/150?img=12",
//     bankAccount: "123456789012",
//     address: "Ahmedabad, Gujarat, India"
//   }
// ]);

// console.log("✅ Admin & User seeded");
process.exit();
