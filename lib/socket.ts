import { io, Socket } from "socket.io-client";

/**
 * Socket.IO helper:
 * - `initSocket(userId, role)` → creates a singleton client and emits "join" with userId and role after connection.
 * - `getSocket()` → returns the existing instance (or null if not initialised).
 * - `disconnectSocket()` → closes and clears the instance.
 */

let socket: Socket | null = null;

export type SocketJoinPayload = {
  userId: string;
  role: string;
};

/**
 * Initialize a singleton Socket.IO client.
 *
 * - Safe on the server: returns null when `window` is not available.
 * - Uses `NEXT_PUBLIC_API_ENDPOINT` (e.g., http://localhost:1971).
 * - After connection, emits "join" event with { userId, role } for your backend.
 */
export const initSocket = (
  userId?: string | null,
  role?: string | null
): Socket | null => {
  if (typeof window === "undefined") return null;

  if (socket) {
    return socket;
  }

  const socketUrl =
    process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:1971"
    window.location.origin;

  // Configure socket to match your backend settings
  socket = io(socketUrl, {
    transports: ["polling", "websocket"],
    path: "/socket.io",
    withCredentials: true,
    // reconnection: true,
    // reconnectionAttempts: Infinity,
    // reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.info("[socket] Connected with id:", socket && socket.id);

    // Emit "join" event with userId and role as separate args (backend: socket.on("join", (userId, role) => ...))
    if (userId) {
      socket?.emit("join", userId, role ?? undefined);
      console.info("[socket] Emitted join event:", { userId, role: role ?? undefined });
    }
  });

  socket.on("disconnect", (reason) => {
    console.info("[socket] Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[socket] Connection error:", error.message);
  });

  return socket;
};

/** Get existing socket instance if initialised. */
export const getSocket = (): Socket | null => socket;

/** Disconnect and clear socket instance. */
// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };

// Common notification event keys (you can extend this to fit your backend)
export const NotificationEvents = {
  GENERIC: "notification",
} as const;

