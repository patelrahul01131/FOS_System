import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } from "react-leaflet";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Helper Functions ---

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

  useEffect(() => {
    api.get("/admin/users").then(res => setUsers(res.data));
  }, []);

  const fetchHistory = async () => {
    if (!selectedUser) return alert("Please select a user");
    setLoading(true);
    try {
      const res = await api.get(`/admin/location-history/${selectedUser}?date=${selectedDate}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history", err);
      alert("Failed to fetch history.");
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

          <div className="glass-card" style={{ height: "600px", overflow: "hidden" }}>
            {history.length > 0 ? (
              <MapContainer 
                center={path[path.length - 1]} // Center on last position
                zoom={16} // High zoom for street details
                style={{ height: "100%", width: "100%" }}
              >
                {/* ESRI World Topo provides extreme street-level detail and local area names */}
                <TileLayer 
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" 
                  attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
                  crossOrigin={true}
                />

                {/* Path line - thicker for visibility on detailed maps */}
                <Polyline positions={path} color={userColor} weight={6} opacity={0.7} />

                {/* Start Point */}
                <Marker position={path[0]} icon={createColoredIcon("#10b981")}>
                  <Popup>
                    <strong>Start Point (Check-in)</strong><br/>
                    Time: {new Date(history[0].createdAt).toLocaleTimeString()}
                  </Popup>
                  <Tooltip direction="top" offset={[0, -40]}>Start</Tooltip>
                </Marker>

                {/* Midpoints (shown every 15 points to avoid clutter but show progress) */}
                {history.map((point, index) => {
                  if (index > 0 && index < history.length - 1 && index % 15 === 0) {
                    return (
                      <Marker key={index} position={[point.lat, point.lng]} icon={createColoredIcon(userColor)}>
                        <Popup>
                          <strong>Waypoint</strong><br/>
                          Time: {new Date(point.createdAt).toLocaleTimeString()}
                        </Popup>
                      </Marker>
                    );
                  }
                  return null;
                })}

                {/* Final Point */}
                <Marker position={path[path.length - 1]} icon={createColoredIcon("#ef4444")}>
                  <Popup>
                    <strong>Last Known Position</strong><br/>
                    Time: {new Date(history[history.length - 1].createdAt).toLocaleTimeString()}
                  </Popup>
                  <Tooltip permanent direction="top" offset={[0, -40]}>Current</Tooltip>
                </Marker>
              </MapContainer>
            ) : (
              <div className="empty-state" style={{ padding: "150px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "50px" }}>🗺️</div>
                <h3>Detailed Route History</h3>
                <p>Select an officer to see street-level travel data.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}