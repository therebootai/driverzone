"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

export default function RealtimeRideNotification() {
  const { socket } = useSocket("admin");
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    const handleBookingCreated = (data: any) => {
      toast.success(`New Ride Request: ${data.pickupAddress || data.bookingId}`, {
        duration: 10000,
        position: "top-right",
        icon: "🚗",
      });
      router.refresh();
    };

    const handleBookingUpdated = (data: any) => {
      if (data.status === "cancelled") {
        toast.error(`Ride Cancelled: ${data.bookingId}`, {
          duration: 5000,
        });
      }
      router.refresh();
    };

    socket.on("booking:created", handleBookingCreated);
    socket.on("booking:updated", handleBookingUpdated);
    socket.on("booking:cancelled", handleBookingUpdated);

    return () => {
      socket.off("booking:created", handleBookingCreated);
      socket.off("booking:updated", handleBookingUpdated);
      socket.off("booking:cancelled", handleBookingUpdated);
    };
  }, [socket, router]);

  return null; // This component doesn't render anything UI-wise, just listens
}
