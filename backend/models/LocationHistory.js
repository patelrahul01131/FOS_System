import mongoose from "mongoose";

const LocationHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("LocationHistory", LocationHistorySchema);
