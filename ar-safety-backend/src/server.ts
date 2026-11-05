import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { setSocketServer } from "./lib/socket.js";
import { registerSiteSafetySocket } from
  "./modules/site-safety/site-safety.socket.js";
import { startStaleLocationMonitor } from
  "./modules/site-safety/site-safety.stale.js";

const PORT = Number(process.env.PORT ?? 5000);

const httpServer = createServer(app);

const allowedOrigins = (
  process.env.FRONTEND_URL ?? "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
  },
});

setSocketServer(io);
registerSiteSafetySocket(io);
startStaleLocationMonitor();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Socket.IO server initialized");
});