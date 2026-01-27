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
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: startOfDay }
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

// POST: Save new attendance (with duplicate check)
router.post("/", auth, async (req, res) => {
  try {
    const { image, lat, lng } = req.body;

    // 1. SET YOUR OFFICE LOCATION HERE
    const OFFICE_LAT = 24.262040676509187; 
    const OFFICE_LNG = 72.20312228155572;
    const MAX_DISTANCE = 1000; // Allowed radius in meters

    // 2. Validate Location
    if (!lat || !lng) {
        return res.status(400).json({ message: "Location access is required for attendance." });
    }

    const distance = getDistance(lat, lng, OFFICE_LAT, OFFICE_LNG);

    if (distance > MAX_DISTANCE) {
      return res.status(403).json({ 
        message: `Denied. You are ${Math.round(distance)}m away from the office.` 
      });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const newAttendance = new Attendance({
      user: req.user.id,
      image,
      date: todayStr,
      location: { lat, lng }
    });

    await newAttendance.save();
    res.status(201).json({ message: "Attendance marked successfully" });
  } catch (err) {
    if (err.code === 11000) {
        return res.status(400).json({ message: "Attendance already marked for today!" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

const markAttendance = async () => {
  if (!navigator.geolocation) {
    return setMessage("Geolocation is not supported by your browser.");
  }

  // Requesting high accuracy location
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const img = canvas.toDataURL("image/jpeg");

    try {
      // Sending image along with coordinates
      await api.post("/attendance", { 
        image: img, 
        lat: latitude, 
        lng: longitude 
      });
      
      setMarked(true);
      setImage(img);
      setMessage("Attendance marked successfully ✅");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error saving attendance");
    }
  }, (err) => {
    setMessage("Please allow location access to mark attendance.");
  }, { enableHighAccuracy: true });
};

export default router;