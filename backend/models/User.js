import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  active: { type: Boolean, default: true },

  // Profile Details
  profileImage: String,
  bankAccount: String,
  address: String,

  // Real-time Status
  online: { type: Boolean, default: false } // Added this for UserList status
}, { timestamps: true }); // Added for "Joined Date" tracking

export default mongoose.model("User", userSchema);