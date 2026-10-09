import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { setSocketIO } from "./socket.manager.js";
import { redisSubscriber } from "../config/redis.js";
import socketConfig from "../config/socket.config.js";

const initializeSocketIO = (httpServer) => {
  const io = new Server(httpServer, socketConfig);

  // Authenticate Socket.IO connections using the access token cookie

  // Authenticate Socket.IO connections using a short-lived socket token
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Socket authentication token missing"));
      }

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      if (decodedToken.tokenType !== "socket") {
        return next(new Error("Invalid socket token"));
      }

      socket.user = decodedToken;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Socket authentication failed"));
    }
  });

  // Handle authenticated client connections
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    const userId = socket.user._id.toString();

    socket.join(`userId:${userId}`);

    console.log(`User ${userId} joined notification room`);

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id}`, reason);
    });
  });

  // Listen for events from the worker through Redis
  redisSubscriber.on("message", (channel, message) => {
    try {
      const data = JSON.parse(message);

      // Handle video processing events
      if (channel === "video-processing") {
        io.to(`userId:${data.userId}`).emit("video-processing-progress", data);
      }

      // Handle notification events
      if (channel === "notifications") {
        io.to(`userId:${data.recipient}`).emit("notification", data);
      }
    } catch (error) {
      console.error("Failed to process Redis message:", error.message);
    }
  });

  // Subscribe to worker events
  redisSubscriber
    .subscribe("video-processing", "notifications")
    .catch((error) => {
      console.error("Failed to subscribe to Redis channels:", error.message);
    });

  setSocketIO(io);

  return io;
};

export { initializeSocketIO };
