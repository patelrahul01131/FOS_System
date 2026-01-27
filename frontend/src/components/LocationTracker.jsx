import { useEffect } from "react";
import { connectSocket } from "../services/socket";
import api from "../services/api";

export default function LocationTracker() {
  useEffect(() => {
    let watchId;
    let socket;

    const startTracking = async () => {
      try {
        // Fetch user info to get the ID and Name
        const res = await api.get("/users/me");
        const user = res.data;

        socket = connectSocket();
        if (!socket) return;

        const geoOptions = {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        };

        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            socket.emit("sendLocation", {
              userId: user._id,
              name: user.name,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          },
          (err) => console.error("Global GPS Error:", err),
          geoOptions
        );
      } catch (err) {
        console.error("Tracker: Could not verify user session", err);
      }
    };

    startTracking();

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return null; // This component stays invisible
}