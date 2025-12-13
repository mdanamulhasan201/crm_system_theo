import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PaymentStatusSectionProps {
    value: string
    onChange: (value: string) => void
}

type PaymentType = 'Privat' | 'Krankenkasse' | ''
type PrivatStatus = 'Bezahlt' | 'Offen'
type InsuranceStatus = 'Genehmigt' | 'Ungenehmigt'

export default function PaymentStatusSection({
    value,
    onChange,
}: PaymentStatusSectionProps) {
    // Parse initial value
    const parseInitialValue = (val: string): { type: PaymentType; status: string } => {
        if (!val) return { type: '', status: '' }

        // Handle old format (boolean/string)
        if (val === 'true' || val === 'True' || val === 'Ja') {
            return { type: 'Privat', status: 'Bezahlt' }
        }
        if (val === 'false' || val === 'False' || val === 'Nein') {
            return { type: 'Privat', status: 'Offen' }
        }

        // Handle new format: "Privat - Bezahlt" or "Krankenkasse - Genehmigt"
        if (val.includes(' - ')) {
            const [type, status] = val.split(' - ')
            return { type: type as PaymentType, status }
        }

        // Handle format: "Privat|Bezahlt"
        if (val.includes('|')) {
            const [type, status] = val.split('|')
            return { type: type as PaymentType, status }
        }

        return { type: '', status: '' }
    }

    const initialParsed = parseInitialValue(value)
    const [paymentType, setPaymentType] = useState<PaymentType>(initialParsed.type)
    const [status, setStatus] = useState<string>(initialParsed.status)

    // Update when value prop changes
    useEffect(() => {
        const parsed = parseInitialValue(value)
        setPaymentType(parsed.type)
        setStatus(parsed.status)
    }, [value])

    const handlePaymentTypeChange = (newType: PaymentType) => {
        setPaymentType(newType)

        // Set default status based on type
        if (newType === 'Privat') {
            const newValue = 'Privat - Bezahlt'
            setStatus('Bezahlt')
            onChange(newValue)
        } else if (newType === 'Krankenkasse') {
            const newValue = 'Krankenkasse - Genehmigt'
            setStatus('Genehmigt')
            onChange(newValue)
        } else {
            setStatus('')
            onChange('')
        }
    }

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus)
        if (paymentType) {
            const newValue = `${paymentType} - ${newStatus}`
            onChange(newValue)
        }
    }

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Kostenträger</Label>
            <div className="flex gap-3">
                {/* Payment Type Dropdown */}
                <div className="flex-1">
                    <Select value={paymentType} onValueChange={handlePaymentTypeChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Zahlungsart auswählen..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Privat">Privat</SelectItem>
                            <SelectItem value="Krankenkasse">Krankenkasse</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Dropdown - Only show if payment type is selected */}
                {paymentType && (
                    <div className="flex-1">
                        {paymentType === 'Privat' && (
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Status auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bezahlt">Bezahlt</SelectItem>
                                    <SelectItem value="Offen">Offen</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        {paymentType === 'Krankenkasse' && (
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Status auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Genehmigt">Genehmigt</SelectItem>
                                    <SelectItem value="Ungenehmigt">Ungenehmigt</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

