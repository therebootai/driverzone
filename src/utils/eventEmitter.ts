import { EventEmitter } from "events";

class GlobalEventEmitter extends EventEmitter {
  private static instance: GlobalEventEmitter;

  private constructor() {
    super();
    this.setMaxListeners(100); // Standard is 10, increasing for more real-time connections
  }

  public static getInstance(): GlobalEventEmitter {
    if (!GlobalEventEmitter.instance) {
      GlobalEventEmitter.instance = new GlobalEventEmitter();
    }
    return GlobalEventEmitter.instance;
  }
}

export const eventEmitter = GlobalEventEmitter.getInstance();

export const EVENTS = {
  BOOKING_CREATED: "booking:created",
  BOOKING_UPDATED: "booking:updated",
  DRIVER_LOCATION_UPDATED: "driver:location",
};
