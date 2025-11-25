import { useState, useEffect } from 'react'
import { getSingleCustomer, deleteCustomer } from '@/apis/customerApis'
import { ScanData } from '@/types/scan'
import { useUpdateCustomerInfo } from './useUpdateCustomerInfo'

interface UseSingleCustomerReturn {
    customer: ScanData | null
    availableDates: string[]
    loading: boolean
    error: string | null
    isUpdating: boolean
    isDeleting: boolean
    fetchCustomer: (id: string, date?: string) => Promise<void>
    updateCustomer: (customerData: any) => Promise<boolean>
    deleteCustomer: (id: string) => Promise<boolean>
    refreshCustomer: (date?: string) => Promise<void>
}

export const useSingleCustomer = (customerId?: string, selectedDate?: string): UseSingleCustomerReturn => {
    const [customer, setCustomer] = useState<ScanData | null>(null)
    const [availableDates, setAvailableDates] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    // Use the existing update hook
    const { updateCustomerInfo, isUpdating, error: updateError } = useUpdateCustomerInfo()

    const fetchCustomer = async (id: string, date?: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await getSingleCustomer(id, date)
            const payload = Array.isArray(response?.data) ? response.data[0] : response?.data
            setCustomer(payload)
            
            // Extract availableDates from response
            if (response?.availableDates && Array.isArray(response.availableDates)) {
                setAvailableDates(response.availableDates)
            } else if (payload?.screenerFile && Array.isArray(payload.screenerFile)) {
                // Fallback: extract dates from screenerFile
                const dates = payload.screenerFile
                    .filter((file: any) => file?.updatedAt)
                    .map((file: any) => file.updatedAt)
                    .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())
                setAvailableDates(dates)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch customer data'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const updateCustomer = async (customerData: any): Promise<boolean> => {
        if (!customer?.id) {
            setError('No customer ID available for update')
            return false
        }

        try {
            const success = await updateCustomerInfo(customer.id, customerData)

            if (success) {
                // Update local state with new data
                setCustomer(prev => prev ? { ...prev, ...customerData } : null)
                return true
            } else {
                return false
            }
        } catch (err: any) {
            setError('Failed to update customer information')
            return false
        }
    }

    const handleDeleteCustomer = async (id: string): Promise<boolean> => {
        setIsDeleting(true)
        setError(null)

        try {
            await deleteCustomer(id)
            return true
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete customer'
            setError(errorMessage)
            return false
        } finally {
            setIsDeleting(false)
        }
    }

    const refreshCustomer = async (date?: string) => {
        if (customer?.id) {
            await fetchCustomer(customer.id, date)
        }
    }

    // Auto-fetch customer when customerId or selectedDate changes
    useEffect(() => {
        if (customerId) {
            fetchCustomer(customerId, selectedDate)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId, selectedDate])

    // Use update error if available
    useEffect(() => {
        if (updateError) {
            setError(updateError)
        }
    }, [updateError])

    return {
        customer,
        availableDates,
        loading,
        error,
        isUpdating,
        isDeleting,
        fetchCustomer,
        updateCustomer,
        deleteCustomer: handleDeleteCustomer,
        refreshCustomer
    }
}
