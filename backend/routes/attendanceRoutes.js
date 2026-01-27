import express from "express";
import auth from "../middleware/auth.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};

// GET: Check if user already marked attendance today
router.get("/today", auth, async (req, res) => {
  try {
    // Use local date string to match POST logic
    const todayStr = new Date().toLocaleDateString('en-CA'); 

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: todayStr
    });

    if (attendance) {
      return res.json({ marked: true, image: attendance.image });
    }
    res.json({ marked: false });
  } catch (err) {
    console.error("Error checking today's attendance:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST: Save new attendance
router.post("/", auth, async (req, res) => {
  try {
    const { image, lat, lng } = req.body;
    const OFFICE_LAT = 24.262040676509187; 
    const OFFICE_LNG = 72.20312228155572;
    const MAX_DISTANCE = 1000; 

    if (!lat || !lng) return res.status(400).json({ message: "Location required." });

    const distance = getDistance(lat, lng, OFFICE_LAT, OFFICE_LNG);
    if (distance > MAX_DISTANCE) {
      // Return 400 (Bad Request) instead of 403 to avoid auto-logout interceptors
      return res.status(400).json({ message: `Denied: Out of range.` });
    }

    const todayStr = new Date().toLocaleDateString('en-CA');

    const newAttendance = new Attendance({
      user: req.user.id,
      image,
      date: todayStr,
      location: { lat, lng }
    });

    await newAttendance.save();
    res.status(201).json({ message: "Attendance marked successfully" });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Already marked today!" });
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;