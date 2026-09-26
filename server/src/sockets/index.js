import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { setSocketIO } from "./socket.manager.js";
import { redisSubscriber } from "../config/redis.js";

const initializeSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Authenticate Socket.IO connections using the access token cookie
  io.use((socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;

      if (!cookies) {
        return next(new Error("Authentication cookie missing"));
      }

      const accessToken = cookies
        .split("; ")
        .find((cookie) => cookie.startsWith("accessToken="))
        ?.split("=")[1];

      if (!accessToken) {
        return next(new Error("Access token missing"));
      }

      const decodedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );

      socket.user = decodedToken;

      console.log("Socket user authenticated!");

      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);

      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    const userId = socket.user._id.toString();

    socket.join(`userId:${userId}`);

    console.log(`User ${userId} joined notification room`);
  });

  // Listen for events from the worker through Redis
  redisSubscriber.on("message", (channel, message) => {
    try {
      //console.log("Redis message received:", channel, message);

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
  redisSubscriber.subscribe("video-processing", "notifications");

  setSocketIO(io);

  return io;
};

export { initializeSocketIO };
