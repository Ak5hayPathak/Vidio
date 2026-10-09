import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

import { useAuth } from "./AuthContext.jsx";
import api from "../services/api.js";

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://vidio-an51.onrender.com";

export function SocketProvider({ children }) {
  const { user, loading } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (loading || !user) {
      setSocket(null);
      return;
    }

    let newSocket;
    let cancelled = false;

    async function connectSocket() {
      try {
        console.log("[Socket] Requesting authentication token...");

        // Obtain a short-lived token using the authenticated API.
        const response = await api.get("/users/socket-token");
        const token = response.data.data.token;

        // The component may have unmounted while the request was pending.
        if (cancelled) return;

        console.log("[Socket] Connecting to:", SOCKET_URL);

        newSocket = io(SOCKET_URL, {
          auth: { token },
          withCredentials: true,
        });

        newSocket.on("connect", () => {
          console.log("[Socket] Connected:", newSocket.id);
          console.log(
            "[Socket] Initial transport:",
            newSocket.io.engine.transport.name,
          );
        });

        newSocket.io.on("open", () => {
          newSocket.io.engine?.on("upgrade", (transport) => {
            console.log("[Socket] Transport upgraded:", transport.name);
          });
        });

        newSocket.on("video-processing-progress", (data) => {
          console.log("[Socket] Progress received:", data);
        });

        newSocket.on("connect_error", (error) => {
          console.error("[Socket] Connection error:", error.message);
        });

        newSocket.on("disconnect", (reason) => {
          console.warn("[Socket] Disconnected:", reason);
        });

        setSocket(newSocket);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "[Socket] Failed to initialize:",
            error.response?.data?.message || error.message,
          );
        }
      }
    }

    connectSocket();

    return () => {
      cancelled = true;
      newSocket?.disconnect();
      setSocket(null);
    };
  }, [user, loading]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
