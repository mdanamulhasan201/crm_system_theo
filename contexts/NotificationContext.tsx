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
import { getAllNotifications, getUnreadCount, markAsRead as markAsReadApi } from "@/apis/Notifications/NotificationsApis";
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
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => void;
  markAllAsRead: () => Promise<void>;
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
  const [serverUnreadCount, setServerUnreadCount] = useState<number>(0);
  const { user } = useAuth();

  // === INITIAL LOAD FROM REST API ===========================================
  useEffect(() => {
    let isMounted = true;

    // Skip notifications for employees - they don't have access to this endpoint
    if (user?.role === 'EMPLOYEE') {
      console.log('[Notifications] Skipping notification fetch for employee user');
      return;
    }

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
      } catch (error: any) {
        // Handle 403 errors gracefully for employees
        if (error.response?.status === 403) {
          console.log("[NotificationProvider] Access denied (403) - likely employee user");
        } else {
          console.error(
            "[NotificationProvider] Failed to load notifications:",
            error
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const loadUnreadCount = async () => {
      try {
        const response = await getUnreadCount();
        if (!isMounted) return;
        // Assuming the API returns { data: { count: number } } or { count: number }
        const count = response.data?.count ?? response.count ?? 0;
        setServerUnreadCount(count);
      } catch (error: any) {
        // Handle 403 errors gracefully for employees
        if (error.response?.status === 403) {
          console.log("[NotificationProvider] Access denied (403) - likely employee user");
        } else {
          console.error(
            "[NotificationProvider] Failed to load unread count:",
            error
          );
        }
      }
    };

    loadInitialNotifications();
    loadUnreadCount();

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  // === REAL‑TIME UPDATES VIA SOCKET.IO ======================================
  useEffect(() => {
    // Skip socket connection for employees
    if (user?.role === 'EMPLOYEE') {
      console.log('[Notifications] Skipping socket connection for employee user');
      return;
    }

    // Initialise socket with userId - it will emit "join" event after connection
    initSocket(user?.id ?? null);

    const socket = getSocket();
    if (!socket) return;

    /**
     * Event names that match your backend:
     * - "notification" → when a new notification is created (backend emits: io.to(partnerId).emit("notification", notification))
     * - "notification:read" → (optional) when a notification is marked as read elsewhere
     */

    const handleNewNotification = async (payload: any) => {
    //   console.log("[NotificationContext] Received notification:", payload);
      const mapped = mapApiNotification(payload);
      setNotifications((prev) => [mapped, ...prev]);
      
      // Update unread count when new notification arrives
      if (!mapped.isRead) {
        setServerUnreadCount((prev) => prev + 1);
        // Optionally refresh from server to ensure accuracy
        try {
          const response = await getUnreadCount();
          const count = response.data?.count ?? response.count ?? 0;
          setServerUnreadCount(count);
        } catch (error) {
          console.error("[NotificationProvider] Failed to refresh unread count after new notification:", error);
        }
      }
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

  const markAsRead = async (id: string) => {
    // Only update local UI state for individual notification
    // The API endpoint marks ALL notifications as read, so we don't call it for individual items
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    // Update server unread count optimistically
    setServerUnreadCount((prev) => Math.max(0, prev - 1));

    // Refresh unread count from server to ensure sync
    try {
      const response = await getUnreadCount();
      const count = response.data?.count ?? response.count ?? 0;
      setServerUnreadCount(count);
    } catch (error) {
      console.error("[NotificationProvider] Failed to refresh unread count:", error);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    // TODO: Call delete API here when available.
  };

  const markAllAsRead = async () => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    
    if (unreadCount === 0) return;

    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setServerUnreadCount(0);

    // Call backend API to mark all notifications as read
    try {
      await markAsReadApi();
      // Refresh unread count from server to ensure sync
      const response = await getUnreadCount();
      const count = response.data?.count ?? response.count ?? 0;
      setServerUnreadCount(count);
      // Reload notifications to get accurate read status from server
      const notificationsResponse = await getAllNotifications(1, 20);
      const apiNotifications = Array.isArray(notificationsResponse.data)
        ? notificationsResponse.data
        : [];
      setNotifications(apiNotifications.map(mapApiNotification));
    } catch (error) {
      console.error("[NotificationProvider] Failed to mark all as read:", error);
      // Refresh unread count to get accurate value
      try {
        const response = await getUnreadCount();
        const count = response.data?.count ?? response.count ?? 0;
        setServerUnreadCount(count);
        // Reload notifications to get accurate read status
        const notificationsResponse = await getAllNotifications(1, 20);
        const apiNotifications = Array.isArray(notificationsResponse.data)
          ? notificationsResponse.data
          : [];
        setNotifications(apiNotifications.map(mapApiNotification));
      } catch (err) {
        console.error("[NotificationProvider] Failed to refresh after mark all as read:", err);
      }
    }
  };

  // Use server unread count if available, otherwise fall back to local calculation
  const unreadCount = useMemo(() => {
    // If we have a server count, use it (more accurate)
    // Otherwise calculate from local notifications
    return serverUnreadCount > 0 || notifications.length > 0
      ? serverUnreadCount || notifications.filter((n) => !n.isRead).length
      : notifications.filter((n) => !n.isRead).length;
  }, [notifications, serverUnreadCount]);

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


