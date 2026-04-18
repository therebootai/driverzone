"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (room?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const socketInstance = io({
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);
      if (room) {
        socketInstance.emit("join:room", room);
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      if (room) {
        socketInstance.emit("leave:room", room);
      }
      socketInstance.disconnect();
    };
  }, [room]);

  return {
    socket,
    isConnected,
  };
};
