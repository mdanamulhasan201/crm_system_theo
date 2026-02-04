import { useState, useCallback } from 'react'
import { updateUserProfile } from '@/apis/authApis'

export type PartnerProfileUpdatePayload = {
  name?: string
  businessName?: string
  phone?: string
  absenderEmail?: string
  busnessName?: string
  bankName?: string
  bankNumber?: string
  image?: File | null
  hauptstandort?: string[]
  defaultHauptstandort?: string
  vatNumber?: string
  vatCountry?: string
}

export function useUpdatePartnerInfo() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(async (payload: PartnerProfileUpdatePayload) => {
    setIsLoading(true)
    setError(null)
    try {
      const form = new FormData()
      if (payload.name !== undefined) form.append('name', payload.name)
      if (payload.businessName !== undefined) form.append('businessName', payload.businessName)
      if (payload.phone !== undefined) form.append('phone', payload.phone)
      if (payload.absenderEmail !== undefined) form.append('absenderEmail', payload.absenderEmail)
      if (payload.busnessName !== undefined) form.append('busnessName', payload.busnessName)
      if (payload.bankName !== undefined) form.append('bankName', payload.bankName)
      if (payload.bankNumber !== undefined) form.append('bankNumber', payload.bankNumber)
      if (payload.hauptstandort !== undefined) {
        payload.hauptstandort.forEach((location, index) => {
          form.append(`hauptstandort[${index}]`, location)
        })
      }
      if (payload.defaultHauptstandort !== undefined) form.append('defaultHauptstandort', payload.defaultHauptstandort)
      if (payload.image) form.append('image', payload.image)
      if (payload.vatNumber !== undefined) form.append('vat_number', payload.vatNumber)
      if (payload.vatCountry !== undefined) form.append('vat_country', payload.vatCountry)

      const res = await updateUserProfile(form)
      return res
    } catch (e: any) {
      const message = e?.message || 'Failed to update profile'
      setError(message)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { update, isLoading, error }
}

export default useUpdatePartnerInfo 