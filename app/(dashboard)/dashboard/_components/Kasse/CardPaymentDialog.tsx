'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, CreditCard, Shield } from 'lucide-react'

interface CardPaymentDialogProps {
    isOpen: boolean
    onClose: () => void
    onBack: () => void
    onComplete: () => void
    orderNumber: string
    customerName: string
    totalAmount: string
    insuranceAmount: string
    customerPayment: string
}

export default function CardPaymentDialog({
    isOpen,
    onClose,
    onBack,
    onComplete,
    orderNumber,
    customerName,
    totalAmount,
    insuranceAmount,
    customerPayment
}: CardPaymentDialogProps) {
    const [transactionId, setTransactionId] = useState('')

    return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">Bezahlen</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Order Details - With Border */}
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Auftrag</span>
                                <span className="font-semibold text-gray-900">{orderNumber} – {customerName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Gesamtbetrag</span>
                                <span className="font-semibold text-gray-900">{totalAmount}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                    <span className="text-gray-500">Krankenkasse zahlt</span>
                                </div>
                                <span className="font-semibold text-blue-600">{insuranceAmount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Eigenanteil / Zuzahlung</span>
                                <span className="font-semibold text-gray-900">{customerPayment}</span>
                            </div>

                            {/* Restbetrag Kunde - Inside the border */}
                            <div className="pt-3 mt-3 border-t border-gray-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-semibold text-gray-700">Restbetrag Kunde</span>
                                    <span className="text-xl font-bold text-[#61A175]">{customerPayment}</span>
                                </div>
                            </div>
                        </div>

                        {/* Back Button */}
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Zurück</span>
                        </button>

                        {/* Kartenzahlung Section */}
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-green-700" />
                                <span className="text-base font-semibold text-gray-900">Kartenzahlung</span>
                            </div>
                        </div>

                        {/* Amount to Pay */}
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Zu zahlender Betrag</p>
                            <p className="text-4xl font-bold text-gray-900">{customerPayment}</p>
                        </div>

                        {/* Transaction ID Input */}
                        <div>
                            <label className="text-sm text-gray-700 mb-2 block font-medium">
                                Transaktions-ID (optional)
                            </label>
                            <Input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="z.B. TXN12345"
                                className="h-12"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={onClose}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                className="w-full bg-[#61A175] hover:bg-[#4f8a61] text-white"
                                onClick={onComplete}
                            >
                                Zahlung abschließen
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
}
