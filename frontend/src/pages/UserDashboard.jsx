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
  const [todayExpenses, setTodayExpenses] = useState([]); // State for today's list
  const [expense, setExpense] = useState({
    type: "Travel",
    amount: "",
    note: ""
  });

  // Fetch user profile and today's expenses
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

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;
    setStatus("Online");

    const sendLocation = () => {
      if (user && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            socket.emit("sendLocation", {
              userId: user._id,
              name: user.name,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
            setLastUpdate(new Date().toLocaleTimeString());
          },
          err => console.error("Location error", err),
          { enableHighAccuracy: true }
        );
      }
    };

    sendLocation();
    const interval = setInterval(sendLocation, 10000);
    return () => {
      clearInterval(interval);
      setStatus("Offline");
    };
  }, [user]);

  const submitExpense = async () => {
    if (!expense.amount) return alert("Enter amount");
    try {
      await api.post("/expenses", expense);
      alert("Expense added");
      setExpense({ type: "Travel", amount: "", note: "" });
      fetchTodayExpenses(); // Refresh the today's list immediately
    } catch (err) {
      alert("Failed to add expense");
    }
  };

// Keep all your imports and useEffect logic the same
// In the return block, we wrap elements for better styling:

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Field Officer Panel" />
        
        <div className="dashboard-container">
          <section className="profile-section">
            <UserProfile />
          </section>
          
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">System Status</span>
              <div className="stat-value">
                <span className={`status-dot ${status === "Online" ? "online" : "offline"}`}></span>
                <span className={status === "Online" ? "text-green" : "text-red"}>{status}</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-label">GPS Last Sync</span>
              <div className="stat-value text-blue">{lastUpdate}</div>
            </div>
          </div>

          <div className="content-grid">
            {/* Expense Table Section */}
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

            {/* Attendance Section */}
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