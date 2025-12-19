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
  geschaeftsstandort: string
  fertigstellungBis: string
  fertigstellungBisTime?: string
  bezahlt: string
  employeeId: string
  footAnalysisPrice: string
  insoleSupplyPrice: string
}

/**
 * Create payload for API request
 */
export function createWerkstattzettelPayload(
  formData: WerkstattzettelFormData,
  customerId: string
) {
  const parsedFoot = Number(formData.footAnalysisPrice)
  const parsedInsole = Number(formData.insoleSupplyPrice)

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

  return {
    kundenName: `${formData.vorname} ${formData.nachname}`.trim(),
    auftragsDatum: auftragsIso,
    wohnort: formData.wohnort || undefined,
    telefon: formData.telefonnummer || undefined,
    email: formData.email || undefined,
    geschaeftsstandort: formData.geschaeftsstandort || undefined,
    mitarbeiter: formData.mitarbeiter || undefined,
    employeeId: formData.employeeId || undefined, // This will be mapped to werkstattEmployeeId in order payload
    fertigstellungBis: fertigIso,
    versorgung: formData.versorgung || undefined,
    bezahlt: formData.bezahlt || undefined, // Now accepts string format like "Privat - Bezahlt"
    fussanalysePreis: isNaN(parsedFoot) ? 0 : parsedFoot,
    einlagenversorgungPreis: isNaN(parsedInsole) ? 0 : parsedInsole,
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

