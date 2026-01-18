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
    // Update user status to online
    User.findByIdAndUpdate(socket.user.id, { online: true }).exec();

    socket.on("sendLocation", async (data) => {
      // Prepare location object
      const loc = {
        lat: data.lat,
        lng: data.lng,
        userId: socket.user.id
      };

      // Save to LiveLocation (Latest)
      await LiveLocation.findOneAndUpdate(
        { userId: socket.user.id },
        loc,
        { upsert: true }
      );

      // Save to LocationHistory (Logs)
      await LocationHistory.create(loc);

      // Emit to Admin with User Name
      io.emit("adminLiveLocation", { 
        userId: socket.user.id, 
        name: data.name, // Relaying the name received from user
        lat: data.lat, 
        lng: data.lng 
      });
    });

    socket.on("disconnect", () => {
      // Update user status to offline
      User.findByIdAndUpdate(socket.user.id, { online: false }).exec();
    });
  });
}