/**
 * Utility functions for formatting payment status
 */

/**
 * Format bezahlt value to display string
 * Handles both old format (boolean/string) and new format (e.g., "Privat - Bezahlt")
 */
export function formatPaymentStatus(bezahlt: string | boolean | null | undefined): string {
  if (!bezahlt) return 'Offen'

  // Handle boolean (old format)
  if (typeof bezahlt === 'boolean') {
    return bezahlt ? 'Bezahlt' : 'Offen'
  }

  // Handle string
  const bezahltStr = String(bezahlt)

  // Handle old string format
  if (bezahltStr === 'true' || bezahltStr === 'True' || bezahltStr === 'Ja') {
    return 'Bezahlt'
  }
  if (bezahltStr === 'false' || bezahltStr === 'False' || bezahltStr === 'Nein') {
    return 'Offen'
  }

  // Handle new format: "Privat - Bezahlt", "Krankenkasse - Genehmigt", etc.
  if (bezahltStr.includes(' - ')) {
    return bezahltStr // Return as-is for new format
  }

  // Handle format with pipe separator
  if (bezahltStr.includes('|')) {
    return bezahltStr.replace('|', ' - ')
  }

  return bezahltStr
}

/**
 * Get payment status badge color based on status
 */
export function getPaymentStatusColor(status: string): {
  bg: string
  text: string
} {
  const normalizedStatus = status.toLowerCase()

  // Paid statuses
  if (
    normalizedStatus.includes('bezahlt') ||
    normalizedStatus.includes('genehmigt')
  ) {
    if (normalizedStatus.includes('privat')) {
      return { bg: 'bg-emerald-100', text: 'text-emerald-800' }
    }
    if (normalizedStatus.includes('krankenkasse')) {
      return { bg: 'bg-blue-100', text: 'text-blue-800' }
    }
    return { bg: 'bg-emerald-100', text: 'text-emerald-800' }
  }

  // Unpaid/Not approved statuses
  if (
    normalizedStatus.includes('offen') ||
    normalizedStatus.includes('ungenehmigt')
  ) {
    if (normalizedStatus.includes('privat')) {
      return { bg: 'bg-orange-100', text: 'text-orange-800' }
    }
    if (normalizedStatus.includes('krankenkasse')) {
      return { bg: 'bg-red-100', text: 'text-red-800' }
    }
    return { bg: 'bg-gray-100', text: 'text-gray-600' }
  }

  // Default
  return { bg: 'bg-gray-100', text: 'text-gray-600' }
}

