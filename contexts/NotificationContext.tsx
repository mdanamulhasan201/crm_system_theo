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
import {
  getAllNotifications,
  getUnreadCount,
  markAsRead as markAsReadApi,
  markAsDeepRead as markAsDeepReadApi,
  deleteNotification as deleteNotificationsApi,
} from "@/apis/Notifications/NotificationsApis";

const NOTIFICATION_PAGE_LIMIT = 20;

function parseNotificationPage(response: any): {
  rows: any[];
  nextCursor: string | null;
} {
  const rows = Array.isArray(response?.data) ? response.data : [];
  const p = response?.pagination ?? {};
  if (p.nextCursor != null && String(p.nextCursor).trim() !== "") {
    return { rows, nextCursor: String(p.nextCursor) };
  }
  if (p.cursor != null && String(p.cursor).trim() !== "") {
    return { rows, nextCursor: String(p.cursor) };
  }
  if (p.hasNextPage === true && rows.length > 0) {
    const last = rows[rows.length - 1];
    return {
      rows,
      nextCursor: last?.id != null ? String(last.id) : null,
    };
  }
  return { rows, nextCursor: null };
}
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
  /** false = still visually emphasized until user deep-reads (e.g. opened detail) */
  deepRead: boolean;
  type: "info" | "success" | "warning" | "error";
  /** Raw API `type` (e.g. Appointment_Created) — used for routing / click rules */
  backendType: string;
  route?: string; // Optional route from API (fallback; UI uses type-based routes where defined)
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreNotifications: boolean;
  loadMoreNotifications: () => Promise<void>;
  /** When the notification popover opens — PATCH mark-as-read and merge API `data`. */
  onOpenNotificationPanel: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  /** PATCH mark-as-deep-read for the given id; merges API `data` when present. */
  markNotificationDeepRead: (id: string) => Promise<void>;
  /** DELETE /v2/notifications/delete for the given ids; updates local list and unread count. */
  deleteNotifications: (ids: string[]) => Promise<void>;
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

  const backendType = (apiNotification.type ?? "").toString();

  return {
    id: apiNotification.id,
    // Simple default: show the message as the title; you can refine this later.
    title: apiNotification.message || "Neue Benachrichtigung",
    message: apiNotification.message || "",
    time: formattedTime,
    isRead: Boolean(apiNotification.isRead),
    deepRead: Boolean(apiNotification.deepRead),
    type: mappedType,
    backendType,
    route: apiNotification.route,
  };
}

function mergeStateAfterMarkAsRead(
  prev: Notification[],
  apiRows: any[]
): Notification[] {
  const byId = new Map(
    apiRows.map((row) => [row.id, mapApiNotification(row)])
  );
  return prev.map((n) =>
    byId.has(n.id) ? byId.get(n.id)! : { ...n, isRead: true }
  );
}

function mergeStateAfterDeepRead(
  prev: Notification[],
  apiRows: any[]
): Notification[] {
  if (apiRows.length === 0) return prev;
  const byId = new Map(
    apiRows.map((row) => [row.id, mapApiNotification(row)])
  );
  return prev.map((n) => (byId.has(n.id) ? byId.get(n.id)! : n));
}

function normalizeNotificationRows(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "id" in (data as object)) {
    return [data];
  }
  return [];
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [serverUnreadCount, setServerUnreadCount] = useState<number>(0);
  const { user } = useAuth();

  // === INITIAL LOAD FROM REST API ===========================================
  useEffect(() => {
    let isMounted = true;

    // Skip notifications for employees - they don't have access to this endpoint
    if (user?.role === 'EMPLOYEE') {
      console.log('[Notifications] Skipping notification fetch for employee user');
      setNotifications([]);
      setNextCursor(null);
      return;
    }

    const loadInitialNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await getAllNotifications(
          NOTIFICATION_PAGE_LIMIT,
          ""
        );
        if (!isMounted) return;

        const { rows, nextCursor: next } = parseNotificationPage(response);
        setNotifications(rows.map(mapApiNotification));
        setNextCursor(next);
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
      // console.log('[Notifications] Skipping socket connection for employee user');
      return;
    }

    // Initialise socket with userId and role - it will emit "join" event after connection
    initSocket(user?.id ?? null, user?.role ?? null);

    const socket = getSocket();
    if (!socket) return;

    /**
     * Event names that match your backend:
     * - "notification" → when a new notification is created (backend emits: io.to(partnerId).emit("notification", notification))
     * - "notification:read" → (optional) when a notification is marked as read elsewhere
     */

    const handleNewNotification = async (payload: any) => {
    //   console.log("[NotificationContext] Received notification:", payload);
      const mapped = mapApiNotification({
        ...payload,
        deepRead: payload?.deepRead ?? false,
      });
      setNotifications((prev) => {
        if (prev.some((n) => n.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });
      
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
          n.id === payload.id
            ? {
                ...n,
                isRead: true,
                deepRead:
                  payload.deepRead !== undefined
                    ? Boolean(payload.deepRead)
                    : n.deepRead,
              }
            : n
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

  const markNotificationDeepRead = async (id: string) => {
    if (user?.role === "EMPLOYEE") return;

    try {
      const response = await markAsDeepReadApi([id]);
      const rows = normalizeNotificationRows(response?.data);
      if (rows.length > 0) {
        setNotifications((prev) => mergeStateAfterDeepRead(prev, rows));
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, deepRead: true } : n))
        );
      }
    } catch (error) {
      console.error(
        "[NotificationProvider] Failed to mark notification deep read:",
        error
      );
      throw error;
    }
  };

  const loadMoreNotifications = async () => {
    if (user?.role === "EMPLOYEE") return;
    if (nextCursor == null || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const response = await getAllNotifications(
        NOTIFICATION_PAGE_LIMIT,
        nextCursor
      );
      const { rows, nextCursor: next } = parseNotificationPage(response);
      const mapped = rows.map(mapApiNotification);
      setNotifications((prev) => {
        const seen = new Set(prev.map((n) => n.id));
        const appended = mapped.filter((n) => !seen.has(n.id));
        return [...prev, ...appended];
      });
      setNextCursor(next);
    } catch (error) {
      console.error(
        "[NotificationProvider] Failed to load more notifications:",
        error
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const deleteNotifications = async (ids: string[]) => {
    if (user?.role === "EMPLOYEE") {
      throw new Error("Benachrichtigungen für diesen Benutzer nicht verfügbar.");
    }
    if (ids.length === 0) return;

    await deleteNotificationsApi(ids);
    setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
    try {
      const response = await getUnreadCount();
      const count = response.data?.count ?? response.count ?? 0;
      setServerUnreadCount(count);
    } catch (error) {
      console.error(
        "[NotificationProvider] Failed to refresh unread count after delete:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (unreadCount === 0) return;

    if (user?.role === "EMPLOYEE") return;

    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setServerUnreadCount(0);

    try {
      const response = await markAsReadApi();
      const rows = Array.isArray(response?.data) ? response.data : [];
      setNotifications((prev) => mergeStateAfterMarkAsRead(prev, rows));
      const countRes = await getUnreadCount();
      const count = countRes.data?.count ?? countRes.count ?? 0;
      setServerUnreadCount(count);
    } catch (error) {
      console.error("[NotificationProvider] Failed to mark all as read:", error);
      try {
        const response = await getUnreadCount();
        const count = response.data?.count ?? response.count ?? 0;
        setServerUnreadCount(count);
        const notificationsResponse = await getAllNotifications(
          NOTIFICATION_PAGE_LIMIT,
          ""
        );
        const { rows, nextCursor: next } =
          parseNotificationPage(notificationsResponse);
        setNotifications(rows.map(mapApiNotification));
        setNextCursor(next);
      } catch (err) {
        console.error(
          "[NotificationProvider] Failed to refresh after mark all as read:",
          err
        );
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

  const hasMoreNotifications = nextCursor != null;

  const onOpenNotificationPanel = async () => {
    if (user?.role === "EMPLOYEE") return;
    if (unreadCount === 0) return;

    try {
      const response = await markAsReadApi();
      const rows = Array.isArray(response?.data) ? response.data : [];
      setNotifications((prev) => mergeStateAfterMarkAsRead(prev, rows));
      setServerUnreadCount(0);
      try {
        const countRes = await getUnreadCount();
        const count = countRes.data?.count ?? countRes.count ?? 0;
        setServerUnreadCount(count);
      } catch (error) {
        console.error(
          "[NotificationProvider] Failed to refresh unread count after panel open:",
          error
        );
      }
    } catch (error) {
      console.error(
        "[NotificationProvider] Failed to mark as read on panel open:",
        error
      );
    }
  };

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMoreNotifications,
    loadMoreNotifications,
    onOpenNotificationPanel,
    markAsRead,
    markNotificationDeepRead,
    deleteNotifications,
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


