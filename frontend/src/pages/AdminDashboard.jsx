import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/dashboard.css";
import AdminLiveMap from "../components/AdminLiveMap";

export default function AdminDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/attendance") 
      .then(res => {
        setAttendance(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Logic to calculate quick stats
  const presentCount = attendance.filter(a => a.marked).length;
  const totalUsers = attendance.length;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Management Overview" />

        <div className="dashboard-container">
          {/* Quick Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Officers</span>
              <div className="stat-value text-blue">{totalUsers}</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Present Today</span>
              <div className="stat-value text-green">{presentCount}</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Attendance Rate</span>
              <div className="stat-value">
                {totalUsers > 0 ? Math.round((presentCount / totalUsers) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="glass-card map-section">
            <div className="card-header">
              <h4>📍 Live Field Locations</h4>
            </div>
            <div className="map-wrapper mt">
              <AdminLiveMap />
            </div>
          </div>

          {/* Attendance Table Section */}
          <div className="glass-card mt">
            <div className="card-header flex-between">
              <h4>🕒 Today's Attendance Logs</h4>
              <button className="btn-outline" onClick={() => window.location.reload()}>Refresh</button>
            </div>

            <div className="table-responsive">
              <table className="modern-table mt">
                <thead>
                  <tr>
                    <th>User Detail</th>
                    <th>Status</th>
                    <th>Check-in Time</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4" className="empty-state">Fetching logs...</td></tr>
                  ) : attendance.length > 0 ? (
                    attendance.map((a) => (
                      <tr key={a._id}>
                        <td className="user-cell">
                          <div className="user-info-box">
                            <span className="user-name">{a.user?.name || "Unknown"}</span>
                            <span className="user-email">{a.user?.email}</span>
                          </div>
                        </td>
                        <td>
                          {a.marked ? (
                            <span className="badge-pill present">Present</span>
                          ) : (
                            <span className="badge-pill absent">Absent</span>
                          )}
                        </td>
                        <td className="time-cell">
                          {a.marked ? new Date(a.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                        </td>
                        <td>
                          {a.image ? (
                            <div className="img-container">
                                <img src={a.image} className="attendance-img" alt="User face" />
                            </div>
                          ) : (
                            <span className="no-img">No Image</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="empty-state">No attendance records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}