import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

const SOCKET_URL = ""
//const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:15000";

export function SocketProvider({ children }) {
  const { user, loading } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setSocket(null);
      return;
    }

    console.log("[Socket] Connecting to:", SOCKET_URL);

    const newSocket = io(/*SOCKET_URL,*/{
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("[Socket] Connected:", newSocket.id);
      console.log(
        "[Socket] Initial transport:",
        newSocket.io.engine.transport.name
      );
    });

    newSocket.io.engine?.on("upgrade", (transport) => {
      console.log("[Socket] Transport upgraded:", transport.name);
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

    return () => {
      newSocket.disconnect();
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
