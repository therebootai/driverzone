import { NextRequest } from "next/server";
import { eventEmitter, EVENTS } from "@/utils/eventEmitter";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Explicitly set to Vercel's Pro max duration

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const bookingId = searchParams.get("bookingId");

  const responseHeaders = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (type: string, data: any) => {
        // If bookingId is provided, only send events related to that booking
        if (bookingId && data.bookingId && data.bookingId !== bookingId) {
          return;
        }
        
        // Include type in the data blob and send as unnamed event (message)
        const payload = { ...data, type };
        const formattedData = `data: ${JSON.stringify(payload)}\n\n`;
        try {
          controller.enqueue(encoder.encode(formattedData));
        } catch (e) {
          // Controller might be closed
          cleanup();
        }
      };

      // Listen for various events
      const onBookingCreated = (data: any) => sendEvent(EVENTS.BOOKING_CREATED, data);
      const onBookingUpdated = (data: any) => sendEvent(EVENTS.BOOKING_UPDATED, data);
      const onLocationUpdated = (data: any) => sendEvent(EVENTS.DRIVER_LOCATION_UPDATED, data);

      eventEmitter.on(EVENTS.BOOKING_CREATED, onBookingCreated);
      eventEmitter.on(EVENTS.BOOKING_UPDATED, onBookingUpdated);
      eventEmitter.on(EVENTS.DRIVER_LOCATION_UPDATED, onLocationUpdated);

      // Keep connection alive with heartbeat every 20 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch (e) {
          cleanup();
        }
      }, 20000);

      const cleanup = () => {
        clearInterval(heartbeat);
        clearTimeout(vercelTimeout);
        eventEmitter.off(EVENTS.BOOKING_CREATED, onBookingCreated);
        eventEmitter.off(EVENTS.BOOKING_UPDATED, onBookingUpdated);
        eventEmitter.off(EVENTS.DRIVER_LOCATION_UPDATED, onLocationUpdated);
        try {
          controller.close();
        } catch (e) {}
      };

      // Vercel Serverless Task Timeout Prevention
      // Close connection just before the 300s limit to allow clean reconnection
      const vercelTimeout = setTimeout(() => {
        cleanup();
      }, 250000); // 250 seconds (4.16 minutes)

      // Cleanup when connection is closed by client
      req.signal.addEventListener("abort", () => {
        cleanup();
      });
    },
    cancel() {
       // This is called when the stream is cancelled by the consumer
    }
  });

  return new Response(stream, { headers: responseHeaders });
}
