import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/dashboard.css";

export default function AttendanceReport() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch full history from the backend
    api.get("/admin/attendance/full-report")
      .then((res) => setRecords(res.data))
      .catch((err) => console.error("Error fetching report", err))
      .finally(() => setLoading(false));
  }, []);

  const exportData = (type) => {
    // Points to your backend export routes
    const url = `http://localhost:5000/api/admin/attendance/export/${type}`;
    window.open(url, "_blank");
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Attendance Report" />

        <div className="card mt">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Master Attendance Log</h3>
            <div className="export-buttons">
              <button className="btn-excel" onClick={() => exportData("excel")}>Export Excel</button>
              <button className="btn-pdf" onClick={() => exportData("pdf")} style={{ marginLeft: "10px" }}>Export PDF</button>
            </div>
          </div>

          <div className="table-container" style={{ marginTop: "20px" }}>
            {loading ? (
              <p>Generating report...</p>
            ) : (
              <table width="100%" className="user-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Capture</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td>{new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td><strong>{r.user?.name || "N/A"}</strong></td>
                      <td>{r.user?.email}</td>
                      <td>
                        {r.image ? (
                          <img src={r.image} width="45" height="45" style={{ borderRadius: "4px", objectFit: "cover" }} alt="User" />
                        ) : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}