import type { Server } from "socket.io";

let socketServer: Server | null = null;

export function setSocketServer(io: Server): void {
  socketServer = io;
}

export function emitToSite(
  site: string,
  event: string,
  payload: unknown,
): void {
  socketServer?.to(`site:${site}`).emit(event, payload);
}