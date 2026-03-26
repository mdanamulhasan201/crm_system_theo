/**
 * Backend notification `type` → dashboard path.
 * Only these types are clickable in the notification popover.
 */
const ROUTE_BY_NOTIFICATION_TYPE: Record<string, string> = {
  Appointment_Reminder: "/dashboard/calendar",
  Appointment_Created: "/dashboard/calendar",
  updated_massschuhe_order_status: "/dashboard/balance-dashboard",
  admin_order_canceled: "/dashboard/manage-order",
  shop_interest: "/dashboard/shop-products",
};

export function getNotificationClickRoute(
  backendType: string | undefined
): string | null {
  if (!backendType) return null;
  if (ROUTE_BY_NOTIFICATION_TYPE[backendType]) {
    return ROUTE_BY_NOTIFICATION_TYPE[backendType];
  }
  const lower = backendType.toLowerCase();
  for (const [key, path] of Object.entries(ROUTE_BY_NOTIFICATION_TYPE)) {
    if (key.toLowerCase() === lower) return path;
  }
  return null;
}
