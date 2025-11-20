"use client"
import React from 'react'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getSingleCustomer } from '@/apis/customerApis'
import { useUpdateCustomerInfo } from '@/hooks/customer/useUpdateCustomerInfo'
import { FiEdit } from 'react-icons/fi'
import ScanningDataUpdate from './ScanningDataUpdate'
import { toast } from 'react-hot-toast'

interface UpdateUserDataProps {
    customerId: string
    onCustomerUpdate?: () => void
}

interface CustomerInfoForm {
    vorname: string
    nachname: string
    email: string
    telefonnummer?: string
    wohnort?: string
}

export default function UpdateUserData({ customerId, onCustomerUpdate }: UpdateUserDataProps) {
    const [customer, setCustomer] = useState<any>(null)
    const [isEditing, setIsEditing] = useState<boolean>(false)

    const {
        isUpdating,
        error: updateError,
        updateCustomerInfo
    } = useUpdateCustomerInfo()

    const form = useForm<CustomerInfoForm>({
        defaultValues: {
            vorname: '',
            nachname: '',
            email: '',
            telefonnummer: '',
            wohnort: '',
        },
    })



    useEffect(() => {
        let mounted = true
        const fetchData = async () => {
            try {
                const response = await getSingleCustomer(customerId)
                const payload = Array.isArray((response as any)?.data)
                    ? (response as any).data[0]
                    : Array.isArray(response)
                        ? (response as any)[0]
                        : (response as any)?.data ?? response
                if (!mounted) return
                setCustomer(payload)
                form.reset({
                    vorname: payload?.vorname || '',
                    nachname: payload?.nachname || '',
                    email: payload?.email || '',
                    telefonnummer: payload?.telefon || '',
                    wohnort: payload?.wohnort || '',
                })
            } catch (e) {
                // noop - surface via UI if needed later
            }
        }
        void fetchData()
        return () => {
            mounted = false
        }
    }, [customerId, form])

    const handleSubmit = async (values: CustomerInfoForm) => {

        try {
            // Only send fields that have actually changed
            const changedFields: Partial<CustomerInfoForm> = {}

            if (values.vorname !== customer?.vorname) {
                changedFields.vorname = values.vorname
            }
            if (values.nachname !== customer?.nachname) {
                changedFields.nachname = values.nachname
            }
            if (values.email !== customer?.email) {
                changedFields.email = values.email
            }
            if (values.telefonnummer !== customer?.telefon) {
                (changedFields as any).telefon = values.telefonnummer
            }
            if (values.wohnort !== customer?.wohnort) {
                changedFields.wohnort = values.wohnort
            }

            // Only update if there are actual changes
            if (Object.keys(changedFields).length === 0) {
                toast('No changes detected', {
                    icon: 'ℹ️',
                    style: {
                        background: '#3B82F6',
                        color: '#fff',
                    },
                })
                setIsEditing(false)
                return
            }

            const success = await updateCustomerInfo(customerId, changedFields)

            if (success) {
                // Show success toast
                toast.success('Customer information updated successfully!')

                // Refresh customer data to show updated information
                const response = await getSingleCustomer(customerId)
                const payload = Array.isArray((response as any)?.data)
                    ? (response as any).data[0]
                    : Array.isArray(response)
                        ? (response as any)[0]
                        : (response as any)?.data ?? response
                setCustomer(payload)
                setIsEditing(false)

                // Notify parent component to refresh data
                if (onCustomerUpdate) {
                    onCustomerUpdate()
                }
            } else {
                // Show error toast
                toast.error('Failed to update customer information')
            }
        } catch (e) {
            toast.error('An error occurred while updating customer information')
        }
    }

    const handleCancel = () => {
        if (customer) {
            form.reset({
                vorname: customer?.vorname || '',
                nachname: customer?.nachname || '',
                email: customer?.email || '',
                telefonnummer: customer?.telefon || '',
                wohnort: customer?.wohnort || '',
            })
        }
        setIsEditing(false)
    }





    return (
        <div className="space-y-6">
            {/* Customer Information */}
            <div className='mt-10'>
                <div className='flex justify-between items-center'>
                    <h3 className="text-lg font-semibold mb-3">Kundendaten</h3>
                    {/* edit icon */}
                    {!isEditing ? (
                        <button type="button" onClick={() => setIsEditing(true)} className='bg-gray-100 hover:bg-gray-200 cursor-pointer p-2 rounded-md'>
                            <FiEdit />
                        </button>
                    ) : (
                        <div className='flex items-center gap-2'>
                            <Button type="button" variant="outline" className='cursor-pointer' onClick={handleCancel} disabled={isUpdating}>
                                Abbrechen
                            </Button>
                            <Button
                                type="button"
                                className='bg-[#62A07C] hover:bg-[#62a07c98] cursor-pointer'
                                onClick={() => form.handleSubmit(handleSubmit)()}
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Aktualisieren...' : 'Kundendaten aktualisieren'}
                            </Button>
                        </div>
                    )}

                </div>



                {/* Error Display */}
                {updateError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{updateError}</p>
                    </div>
                )}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="vorname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Vorname</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Vorname" disabled={!isEditing} className="border border-gray-300 rounded-md" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nachname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Nachname</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nachname" disabled={!isEditing} className="border border-gray-300 rounded-md" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">E-Mail-Adresse</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="email@example.com" disabled={!isEditing} className="border border-gray-300 rounded-md" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="telefonnummer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Telefonnummer</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+49 123 456789" disabled={!isEditing} className="border border-gray-300 rounded-md" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="wohnort"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel className="text-sm font-medium">Wohnort</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Stadt, PLZ" disabled={!isEditing} className="border border-gray-300 rounded-md" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </div>
            <div className='mt-10'>
                <ScanningDataUpdate customerId={customerId} onDataUpdate={onCustomerUpdate} />
            </div>
        </div>
    )
}

