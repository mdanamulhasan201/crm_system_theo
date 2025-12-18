"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { initSocket, getSocket } from "@/lib/socket";
import { getAllNotifications } from "@/apis/Notifications/NotificationsApis";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Shape of a single notification as used in the UI.
 *
 * NOTE:
 * - This is a *frontend* model; it does not have to be 1:1 with the backend DTO.
 * - We map the API response to this type in the provider.
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string; // Already formatted for display (e.g. "18.12.2025, 15:23")
  isRead: boolean;
  type: "info" | "success" | "warning" | "error";
  route?: string; // Optional route to navigate on click (e.g. "/appointments/123")
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Maps the raw API notification shape to the UI friendly `Notification` type.
 *
 * Adjust this mapping if the backend response changes.
 */
function mapApiNotification(apiNotification: any): Notification {
  // Fallbacks & safety checks to keep the UI stable even if some fields are missing.
  const createdAt = apiNotification.createdAt ?? new Date().toISOString();
  const date = new Date(createdAt);

  const formattedTime = isNaN(date.getTime())
    ? ""
    : date.toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  // Map backend `type` to one of our four visual types
  const rawType = (apiNotification.type || "").toString().toLowerCase();
  let mappedType: Notification["type"] = "info";

  if (rawType.includes("success")) mappedType = "success";
  else if (rawType.includes("warn")) mappedType = "warning";
  else if (rawType.includes("error") || rawType.includes("fail"))
    mappedType = "error";

  return {
    id: apiNotification.id,
    // Simple default: show the message as the title; you can refine this later.
    title: apiNotification.message || "Neue Benachrichtigung",
    message: apiNotification.message || "",
    time: formattedTime,
    isRead: Boolean(apiNotification.isRead),
    type: mappedType,
    route: apiNotification.route,
  };
}

/**
 * NotificationProvider:
 * - Loads the initial notifications from the REST API.
 * - Subscribes to real‑time updates over Socket.IO.
 * - Exposes data + simple actions (mark as read, delete, mark all).
 *
 * This keeps all notification logic in one place and lets the UI
 * remain purely presentational.
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // === INITIAL LOAD FROM REST API ===========================================
  useEffect(() => {
    let isMounted = true;

    const loadInitialNotifications = async () => {
      try {
        setIsLoading(true);
        // Adjust page/limit depending on how many notifications you want initially
        const response = await getAllNotifications(1, 20);

        const apiNotifications = Array.isArray(response.data)
          ? response.data
          : [];

        if (!isMounted) return;

        setNotifications(apiNotifications.map(mapApiNotification));
      } catch (error) {
        console.error(
          "[NotificationProvider] Failed to load notifications:",
          error
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  // === REAL‑TIME UPDATES VIA SOCKET.IO ======================================
  useEffect(() => {
    // Initialise socket with userId - it will emit "join" event after connection
    initSocket(user?.id ?? null);

    const socket = getSocket();
    if (!socket) return;

    /**
     * Event names that match your backend:
     * - "notification" → when a new notification is created (backend emits: io.to(partnerId).emit("notification", notification))
     * - "notification:read" → (optional) when a notification is marked as read elsewhere
     */

    const handleNewNotification = (payload: any) => {
    //   console.log("[NotificationContext] Received notification:", payload);
      const mapped = mapApiNotification(payload);
      setNotifications((prev) => [mapped, ...prev]);
    };

    // Listen for "notification" event (matches your backend: io.to(partnerId).emit("notification", notification))
    socket.on("notification", handleNewNotification);

    // OPTIONAL: if your backend emits read-status changes, handle them here:
    const handleNotificationRead = (payload: any) => {
      if (!payload?.id) return;
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === payload.id ? { ...n, isRead: true } : n
        )
      );
    };

    socket.on("notification:read", handleNotificationRead);

    // Note: "join" event is automatically emitted in initSocket() after connection
    // Your backend listens for: socket.on("join", (userId) => { socket.join(userId); })
    // Backend emits: io.to(partnerId).emit("notification", notification)

    return () => {
      socket.off("notification", handleNewNotification);
      socket.off("notification:read", handleNotificationRead);
    };
  }, [user?.id]);

  // === LOCAL ACTIONS (UI STATE) ============================================

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    // TODO: If you have a backend endpoint for this, call it here.
    // Example:
    // markNotificationAsRead(id).catch((err) => {
    //   console.error("Failed to mark as read", err);
    // });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    // TODO: Call delete API here when available.
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    // TODO: Call "mark all as read" API here when available.
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Convenience hook for accessing notifications inside client components.
 *
 * Usage:
 * const { notifications, unreadCount, markAsRead } = useNotifications();
 */
export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return ctx;
}


