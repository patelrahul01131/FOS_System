import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import FaceAttendance from "../components/FaceAttendance";
import UserProfile from "../components/UserProfile";
import api from "../services/api";
import "../styles/dashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [todayExpenses, setTodayExpenses] = useState([]);

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

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Field Officer Panel" />
        
        <div className="dashboard-container">
          <section className="profile-section">
            <UserProfile />
          </section><br />
          
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