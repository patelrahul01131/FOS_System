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
    // Calling the route we just updated in the Backend
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

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Admin Dashboard" />

        <div className="card mt">
          <h3>Live User Locations</h3>
          <AdminLiveMap />
        </div>

        <div className="card">
          <h3>Today's Attendance Status</h3>

          <table width="100%" style={{ marginTop: "15px" }} className="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Time</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4">Loading...</td></tr>
              ) : (
                attendance.map((a) => (
                  <tr key={a._id}>
                    <td>
                        <strong>{a.user?.name || "Unknown"}</strong><br/>
                        <small>{a.user?.email}</small>
                    </td>
                    <td>
                      {/* If marked is true, show Present, otherwise Absent */}
                      {a.marked ? (
                        <span className="badge green">Present ✅</span>
                      ) : (
                        <span className="badge red">Absent ❌</span>
                      )}
                    </td>
                    <td>
                        {a.marked ? new Date(a.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                    </td>
                    <td>
                      {a.image ? (
                        <img src={a.image} width="50" height="50" style={{borderRadius: '5px', objectFit: 'cover'}} alt="Attendance" />
                      ) : (
                        <span style={{color: '#ccc'}}>No Image</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}