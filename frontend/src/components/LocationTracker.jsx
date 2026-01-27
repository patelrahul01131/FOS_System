import { useEffect } from "react";
import { connectSocket } from "../services/socket";
import api from "../services/api";

export default function LocationTracker() {
  useEffect(() => {
    let watchId;
    let socket;

    const startTracking = async () => {
      try {
        const res = await api.get("/users/me");
        const user = res.data;

        socket = connectSocket();
        if (!socket) return;

        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            socket.emit("sendLocation", {
              userId: user._id,
              name: user.name,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          },
          (err) => {
            if (err.code === 1) { // Permission Denied
              socket.emit("gpsDisabled", { name: user.name });
            }
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
      } catch (err) {
        console.error("Tracker error", err);
      }
    };

    startTracking();
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, []);

  return null; 
}