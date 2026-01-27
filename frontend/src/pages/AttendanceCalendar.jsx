import { useEffect, useState } from "react";
import Calendar from "react-calendar";
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

  // Function to determine tile colors: Green (Present), Red (Absent), Yellow (Sunday/Holiday)
  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const isSunday = date.getDay() === 0; // 0 represents Sunday
      
      const record = attendanceData.find(a => a.date === dateString);

      // 1. If user was present, show Green
      if (record) return 'tile-present';

      // 2. If it is Sunday, show Yellow (Holiday)
      if (isSunday) return 'tile-holiday';

      // 3. If date is in the past and no record/not Sunday, mark as Red (Absent)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return 'tile-absent';
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
              <p className="empty-state">Loading records...</p>
            ) : (
              <div className="calendar-wrapper">
                <Calendar 
                  tileClassName={getTileClassName}
                  className="modern-calendar"
                  /* react-calendar has built-in buttons to change months by default */
                  prev2Label={null} // Hide "jump to previous year" for cleaner UI
                  next2Label={null} // Hide "jump to next year"
                />
              </div>
            )}

            <div className="calendar-legend" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
              <span className="legend-item"><span className="dot present"></span> Present</span>
              <span className="legend-item"><span className="dot absent"></span> Absent</span>
              <span className="legend-item"><span className="dot holiday"></span> Holiday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}