import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import FaceAttendance from "../components/FaceAttendance";
import UserProfile from "../components/UserProfile";
import { connectSocket } from "../services/socket";
import api from "../services/api";
import "../styles/dashboard.css";

export default function UserDashboard() {
  const [status, setStatus] = useState("Offline");
  const [lastUpdate, setLastUpdate] = useState("--");
  const [user, setUser] = useState(null);
  const [todayExpenses, setTodayExpenses] = useState([]);
  const [expense, setExpense] = useState({ type: "Travel", amount: "", note: "" });

  useEffect(() => {
    api.get("/users/me")
      .then(res => setUser(res.data))
      .catch(err => console.error("Error fetching profile", err));
    
    fetchTodayExpenses();
  }, []);

  const fetchTodayExpenses = async () => {
    try {
      const res = await api.get("/expenses/today");
      setTodayExpenses(res.data);
    } catch (err) {
      console.error("Error fetching today's expenses", err);
    }
  };

  // --- BACKGROUND TRACKING LOGIC ---
  useEffect(() => {
    const socket = connectSocket();
    if (!socket || !user) return;

    setStatus("Online");

    // Options to force the GPS to stay active
    const geoOptions = {
      enableHighAccuracy: true, // Uses GPS hardware, not just Wi-Fi
      maximumAge: 0,            // Do not use cached locations
      timeout: 10000            // Wait up to 10s for a fix
    };

    // Use watchPosition instead of an interval for background support
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("sendLocation", {
          userId: user._id,
          name: user.name,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLastUpdate(new Date().toLocaleTimeString());
      },
      (err) => console.error("GPS Watch Error:", err),
      geoOptions
    );

    // Cleanup: Stop the GPS hardware when user logs out/closes dashboard
    return () => {
      navigator.geolocation.clearWatch(watchId);
      setStatus("Offline");
    };
  }, [user]);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
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