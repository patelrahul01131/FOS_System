import mongoose from "mongoose";

const LiveLocationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  lat: Number,
  lng: Number,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("LiveLocation", LiveLocationSchema);
