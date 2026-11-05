
import type { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

import { prisma } from "../../config/prisma.js";

interface AuthPayload {
  userId: string;
  role: "ADMIN" | "SAFETY_OFFICER";
}

interface AuthenticatedSocket extends Socket {
  data: Socket["data"] & {
    user?: AuthPayload;
  };
}

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

// export function registerSiteSafetySocket(io: Server) {
//   io.use(async (socket: AuthenticatedSocket, next) => {
//     // try {
//     const token =
//       socket.handshake.auth?.token ??
//       socket.handshake.headers.authorization?.replace(
//         /^Bearer\s+/i,
//         "",
//       );
//     // }
//     let decoded;
//     try {
//       decoded = jwt.verify(token, JWT_SECRET);
//     } catch (err) {
//       console.error("[socket auth] jwt:", (err as Error).name, (err as Error).message);
//       return next(new Error("Invalid or expired token"));
//     }

//     if (typeof decoded === "string" || typeof decoded.userId !== "string") {
//       return next(new Error("Invalid token payload"));
//     }

//     let user;
//     try {
//       user = await prisma.user.findUnique({
//         where: { id: decoded.userId },
//         select: { id: true, role: true },
//       });
//     } catch (err) {
//       console.error("[socket auth] db:", err);
//       return next(new Error("Auth service unavailable"));
//     }
//   });

  //   if (typeof token !== "string" || !token) {
  //     return next(new Error("Authentication required"));
  //   }

  //   const decoded = jwt.verify(token, JWT_SECRET);

  //   if (
  //     typeof decoded === "string" ||
  //     typeof decoded.userId !== "string"
  //   ) {
  //     return next(new Error("Invalid token payload"));
  //   }

  //   const user = await prisma.user.findUnique({
  //     where: { id: decoded.userId },
  //     select: {
  //       id: true,
  //       role: true,
  //     },
  //   });

  //   if (
  //     !user ||
  //     (user.role !== "ADMIN" &&
  //       user.role !== "SAFETY_OFFICER")
  //   ) {
  //     return next(new Error("Access denied"));
  //   }

  //   socket.data.user = {
  //     userId: user.id,
  //     role: user.role,
  //   };

  //   next();
  // } catch (error) {
  //   console.error("[socket auth] verification failed:", error);
  //   next(new Error("Invalid or expired token"));
  // }
  // });

// }

export function registerSiteSafetySocket(io: Server) {
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (typeof token !== "string" || !token) {
      return next(new Error("Authentication required"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("[socket auth] jwt:", (err as Error).name, (err as Error).message);
      return next(new Error("Invalid or expired token"));
    }

    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
      return next(new Error("Invalid token payload"));
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true },
      });
    } catch (err) {
      console.error("[socket auth] db:", err);
      return next(new Error("Auth service unavailable"));
    }

    if (!user || (user.role !== "ADMIN" && user.role !== "SAFETY_OFFICER")) {
      return next(new Error("Access denied"));
    }

    socket.data.user = { userId: user.id, role: user.role };
    next(); // this was the missing piece
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`Authenticated socket connected: ${socket.id}`);

    socket.on("site:join", async (site: unknown, ack?: (result: object) => void) => {
      if (typeof site !== "string" || !site.trim()) {
        ack?.({ success: false, message: "Invalid site" });
        return;
      }

      try {
        // Only join rooms for sites that actually exist.
        const existingSite = await prisma.siteZone.findFirst({
          where: { site: site.trim() },
          select: { id: true },
        });

        if (!existingSite) {
          ack?.({
            success: false,
            message: "Site not found",
          });
          return;
        }

        const room = `site:${site.trim()}`;
        await socket.join(room);

        ack?.({
          success: true,
          message: "Joined site room",
          site: site.trim(),
        });
      } catch (error) {
        ack?.({
          success: false,
          message: "Unable to join site room",
        });
      }
    });

    socket.on("site:leave", async (site: unknown) => {
      if (typeof site === "string" && site.trim()) {
        await socket.leave(`site:${site.trim()}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
