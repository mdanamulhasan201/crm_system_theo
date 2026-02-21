/**
 * Utility functions for form data handling in Werkstattzettel
 */

import { formatDateWithCurrentTime } from './dateUtils'

export interface WerkstattzettelFormData {
  vorname: string
  nachname: string
  email: string
  telefonnummer: string
  wohnort: string
  mitarbeiter: string
  versorgung: string
  datumAuftrag: string
  geschaeftsstandort: {id: string; address: string; description: string; isPrimary?: boolean} | null
  auftragAngenommenBei?: {id: string; address: string; description: string; isPrimary?: boolean} | null
  fertigstellungBis: string
  fertigstellungBisTime?: string
  bezahlt: string
  employeeId: string
  footAnalysisPrice: string
  insoleSupplyPrice: string
  quantity?: number
  discount?: number
  discountType?: string
  addonPrices?: string
  positionsnummerTotal?: number
  selectedVersorgungData?: { supplyStatus?: { price?: number }; price?: number }
}

/**
 * Create payload for API request
 */
export function createWerkstattzettelPayload(
  formData: WerkstattzettelFormData,
  customerId: string
) {
  const parsedFoot = Number(formData.footAnalysisPrice)
  let parsedInsole = Number(formData.insoleSupplyPrice)
  // Fallback: use selectedVersorgungData when insoleSupplyPrice is 0 (e.g. from Einlagen flow)
  if (isNaN(parsedInsole) || parsedInsole === 0) {
    const fallback = (formData as any).selectedVersorgungData?.supplyStatus?.price ?? (formData as any).selectedVersorgungData?.price
    if (fallback != null && !isNaN(Number(fallback))) parsedInsole = Number(fallback)
  }

  const auftragsIso = formData.datumAuftrag
    ? `${formData.datumAuftrag}T00:00:00.000Z`
    : undefined

  // Use selected time (if available) or current time for fertigstellungBis
  const fertigIso = formData.fertigstellungBis
    ? formatDateWithCurrentTime(
        formData.fertigstellungBis,
        formData.fertigstellungBisTime
      )
    : undefined

  // Ensure discount is a valid number
  const parsedDiscount = formData.discount !== undefined && formData.discount !== null 
    ? (typeof formData.discount === 'number' ? formData.discount : Number(formData.discount))
    : undefined
  const validDiscount = parsedDiscount !== undefined && !isNaN(parsedDiscount) ? parsedDiscount : undefined

  // Parse addon prices - supports single number or comma/space-separated (e.g. "10" or "10, 20, 5")
  const addonPricesTotal = (() => {
    const raw = formData.addonPrices
    if (!raw || typeof raw !== 'string') return 0
    const parts = raw.split(/[,\s]+/).filter(Boolean)
    return parts.reduce((sum, p) => sum + (parseFloat(p.replace(',', '.')) || 0), 0)
  })()

  const fussanalysePreis = isNaN(parsedFoot) ? 0 : parsedFoot
  const einlagenversorgungPreis = isNaN(parsedInsole) ? 0 : parsedInsole
  const quantityNum = formData.quantity ?? 1
  const positionsnummerTotal = (formData as any).positionsnummerTotal != null && (formData as any).positionsnummerTotal > 0
    ? (formData as any).positionsnummerTotal
    : 0
  const subtotal = fussanalysePreis + einlagenversorgungPreis * quantityNum + addonPricesTotal + positionsnummerTotal
  const discountAmount = validDiscount != null && formData.discountType === 'percentage'
    ? (subtotal * validDiscount) / 100
    : 0
  const totalPrice = subtotal - discountAmount

  // Map bezahlt to paymentStatus - keep both for API compatibility
  const bezahltValue = formData.bezahlt && formData.bezahlt.trim() !== '' ? formData.bezahlt : undefined
  const paymentStatus = bezahltValue

  return {
    kundenName: `${formData.vorname} ${formData.nachname}`.trim(),
    auftragsDatum: auftragsIso,
    wohnort: formData.wohnort || undefined,
    telefon: formData.telefonnummer || undefined,
    email: formData.email || undefined,
    geschaeftsstandort: formData.geschaeftsstandort ? {
      address: formData.geschaeftsstandort.address,
      description: formData.geschaeftsstandort.description
    } : undefined,
    auftragAngenommenBei: (formData as any).auftragAngenommenBei ? {
      address: (formData as any).auftragAngenommenBei.address,
      description: (formData as any).auftragAngenommenBei.description
    } : undefined,
    mitarbeiter: formData.mitarbeiter || undefined,
    employeeId: formData.employeeId || undefined, // This will be mapped to werkstattEmployeeId in order payload
    fertigstellungBis: fertigIso,
    versorgung: formData.versorgung || undefined,
    bezahlt: bezahltValue, // Required by API
    paymentStatus: paymentStatus, // New field
    fussanalysePreis,
    einlagenversorgungPreis,
    fußanalyse: fussanalysePreis,
    einlagenversorgung: einlagenversorgungPreis,
    quantity: formData.quantity || undefined,
    discount: validDiscount,
    discountType: formData.discountType || undefined,
    addonPrices: addonPricesTotal > 0 ? addonPricesTotal : undefined,
    positionsnummerTotal: positionsnummerTotal > 0 ? positionsnummerTotal : undefined,
    totalPrice: Math.round(totalPrice * 100) / 100,
  }
}

/**
 * Initialize form data from scanData
 */
export function initializeFormData(scanData: any, formData?: any) {
  const today = new Date().toISOString().slice(0, 10)

  // Employee name priority: formData > workshopNote > scanData
  const employeeName =
    formData?.employeeName ||
    scanData?.workshopNote?.employeeName ||
    scanData?.mitarbeiter ||
    ''

  // Versorgung priority: formData > scanData > formData.versorgung_note
  const versorgungValue =
    formData?.versorgung || scanData?.versorgung || formData?.versorgung_note || ''

  // Geschäftsstandort from partner when sameAsBusiness is true
  const sameAsBusiness = scanData?.workshopNote?.sameAsBusiness
  const partnerHauptstandort = scanData?.partner?.hauptstandort
  const locationValue = Array.isArray(partnerHauptstandort)
    ? sameAsBusiness && partnerHauptstandort.length > 0
      ? partnerHauptstandort[0]
      : ''
    : sameAsBusiness
      ? partnerHauptstandort || ''
      : ''

  return {
    vorname: scanData?.vorname || '',
    nachname: scanData?.nachname || '',
    email: scanData?.email || '',
    telefonnummer: scanData?.telefonnummer || scanData?.telefon || '',
    wohnort: scanData?.wohnort || '',
    mitarbeiter: employeeName,
    versorgung: versorgungValue,
    datumAuftrag: scanData?.datumAuftrag || today,
    geschaeftsstandort: locationValue,
    bezahlt: (() => {
      // Convert boolean to new string format (underscore format)
      const bezahltValue = scanData?.bezahlt
      if (typeof bezahltValue === 'boolean') {
        return bezahltValue ? 'Privat_Bezahlt' : 'Privat_offen'
      }
      if (typeof bezahltValue === 'string') {
        // Handle old string format
        if (bezahltValue === 'true' || bezahltValue === 'True' || bezahltValue === 'Ja') {
          return 'Privat_Bezahlt'
        }
        if (bezahltValue === 'false' || bezahltValue === 'False' || bezahltValue === 'Nein') {
          return 'Privat_offen'
        }
        // Convert old dash format to underscore format
        if (bezahltValue.includes(' - ')) {
          const [type, status] = bezahltValue.split(' - ')
          const formattedStatus = status === 'Offen' ? 'offen' : status
          return `${type}_${formattedStatus}`
        }
        // Return as-is if already in underscore format
        return bezahltValue
      }
      return ''
    })(),
    employeeId: formData?.employeeId || '',
    footAnalysisPrice:
      typeof scanData?.fußanalyse === 'number'
        ? String(scanData.fußanalyse)
        : scanData?.fußanalyse || '',
    insoleSupplyPrice:
      typeof scanData?.einlagenversorgung === 'number'
        ? String(scanData.einlagenversorgung)
        : scanData?.einlagenversorgung || '',
  }
}

