'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UpdateUserData from '@/app/(dashboard)/dashboard/_components/Customers/UserUpdate'
import AddedUserScanningData from '@/app/(dashboard)/dashboard/_components/Customers/AddedScanningData'


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
                        <TabsTrigger value="update-customer" className='cursor-pointer capitalize hover:bg-gray-100 hover:text-gray-900'>Kundendaten aktualisieren</TabsTrigger>
                    </TabsList>


                    {/* add scanning data */}
                    <TabsContent value="add-scan" className='mt-10'>
                        <AddedUserScanningData customerId={customerId} isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} />
                    </TabsContent>

                    {/* update customer */}
                    <TabsContent value="update-customer">
                        <UpdateUserData customerId={customerId} onCustomerUpdate={onSubmit} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
