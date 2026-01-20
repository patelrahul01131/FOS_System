import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } from "react-leaflet";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Helper Functions (Same as AdminLiveMap) ---

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const createColoredIcon = (color) => {
  return new L.divIcon({
    className: "custom-marker",
    html: `
      <svg width="30" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 21.01M19 10C19 13.866 12 21 12 21C12 21 5 13.866 5 10C5 6.13401 8.13401 3 12 3C15.866 3 19 6.13401 19 10Z" 
              fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });
};

export default function UserHistory() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user list for dropdown
  useEffect(() => {
    api.get("/admin/users").then(res => setUsers(res.data));
  }, []);

  const fetchHistory = async () => {
    if (!selectedUser) return alert("Please select a user");
    setLoading(true);
    try {
      // Corrected API endpoint to match your adminRoutes.js
      const res = await api.get(`/admin/location-history/${selectedUser}?date=${selectedDate}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history", err);
      alert("Failed to fetch history. Check if the backend route is active.");
    } finally {
      setLoading(false);
    }
  };

  const path = history.map(loc => [loc.lat, loc.lng]);
  const userColor = selectedUser ? stringToColor(selectedUser) : "#4f46e5";

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Route History" />
        <div className="dashboard-container">
          
          {/* Filter Bar */}
          <div className="glass-card mb-20">
            <div className="filter-grid">
              <div className="filter-group">
                <label>Select Officer</label>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                  <option value="">-- Choose User --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
              <div className="filter-actions">
                <button className="btn-login" onClick={fetchHistory} disabled={loading}>
                  {loading ? "Loading..." : "View Path"}
                </button>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="glass-card" style={{ height: "550px", overflow: "hidden" }}>
            {history.length > 0 ? (
              <MapContainer 
                center={path[0]} 
                zoom={14} 
                style={{ height: "100%", width: "100%" }}
              >
                {/* Same high-performance tiles as Live Map */}
                <TileLayer 
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                  crossOrigin={true}
                />

                {/* The Travel Path Line */}
                <Polyline positions={path} color={userColor} weight={4} opacity={0.6} dashArray="10, 10" />

                {/* Start Point Marker (Green) */}
                <Marker position={path[0]} icon={createColoredIcon("#10b981")}>
                  <Popup><b>Start Point</b><br/>{new Date(history[0].createdAt).toLocaleTimeString()}</Popup>
                  <Tooltip permanent direction="top" offset={[0, -40]}>Check-in</Tooltip>
                </Marker>

                {/* Current/End Point Marker (User's Theme Color) */}
                <Marker position={path[path.length - 1]} icon={createColoredIcon(userColor)}>
                  <Popup>
                    <b>Last Position</b><br/>
                    Time: {new Date(history[history.length - 1].createdAt).toLocaleTimeString()}
                  </Popup>
                  <Tooltip permanent direction="top" offset={[0, -40]}>Last Seen</Tooltip>
                </Marker>
              </MapContainer>
            ) : (
              <div className="empty-state" style={{ padding: "150px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "50px" }}>📍</div>
                <h3>No Route Found</h3>
                <p>Select an officer and date to visualize the travel logs.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}