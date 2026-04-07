"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RealtimeRideNotification() {
  const router = useRouter();

  useEffect(() => {
    const eventSource = new EventSource("/api/ride-events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "booking:created") {
          toast.success(`New Ride Request: ${data.pickupAddress}`, {
            duration: 10000,
            position: "top-right",
            icon: "🚗",
          });
          // Refresh the page data if we are on a list view
          router.refresh();
        }

        if (data.type === "booking:updated") {
          if (data.status === "cancelled") {
             toast.error(`Ride Cancelled: ${data.bookingId}`, {
               duration: 5000,
             });
          }
          router.refresh();
        }
      } catch (error) {
        console.error("SSE Error parsing data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Connection Error:", error);
      // EventSource automatically retries
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  return null; // This component doesn't render anything UI-wise, just listens
}
