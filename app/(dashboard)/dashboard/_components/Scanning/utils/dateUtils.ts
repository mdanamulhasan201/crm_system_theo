/**
 * Utility functions for date calculations in Werkstattzettel
 */

/**
 * Calculate delivery date based on completionDays or minimum (5 days)
 */
export function calculateDeliveryDate(
  orderDate: string,
  completionDays?: string | number
): string {
  const order = new Date(orderDate)
  const deliveryDate = new Date(order)

  if (completionDays) {
    const daysToAdd = parseInt(String(completionDays), 10)
    if (!isNaN(daysToAdd)) {
      deliveryDate.setDate(order.getDate() + daysToAdd)
      return deliveryDate.toISOString().slice(0, 10)
    }
  }

  // Fallback to 5 days minimum
  deliveryDate.setDate(order.getDate() + 5)
  return deliveryDate.toISOString().slice(0, 10)
}

/**
 * Calculate minimum delivery date (5 days from order date)
 */
export function getMinimumDeliveryDate(orderDate: string): string {
  const order = new Date(orderDate)
  const minimumDelivery = new Date(order)
  minimumDelivery.setDate(order.getDate() + 5)
  return minimumDelivery.toISOString().slice(0, 10)
}

/**
 * Get required delivery date (calculated or minimum, whichever is later)
 */
export function getRequiredDeliveryDate(
  orderDate: string,
  completionDays?: string | number
): string {
  const calculated = calculateDeliveryDate(orderDate, completionDays)
  const minimum = getMinimumDeliveryDate(orderDate)
  return new Date(calculated) >= new Date(minimum) ? calculated : minimum
}

/**
 * Format date with current time for ISO string
 */
export function formatDateWithCurrentTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  date.setHours(now.getHours())
  date.setMinutes(now.getMinutes())
  date.setSeconds(now.getSeconds())
  date.setMilliseconds(now.getMilliseconds())
  return date.toISOString()
}

/**
 * Initialize delivery date based on scanData and formData
 */
export function initializeDeliveryDate(
  scanData: any,
  formData?: any
): string {
  const today = new Date().toISOString().slice(0, 10)
  const currentOrderDate = scanData?.datumAuftrag || today
  const completionDays = scanData?.workshopNote?.completionDays

  // Calculate delivery date based on completionDays
  let calculatedDeliveryDate = ''
  if (completionDays) {
    const daysToAdd = parseInt(String(completionDays), 10)
    if (!isNaN(daysToAdd) && currentOrderDate) {
      const orderDate = new Date(currentOrderDate)
      const deliveryDate = new Date(orderDate)
      deliveryDate.setDate(orderDate.getDate() + daysToAdd)
      calculatedDeliveryDate = deliveryDate.toISOString().slice(0, 10)
    }
  }

  // Use calculated date, existing delivery date, or minimum (5 days) as fallback
  const existingDeliveryDate = scanData?.fertigstellungBis || ''
  if (calculatedDeliveryDate) {
    return calculatedDeliveryDate
  } else if (existingDeliveryDate) {
    return existingDeliveryDate
  } else {
    // Default to 5 days minimum if no completionDays or existing date
    const minimumDelivery = new Date(currentOrderDate)
    minimumDelivery.setDate(minimumDelivery.getDate() + 5)
    return minimumDelivery.toISOString().slice(0, 10)
  }
}

