import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, loading } = useAuth();

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Wait until authentication state has been loaded
    if (loading) {
      return;
    }

    // Do not create a socket connection for unauthenticated users
    if (!user) {
      setSocket(null);
      return;
    }

    // Create a Socket.IO connection
    const newSocket = io("http://localhost:15000", {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      //console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("video-processing-progress", (data) => {
      //console.log("Video processing progress:", data);
    });

    newSocket.on("connect_error", (error) => {
      //console.error("Socket connection error:", error.message);
    });

    setSocket(newSocket);

    // Disconnect the socket when the user logs out
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
