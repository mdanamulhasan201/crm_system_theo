'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Printer, FileText, Mail, ThumbsUp, AlertTriangle, Loader2 } from 'lucide-react'
import { submitOrderFeedback, emailReceipt } from '@/apis/pickupsApis'
import type { PosReceipt } from '@/apis/pickupsApis'
import { generateReceiptHTML, generateReceiptPDF } from '@/utils/receiptUtils'
import toast from 'react-hot-toast'

interface CardPaymentSuccessDialogProps {
    isOpen: boolean
    onClose: () => void
    onProblem: () => void
    amount: string
    receiptNumber: string
    orderId: string
    orderType: 'insole' | 'shoes'
    receipt: PosReceipt | null
}

export default function CardPaymentSuccessDialog({
    isOpen,
    onClose,
    onProblem,
    amount,
    receiptNumber,
    orderId,
    orderType,
    receipt,
}: CardPaymentSuccessDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handlePrint = () => {
        if (!receipt) {
            toast.error('Kein Beleg verfügbar')
            return
        }
        const html = generateReceiptHTML(receipt)
        const printWindow = window.open('', '_blank', 'width=350,height=600')
        if (printWindow) {
            printWindow.document.write(html)
            printWindow.document.close()
            printWindow.onload = () => printWindow.print()
        }
    }

    const handlePDF = () => {
        if (!receipt) {
            toast.error('Kein Beleg verfügbar')
            return
        }
        const blob = generateReceiptPDF(receipt)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Kassenbon-${receiptNumber}.pdf`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleEmail = async () => {
        if (!receipt) {
            toast.error('Kein Beleg verfügbar')
            return
        }
        const email = prompt('E-Mail-Adresse eingeben:')
        if (!email) return
        try {
            await emailReceipt(receipt.id, email)
            toast.success('Beleg per E-Mail gesendet')
        } catch {
            toast.error('E-Mail konnte nicht gesendet werden')
        }
    }

    const handleFeedbackGood = async () => {
        setIsSubmitting(true)
        try {
            await submitOrderFeedback(orderId, orderType, 'Like')
            toast.success('Feedback gesendet')
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Feedback konnte nicht gesendet werden'
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Zahlung erfolgreich</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Success Icon and Message */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Zahlung erfolgreich
                        </h3>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                            {amount}
                        </p>
                        <p className="text-sm text-gray-600">per Karte</p>
                        <p className="text-xs text-gray-500 mt-2">
                            Beleg-Nr: {receiptNumber}
                        </p>
                    </div>

                    {/* Receipt Options */}
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Beleg</p>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                className="flex flex-col items-center gap-1 h-auto py-3"
                                onClick={handlePrint}
                            >
                                <Printer className="w-5 h-5" />
                                <span className="text-xs">Drucken</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex flex-col items-center gap-1 h-auto py-3"
                                onClick={handlePDF}
                            >
                                <FileText className="w-5 h-5" />
                                <span className="text-xs">PDF</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex flex-col items-center gap-1 h-auto py-3"
                                onClick={handleEmail}
                            >
                                <Mail className="w-5 h-5" />
                                <span className="text-xs">E-Mail</span>
                            </Button>
                        </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Hat alles gepasst?</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className="flex items-center justify-center gap-2"
                                onClick={handleFeedbackGood}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ThumbsUp className="w-4 h-4" />
                                )}
                                <span className="text-sm">Ja, alles gut</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center justify-center gap-2"
                                onClick={onProblem}
                            >
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm">Nein, Problem</span>
                            </Button>
                        </div>
                    </div>

                    {/* Done Button */}
                    <div className="pt-2">
                        <Button
                            className="w-full bg-[#61A175] hover:bg-[#4f8a61]"
                            onClick={onClose}
                        >
                            Fertig
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
