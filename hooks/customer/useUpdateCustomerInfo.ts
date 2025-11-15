import { useState } from 'react'
import { updateCustomerInfo as updateCustomerInfoAPI } from '@/apis/customerApis'

interface CustomerUpdateData {
    vorname?: string
    nachname?: string
    email?: string
    telefon?: string
    telefonnummer?: string
    wohnort?: string
    ort?: string
    gender?: string
    geburtsdatum?: string
    straße?: string
    land?: string
    fusslange1?: string
    fusslange2?: string
    fussbreite1?: string
    fussbreite2?: string
    kugelumfang1?: string
    kugelumfang2?: string
    rist1?: string
    rist2?: string
    zehentyp1?: string
    zehentyp2?: string
    archIndex1?: string
    archIndex2?: string
    ausfuhrliche_diagnose?: string
    kundeSteuernummer?: string
    diagnose?: string
    kodexeMassschuhe?: string
    kodexeEinlagen?: string
    sonstiges?: string
    // Pricing information
    fußanalyse?: number
    einlagenversorgung?: number
    zusatzpreis?: number
}

interface UseUpdateCustomerInfoReturn {
    isUpdating: boolean
    error: string | null
    updateCustomerInfo: (customerId: string, customerData: CustomerUpdateData) => Promise<boolean>
}

export const useUpdateCustomerInfo = (): UseUpdateCustomerInfoReturn => {
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const updateCustomerInfo = async (
        customerId: string, 
        customerData: CustomerUpdateData
    ): Promise<boolean> => {
        setIsUpdating(true)
        setError(null)

        try {
            // Send data directly in request body, not as FormData
            const response = await updateCustomerInfoAPI(customerId, customerData)
            
            if (response.success) {
                return true
            } else {
                setError(response.message || 'Failed to update customer information')
                return false
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred while updating customer information'
            setError(errorMessage)
            return false
        } finally {
            setIsUpdating(false)
        }
    }

    return {
        isUpdating,
        error,
        updateCustomerInfo
    }
}
