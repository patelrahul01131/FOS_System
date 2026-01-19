import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/dashboard.css";

export default function AttendanceReport() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.get("/admin/attendance/full-report")
      .then((res) => {
        setRecords(res.data);
        setFilteredRecords(res.data);
      })
      .catch((err) => console.error("Error fetching report", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = records;

    if (startDate) {
      result = result.filter(r => new Date(r.date) >= new Date(startDate));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // Include the full end day
      result = result.filter(r => new Date(r.date) <= end);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.user?.name?.toLowerCase().includes(term) || 
        r.user?.email?.toLowerCase().includes(term)
      );
    }

    setFilteredRecords(result);
  }, [startDate, endDate, searchTerm, records]);

  const exportData = (type) => {
    const baseURL = import.meta.env.VITE_API_URL || "https://fos-system.onrender.com/api";
    const url = `${baseURL}/admin/attendance/export/${type}`;
    window.open(url, "_blank");
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Detailed Reports" />

        <div className="dashboard-container">
          {/* Advanced Filter Bar */}
          <div className="glass-card mb-20">
            <div className="filter-grid">
              <div className="filter-group">
                <label>Search User</label>
                <input 
                  type="text" 
                  placeholder="Name or Email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>From Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>To Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="filter-actions">
                <button className="btn-excel" onClick={() => exportData("excel")}>Excel</button>
                <button className="btn-pdf" onClick={() => exportData("pdf")}>PDF</button>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="glass-card">
            <div className="card-header flex-between">
              <h4>Master Attendance Log ({filteredRecords.length})</h4>
              { (startDate || endDate || searchTerm) && (
                <button className="text-btn" onClick={() => {setStartDate(""); setEndDate(""); setSearchTerm("");}}>Clear Filters</button>
              )}
            </div>

            <div className="table-responsive mt">
              {loading ? (
                <div className="loader-box">Generating report...</div>
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>User Details</th>
                      <th>Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((r) => (
                        <tr key={r._id}>
                          <td>
                            <div className="date-cell">
                              <span className="main-text">{new Date(r.date).toLocaleDateString()}</span>
                              <span className="sub-text">{new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                          <td>
                            <div className="user-info-box">
                              <span className="user-name">{r.user?.name || "N/A"}</span>
                              <span className="user-email">{r.user?.email}</span>
                            </div>
                          </td>
                          <td>
                            {r.image ? (
                              <img src={r.image} className="attendance-img" alt="User" />
                            ) : <span className="no-img">No Image</span>}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="empty-state">No records match your filters</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}