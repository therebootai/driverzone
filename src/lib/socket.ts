import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export const EVENTS = {
  // Booking events
  BOOKING_CREATED: "booking:created",
  BOOKING_UPDATED: "booking:updated",
  BOOKING_ACCEPTED: "booking:accepted",
  BOOKING_CANCELLED: "booking:cancelled",
  BOOKING_ASSIGNED: "booking:assigned",
  
  // Alert events
  RIDE_REQUEST: "ride:request",
  ALERT_CANCELLED: "alert:cancelled",
  
  // Location/Tracking
  DRIVER_LOCATION: "driver:location",

  // Auth events
  FORCE_LOGOUT: "force:logout",

  // Generic
  JOIN_ROOM: "join:room",
  LEAVE_ROOM: "leave:room",
};

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public init(server: NetServer): SocketIOServer {
    if (this.io) return this.io;

    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*", // Adjust this in production
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket) => {
      console.log("New socket connection:", socket.id);

      socket.on(EVENTS.JOIN_ROOM, (room) => {
        console.log(`Socket ${socket.id} joining room: ${room}`);
        socket.join(room);
      });

      socket.on(EVENTS.LEAVE_ROOM, (room) => {
        console.log(`Socket ${socket.id} leaving room: ${room}`);
        socket.leave(room);
      });

      socket.on(EVENTS.DRIVER_LOCATION, (data) => {
        // Broadcast to relevant rooms (e.g., booking room and admin room)
        if (data.bookingId) {
          socket.to(`ride:${data.bookingId}`).emit(EVENTS.DRIVER_LOCATION, data);
        }
        // Always broadcast to admin for live tracking
        socket.to("admin").emit(EVENTS.DRIVER_LOCATION, data);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    return this.io;
  }

  public forceLogout(userId: string, role: "customer" | "driver"): void {
    if (!this.io) return;
    const room = `${role}:${userId}`;
    console.log(`Force logout emitted to room: ${room}`);
    this.io.to(room).emit(EVENTS.FORCE_LOGOUT, { reason: "Account deactivated" });
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error("Socket.io not initialized");
    }
    return this.io;
  }

  public emit(event: string, data: any, room?: string) {
    if (!this.io) return;
    
    if (room) {
      this.io.to(room).emit(event, data);
    } else {
      this.io.emit(event, data);
    }
  }
}

export const socketService = SocketService.getInstance();
