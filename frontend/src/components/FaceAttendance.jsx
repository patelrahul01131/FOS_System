import { useEffect, useRef, useState } from "react";
import api from "../services/api";

export default function FaceAttendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [active, setActive] = useState(false);
  const [marked, setMarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);

  // Helper to format distance for the UI
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return (meters / 1000).toFixed(2) + " km";
    }
    return Math.round(meters) + " m";
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setActive(false);
  };

  useEffect(() => {
    api.get("/attendance/today")
      .then(res => {
        if (res.data.marked) {
          setMarked(true);
          setImage(res.data.image);
          setMessage("Attendance already marked today ✅");
        }
      })
      .catch(err => console.error("Status check failed", err))
      .finally(() => setLoading(false));
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setActive(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      setMessage("Camera access denied. Please enable permissions.");
    }
  };

  const markAttendance = async () => {
    if (!navigator.geolocation) {
      return setMessage("Geolocation is not supported by your browser.");
    }

    setMessage("Verifying location...");

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      const OFFICE_LAT = 24.264434461721187; 
      const OFFICE_LNG = 72.18390649958799;
      const MAX_DISTANCE = 500; 

      const distance = getDistance(latitude, longitude, OFFICE_LAT, OFFICE_LNG);

      if (distance > MAX_DISTANCE) {
        stopCamera(); 
        // Logic: Format the distance based on whether it is >= 1000m
        const formattedDistance = formatDistance(distance);
        return setMessage(`Access Denied: You are ${formattedDistance} away from the office. Camera turned off.`);
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const img = canvas.toDataURL("image/jpeg");

      try {
        await api.post("/attendance", { image: img, lat: latitude, lng: longitude });
        stopCamera(); 
        setMarked(true);
        setImage(img);
        setMessage("Attendance marked for today ✅");
      } catch (err) {
        setMessage(err.response?.data?.message || "Error saving attendance");
      }
    }, (err) => {
      setMessage("Please enable Location access to mark attendance.");
    });
  };

  if (loading) return <div className="card">Checking status...</div>;

  if (marked) {
    return (
      <div className="attendance-success card">
        <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>
        {image && (
          <img src={image} alt="today" style={{ width: "200px", borderRadius: "8px" }} />
        )}
      </div>
    );
  }

  return (
    <div className="attendance-container">
      {!active ? (
        <button className="btn-primary" onClick={startCamera}>
          Open Camera to Mark Attendance
        </button>
      ) : (
        <div className="camera-box">
          <video ref={videoRef} autoPlay width="300" style={{ borderRadius: '8px' }} />
          <canvas ref={canvasRef} hidden />
          <div style={{ marginTop: '10px' }}>
            <button className="btn-success" onClick={markAttendance}>
              Capture & Mark Attendance
            </button>
            <button className="btn-secondary" onClick={stopCamera} style={{marginLeft: '10px'}}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {message && <p className="status-msg" style={{ color: message.includes('Denied') ? 'red' : 'inherit' }}>{message}</p>}
    </div>
  );
}