import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import L from "leaflet";

export default function UserHistory() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user list for the dropdown
  useEffect(() => {
    api.get("/admin/users").then(res => setUsers(res.data));
  }, []);

  const fetchHistory = async () => {
    if (!selectedUser) return alert("Please select a user");
    setLoading(true);
    try {
      const res = await api.get(`/admin/location-history/${selectedUser}?date=${selectedDate}`);
      // Expecting array of {lat, lng, timestamp}
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history", err);
    } finally {
      setLoading(false);
    }
  };

  // Create path for the map
  const path = history.map(loc => [loc.lat, loc.lng]);

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
                <select onChange={(e) => setSelectedUser(e.target.value)}>
                  <option value="">-- Choose User --</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
              <button className="btn-login" style={{marginTop: '22px'}} onClick={fetchHistory}>
                {loading ? "Loading..." : "View Path"}
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ height: "500px" }}>
            {history.length > 0 ? (
              <MapContainer center={path[0]} zoom={15} style={{ height: "100%", borderRadius: "10px" }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" crossOrigin={true} />
                <Polyline positions={path} color="blue" weight={5} opacity={0.7} />
                <Marker position={path[0]}><Popup>Start Point</Popup></Marker>
                <Marker position={path[path.length - 1]}><Popup>Last Known Position</Popup></Marker>
              </MapContainer>
            ) : (
              <div className="empty-state" style={{padding: '100px'}}>
                Select a user and date to see their travel route on the map.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}