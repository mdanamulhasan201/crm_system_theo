'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface DatenschutzDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerData?: any
}

export default function DatenschutzDialog({ open, onOpenChange, customerData }: DatenschutzDialogProps) {
    const [signature, setSignature] = useState('')

    const handleReset = () => {
        setSignature('')
        toast.success('Unterschrift zurückgesetzt')
    }

    const handleSave = () => {
        if (!signature.trim()) {
            toast.error('Bitte unterschreiben Sie im Feld oben')
            return
        }
        toast.success('Datenschutzerklärung wurde gespeichert')
        onOpenChange(false)
    }

    const handleBack = () => {
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-lg font-semibold">
                        Datenschutzerklärung
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Customer Info Header */}
                    <div className="flex justify-between text-sm bg-gray-50 p-3 rounded">
                        <div>
                            <p className="text-gray-600 text-xs mb-1">Name:</p>
                            <p className="font-medium">{customerData?.vorname || 'Miss'} {customerData?.nachname || 'Musterfrau'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-600 text-xs mb-1">Datum:</p>
                            <p className="font-medium">{new Date().toLocaleDateString('de-DE')}</p>
                        </div>
                    </div>

                    {/* Signature Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unterschrift
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded h-40 flex items-center justify-center bg-white">
                            <textarea
                                value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                                className="w-full h-full p-4 bg-transparent resize-none focus:outline-none text-center"
                                placeholder=""
                            />
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Bitte unterschreiben Sie im Feld oben
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3 pt-2">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="cursor-pointer"
                        >
                            Zurücksetzen
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-[#61A07B] hover:bg-[#528c68] text-white cursor-pointer"
                        >
                            Speichern & erstellen
                        </Button>
                    </div>

                    {/* Back Link */}
                    <div className="text-center pt-2">
                        <button
                            onClick={handleBack}
                            className="text-sm text-gray-600 hover:text-gray-800 underline cursor-pointer"
                        >
                            Zurück
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
