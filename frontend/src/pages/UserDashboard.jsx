import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import FaceAttendance from "../components/FaceAttendance";
import UserProfile from "../components/UserProfile";
import { connectSocket } from "../services/socket";
import api from "../services/api";
import "../styles/dashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Offline");
  const [lastUpdate, setLastUpdate] = useState("--");
  const [user, setUser] = useState(null);
  const [todayExpenses, setTodayExpenses] = useState([]);
  const [locationError, setLocationError] = useState(false); // NEW: State for location error

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    api.get("/users/me")
      .then(res => setUser(res.data))
      .catch(err => console.error("Error fetching profile", err));
    
    fetchTodayExpenses();
  }, [navigate]);

  const fetchTodayExpenses = async () => {
    try {
      const res = await api.get("/expenses/today");
      setTodayExpenses(res.data);
    } catch (err) {
      console.error("Error fetching today's expenses", err);
    }
  };

  useEffect(() => {
    const socket = connectSocket();
    if (!socket || !user) return;

    setStatus("Online");

    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocationError(false); // Reset error on success
        socket.emit("sendLocation", {
          userId: user._id,
          name: user.name,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLastUpdate(new Date().toLocaleTimeString());
      },
      (err) => {
        console.error("GPS Watch Error:", err);
        if (err.code === 1) setLocationError(true); // NEW: Set error if permission denied
      },
      geoOptions
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setStatus("Offline");
    };
  }, [user]);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        {/* NEW: Top of page alert for location permissions */}
        {locationError && (
          <div style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "12px",
            textAlign: "center",
            fontWeight: "bold",
            borderBottom: "1px solid #f87171"
          }}>
            📍 Location access is disabled. Please enable GPS and allow browser permissions to share your live location.
          </div>
        )}

        <Topbar title="Field Officer Panel" />
        
        <div className="dashboard-container">
          <section className="profile-section">
            <UserProfile />
          </section><br />
          
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">System Status</span>
              <div className="stat-value">
                <span className={`status-dot ${status === "Online" ? "online" : "offline"}`}></span>
                <span className={status === "Online" ? "text-green" : "text-red"}>{status}</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-label">GPS Live Tracker</span>
              <div className="stat-value text-blue">{lastUpdate}</div>
            </div>
          </div>

          <div className="content-grid">
            <div className="glass-card">
              <div className="card-header">
                <h4>Today's Expenses</h4>
              </div>
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayExpenses.length > 0 ? (
                      todayExpenses.map((exp) => (
                        <tr key={exp._id}>
                          <td><span className={`type-tag ${exp.type.toLowerCase()}`}>{exp.type}</span></td>
                          <td className="amount-cell">₹{exp.amount}</td>
                          <td className="note-cell">{exp.note || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="empty-state">No entries yet today</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card">
              <div className="card-header">
                <h4>Face Attendance</h4>
              </div>
              <div className="attendance-wrapper">
                <FaceAttendance />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}