import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import LiveLocation from "../models/LiveLocation.js";
import LocationHistory from "../models/LocationHistory.js";
import User from "../models/User.js";

export default function init(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.use((socket, next) => {
    try {
      socket.user = jwt.verify(socket.handshake.auth.token, "FOS_SECRET");
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", socket => {
    // Join a room based on role for targeted notifications
    socket.join(socket.user.role); 
    User.findByIdAndUpdate(socket.user.id, { online: true }).exec();

    socket.on("sendLocation", async (data) => {
      try {
        const dbUser = await User.findById(socket.user.id);
        const userName = dbUser ? dbUser.name : "Unknown User";
        const loc = { lat: data.lat, lng: data.lng, userId: socket.user.id };

        await LiveLocation.findOneAndUpdate({ userId: socket.user.id }, loc, { upsert: true });
        await LocationHistory.create(loc);

        io.emit("adminLiveLocation", { 
          userId: socket.user.id, 
          name: userName, 
          lat: data.lat, 
          lng: data.lng 
        });
      } catch (err) {
        console.error("Socket error:", err);
      }
    });

    // NEW: Handle Location Disabled Warning
    socket.on("gpsDisabled", (data) => {
      io.to("admin").emit("notification", {
        title: "GPS Warning",
        message: `${data.name} has disabled location tracking!`,
        type: "warning"
      });
    });

    socket.on("disconnect", () => {
      User.findByIdAndUpdate(socket.user.id, { online: false }).exec();
    });
  });

  return io;
}