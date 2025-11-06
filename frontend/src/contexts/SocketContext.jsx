import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log("🔌 SocketContext useEffect triggered", {
      hasUser: !!user,
      userId: user?._id,
    });

    // only connect if user is authenticated
    if (!user) {
      console.log("⚠️ No user, skipping socket connection");
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // initialize socket connection
    // socket.io connects to the base url, not /api
    const baseUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
      : "http://localhost:4000";

    console.log("🔌 Connecting Socket.IO to:", baseUrl);

    const newSocket = io(baseUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
      setSocket(newSocket);

      // Join user's notification room - use user.id not user._id
      if (user?.id) {
        console.log("📢 Joining notification room for user:", user.id);
        newSocket.emit("join:notifications", user.id);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount or user change
    return () => {
      if (user?.id) {
        newSocket.emit("leave:notifications", user.id);
      }
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
