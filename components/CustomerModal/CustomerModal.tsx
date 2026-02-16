'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UpdateUserData from '@/app/(dashboard)/dashboard/_components/Customers/UserUpdate'
import AddedUserScanningData from '@/app/(dashboard)/dashboard/_components/Customers/AddedScanningData'
import { getSingleCustomer } from '@/apis/customerApis'


interface UpdateCustomerModalProps {
    isOpen: boolean
    onClose: () => void
    customerId: string
    onSubmit?: () => void
}

export default function CustomerModal({
    isOpen,
    onClose,
    customerId,
    onSubmit
}: UpdateCustomerModalProps) {
    const [hasScanData, setHasScanData] = useState<boolean>(false)
    const [refreshKey, setRefreshKey] = useState(0)

    // Check if customer has scan data
    useEffect(() => {
        if (!isOpen || !customerId) return

        let mounted = true
        const checkScanData = async () => {
            try {
                const response = await getSingleCustomer(customerId)
                const payload = Array.isArray((response as any)?.data)
                    ? (response as any).data[0]
                    : Array.isArray(response)
                        ? (response as any)[0]
                        : (response as any)?.data ?? response
                
                if (!mounted) return

                // Check if screenerFile exists and has at least one item
                const hasScans = payload?.screenerFile && 
                    Array.isArray(payload.screenerFile) && 
                    payload.screenerFile.length > 0
                
                setHasScanData(hasScans || false)
            } catch (e) {
                console.error('Error checking scan data:', e)
                setHasScanData(false)
            }
        }

        void checkScanData()
        return () => {
            mounted = false
        }
    }, [isOpen, customerId, refreshKey])

    // Handle scan data submission - refresh check when scan is added
    const handleSubmit = () => {
        setRefreshKey(prev => prev + 1) // Trigger refresh
        onSubmit?.()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl uppercase font-semibold text-center">
                        {/* german language */}
                        <span className="text-2xl font-semibold capitalize">
                            <span className="text-gray-500">Kundenverwaltung</span>
                            
                        </span>
                    </DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="add-scan" className=''>
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="add-scan" className='cursor-pointer capitalize hover:bg-gray-100 hover:text-gray-900'>Neuer Scanimport</TabsTrigger>
                        <TabsTrigger 
                            value="update-customer" 
                            disabled={!hasScanData}
                            className={`capitalize ${
                                hasScanData 
                                    ? 'cursor-pointer hover:bg-gray-100 hover:text-gray-900' 
                                    : 'cursor-not-allowed opacity-50'
                            }`}
                        >
                            Scandaten aktualisieren
                        </TabsTrigger>
                    </TabsList>


                    {/* add scanning data */}
                    <TabsContent value="add-scan" className='mt-10'>
                        <AddedUserScanningData customerId={customerId} isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit} />
                    </TabsContent>

                    {/* update customer */}
                    <TabsContent value="update-customer">
                        <UpdateUserData customerId={customerId} onCustomerUpdate={handleSubmit} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
