import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { loadEnvConfig } from "@next/env";

// 1. Load environment variables first
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// 2. Start the application
const startServer = async () => {
  const dev = process.env.NODE_ENV !== "production";
  const hostname = "localhost";
  const port = parseInt(process.env.PORT || "3000", 10);

  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  // Dynamically import services that depend on the database/env
  const { socketService } = await import("./src/lib/socket");
  const cron = (await import("node-cron")).default;
  const { autoOfflineStaleDrivers } = await import("./src/utils/driverUtils");

  await app.prepare();

  const httpServer = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.io
  socketService.init(httpServer);

  httpServer.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Real-time Socket.io server initialized`);

    // Schedule stale driver cleanup every 15 minutes
    cron.schedule("*/15 * * * *", async () => {
      console.log("[Cron] Running stale driver cleanup...");
      await autoOfflineStaleDrivers();
    });
    console.log(`> Background cron worker initialized (15m interval)`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
