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
    api.get("/attendance/history")
      .then(res => {
        setAttendanceData(res.data);
      })
      .catch(err => console.error("Error fetching attendance history", err))
      .finally(() => setLoading(false));
  }, []);

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString('en-CA');
      const isSunday = date.getDay() === 0;
      const record = attendanceData.find(a => a.date === dateString);

      if (record) return 'tile-present';
      if (isSunday) return 'tile-holiday';

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
                  locale="en-US"
                  tileClassName={getTileClassName}
                  className="modern-calendar"
                  prev2Label={null}
                  next2Label={null}
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