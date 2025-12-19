/**
 * Utility functions for formatting payment status
 */

/**
 * Format bezahlt value to display string
 * Handles both old format (boolean/string) and new format (e.g., "Privat - Bezahlt")
 */
export function formatPaymentStatus(bezahlt: string | boolean | null | undefined): string {
  if (bezahlt === null || bezahlt === undefined || bezahlt === '') return ''

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

  // Handle new format: "Privat_Bezahlt", "Krankenkasse_Genehmigt", etc. (underscore format)
  if (bezahltStr.includes('_')) {
    return bezahltStr // Return as-is for underscore format
  }

  // Handle old format: "Privat - Bezahlt" (backward compatibility)
  if (bezahltStr.includes(' - ')) {
    return bezahltStr.replace(' - ', '_').replace('Offen', 'offen')
  }

  // Handle format with pipe separator (backward compatibility)
  if (bezahltStr.includes('|')) {
    return bezahltStr.replace('|', '_').replace('Offen', 'offen')
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
  if (!status) {
    return { bg: 'bg-gray-100', text: 'text-gray-600' }
  }

  const normalizedStatus = status.toLowerCase()

  // Check for unpaid/not approved statuses FIRST (more specific)
  // This must come before checking "genehmigt" because "ungenehmigt" contains "genehmigt"
  if (
    normalizedStatus.includes('ungenehmigt') ||
    normalizedStatus.includes('offen')
  ) {
    if (normalizedStatus.includes('privat')) {
      return { bg: 'bg-orange-100', text: 'text-orange-800' }
    }
    if (normalizedStatus.includes('krankenkasse')) {
      return { bg: 'bg-red-100', text: 'text-red-800' }
    }
    return { bg: 'bg-gray-100', text: 'text-gray-600' }
  }

  // Paid/approved statuses (check after unpaid to avoid substring matching issues)
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

  // Default
  return { bg: 'bg-gray-100', text: 'text-gray-600' }
}

/**
 * Normalize bezahlt value to consistent format (Privat_Bezahlt, Privat_offen, Krankenkasse_Genehmigt, Krankenkasse_Ungenehmigt)
 */
export function normalizePaymentStatus(bezahlt: string | boolean | null | undefined): string | null {
  if (bezahlt === null || bezahlt === undefined || bezahlt === '') return null

  // Handle boolean (old format) - default to Privat
  if (typeof bezahlt === 'boolean') {
    return bezahlt ? 'Privat_Bezahlt' : 'Privat_offen'
  }

  // Handle string
  const bezahltStr = String(bezahlt)

  // Handle old string format
  if (bezahltStr === 'true' || bezahltStr === 'True' || bezahltStr === 'Ja') {
    return 'Privat_Bezahlt'
  }
  if (bezahltStr === 'false' || bezahltStr === 'False' || bezahltStr === 'Nein') {
    return 'Privat_offen'
  }

  // Handle new format: "Privat_Bezahlt", "Krankenkasse_Genehmigt", etc. (underscore format)
  if (bezahltStr.includes('_')) {
    return bezahltStr // Return as-is for underscore format
  }

  // Handle old format: "Privat - Bezahlt" (backward compatibility)
  if (bezahltStr.includes(' - ')) {
    return bezahltStr.replace(' - ', '_').replace('Offen', 'offen')
  }

  // Handle format with pipe separator (backward compatibility)
  if (bezahltStr.includes('|')) {
    return bezahltStr.replace('|', '_').replace('Offen', 'offen')
  }

  return bezahltStr
}

