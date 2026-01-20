import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import { useEffect, useState } from "react";
import { getSocket, connectSocket } from "../services/socket";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper function to generate a consistent color based on a string (userId)
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

// Function to create a custom colored marker icon
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

export default function AdminLiveMap() {
  const [users, setUsers] = useState({});

  useEffect(() => {
    let socket = getSocket();
    if (!socket) socket = connectSocket();

    socket.on("adminLiveLocation", (data) => {
      setUsers((prev) => ({
        ...prev,
        [data.userId]: data,
      }));
    });

    return () => socket.off("adminLiveLocation");
  }, []);

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "10px", overflow: "hidden" }}>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%" }}>
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; OpenStreetMap contributors'
          crossOrigin={true} // IMPORTANT for Apps
        />

        {Object.values(users).map((u) => {
          const userColor = stringToColor(u.userId || "default");
          
          return (
            <Marker 
              key={u.userId} 
              position={[u.lat, u.lng]} 
              icon={createColoredIcon(userColor)} // Applying custom colored icon
            >
              <Tooltip permanent direction="top" offset={[0, -40]}>
                <span style={{ color: userColor, fontWeight: "bold" }}>
                  {u.name || "Unknown User"}
                </span>
              </Tooltip>
              
              <Popup>
                <div style={{ textAlign: "center" }}>
                  <strong style={{ color: userColor }}>{u.name}</strong> <br />
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    Last Update: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}