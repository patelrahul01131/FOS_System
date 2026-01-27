import { useEffect, useState } from "react";
import Calendar from "react-calendar"; // You may need to run: npm install react-calendar
import 'react-calendar/dist/Calendar.css';
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/dashboard.css";

export default function AttendanceCalendar() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all past attendance for the current user
    api.get("/attendance/history")
      .then(res => {
        setAttendanceData(res.data);
      })
      .catch(err => console.error("Error fetching attendance history", err))
      .finally(() => setLoading(false));
  }, []);

  // Function to determine if a date should be Green (Present) or Red (Absent)
  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
      const record = attendanceData.find(a => a.date === dateString);
      
      if (record) return 'tile-present'; // Green
      
      // If date is in the past and no record exists, mark as absent
      if (date < new Date().setHours(0,0,0,0)) return 'tile-absent'; // Red
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Attendance Calendar" />
        <div className="dashboard-container">
          <div className="glass-card">
            <div className="card-header">
              <h4>My Attendance History</h4>
            </div>
            {loading ? (
              <p className="empty-state">Loading your records...</p>
            ) : (
              <div className="calendar-wrapper">
                <Calendar 
                  tileClassName={getTileClassName}
                  className="modern-calendar"
                />
              </div>
            )}
            <div className="calendar-legend mt">
              <span className="legend-item"><span className="dot present"></span> Present</span>
              <span className="legend-item"><span className="dot absent"></span> Absent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}