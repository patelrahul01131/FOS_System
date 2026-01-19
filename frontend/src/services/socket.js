import { io } from "socket.io-client";

let socket = null;

// Get the base URL from environment variables and remove '/api' if present
// Socket.io usually connects to the server root, not the /api path.
const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return apiUrl.replace("/api", ""); 
};

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!socket) {
    socket = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket"], // Recommended for Render to avoid 'sticky session' issues
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:");
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 Socket connection error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });
  }

  return socket;
};

export const getSocket = () => socket;