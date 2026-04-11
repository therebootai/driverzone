"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (room?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const socket = io({
      path: "/socket.io", // This depends on how Next.js/tsx handles it
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Admin Socket connected:", socket.id);
      setIsConnected(true);
      if (room) {
        socket.emit("join:room", room);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      if (room) {
        socket.emit("leave:room", room);
      }
      socket.disconnect();
    };
  }, [room]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
