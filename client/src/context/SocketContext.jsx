
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";

import { useAuth } from "./AuthContext.jsx";
import api from "../services/api.js";

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://vidio-an51.onrender.com";

export function SocketProvider({ children }) {
  const { user, loading } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (loading || !user) {
      setSocket(null);
      return;
    }

    let cancelled = false;
    let tokenFetchFailed = false;
    let retryTimer = null;

    console.log("[Socket] Preparing connection:", SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,

      // Called for every connection attempt, including reconnects.
      auth: async (callback) => {
        tokenFetchFailed = false;

        try {
          const response = await api.get("/users/socket-token");

          if (cancelled) {
            callback({});
            return;
          }

          const token = response.data?.data?.token;

          if (!token) {
            throw new Error("Socket token missing from API response");
          }

          console.log("[Socket] Fresh authentication token obtained");

          callback({ token });
        } catch (error) {
          tokenFetchFailed = true;

          console.error(
            "[Socket] Failed to obtain token:",
            error.response?.data?.message || error.message,
          );

          // The server will reject this attempt. connect_error below
          // schedules another attempt after a short delay.
          callback({});
        }
      },
    });

    newSocket.on("connect", () => {
      console.log("[Socket] Connected:", newSocket.id);
      console.log(
        "[Socket] Transport:",
        newSocket.io.engine.transport.name,
      );

      tokenFetchFailed = false;

      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }

      newSocket.io.engine.once("upgrade", (transport) => {
        console.log("[Socket] Transport upgraded:", transport.name);
      });
    });

    newSocket.on("video-processing-progress", (data) => {
      //console.log("[Socket] Progress received:", data);
    });

    newSocket.on("notification", (data) => {
      console.log("[Socket] Notification received:", data);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message);

      // Socket.IO normally retries network failures automatically.
      // Authentication middleware errors need a manual retry if
      // obtaining the fresh token itself failed.
      if (tokenFetchFailed && !cancelled && !retryTimer) {
        retryTimer = setTimeout(() => {
          retryTimer = null;

          if (!cancelled) {
            console.log("[Socket] Retrying authentication...");
            newSocket.connect();
          }
        }, 3000);
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("[Socket] Disconnected:", reason);
    });

    setSocket(newSocket);
    newSocket.connect();

    return () => {
      cancelled = true;

      if (retryTimer) {
        clearTimeout(retryTimer);
      }

      newSocket.removeAllListeners();
      newSocket.disconnect();

      setSocket((currentSocket) =>
        currentSocket === newSocket ? null : currentSocket
      );
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