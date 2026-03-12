import React, { useState, useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PaymentType = 'Privat' | 'Krankenkasse' | ''

interface PaymentStatusSectionProps {
    value: string
    onChange: (value: string) => void
    error?: string
    disabledOptions?: Array<Exclude<PaymentType, ''>>
    allowDualSelection?: boolean
}
type PrivatStatus = 'Bezahlt' | 'Offen'
type InsuranceStatus = 'Genehmigt' | 'Ungenehmigt'

export default function PaymentStatusSection({
    value,
    onChange,
    error,
    disabledOptions = [],
    allowDualSelection = false,
}: PaymentStatusSectionProps) {
    // Parse initial value
    const parseStatusToken = (val: string): { type: PaymentType; status: string } => {
        if (!val) return { type: '', status: '' }

        // Handle old format (boolean/string)
        if (val === 'true' || val === 'True' || val === 'Ja') {
            return { type: 'Privat', status: 'Bezahlt' }
        }
        if (val === 'false' || val === 'False' || val === 'Nein') {
            return { type: 'Privat', status: 'Offen' }
        }

        // Handle new format: "Privat_Bezahlt" or "Krankenkasse_Genehmigt" (underscore format)
        if (val.includes('_')) {
            const underscoreIndex = val.indexOf('_')
            const type = val.substring(0, underscoreIndex)
            const status = val.substring(underscoreIndex + 1)
            // Normalize status: capitalize first letter for display
            const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
            return { type: type as PaymentType, status: normalizedStatus }
        }

        // Handle old format: "Privat - Bezahlt" or "Krankenkasse - Genehmigt" (backward compatibility)
        if (val.includes(' - ')) {
            const [type, status] = val.split(' - ')
            return { type: type as PaymentType, status }
        }

        // Handle format: "Privat|Bezahlt" (backward compatibility)
        if (val.includes('|')) {
            const [type, status] = val.split('|')
            return { type: type as PaymentType, status }
        }

        return { type: '', status: '' }
    }

    const parseInitialValue = useCallback((val: string): {
        type: PaymentType
        status: string
        privatStatus: string
        krankenkasseStatus: string
    } => {
        const tokens = String(val || '')
            .split('|')
            .map((item) => item.trim())
            .filter(Boolean)

        const parsedTokens = tokens.map(parseStatusToken)
        const privatStatus = parsedTokens.find((item) => item.type === 'Privat')?.status || ''
        const krankenkasseStatus = parsedTokens.find((item) => item.type === 'Krankenkasse')?.status || ''
        const fallbackParsed: { type: PaymentType; status: string } =
            tokens.length > 0 ? parseStatusToken(tokens[0]) : { type: '', status: '' }

        return {
            type: fallbackParsed.type,
            status: fallbackParsed.status,
            privatStatus,
            krankenkasseStatus,
        }
    }, [])

    const initialParsed = parseInitialValue(value)
    const [paymentType, setPaymentType] = useState<PaymentType>(initialParsed.type)
    const [status, setStatus] = useState<string>(initialParsed.status)
    const [privatStatus, setPrivatStatus] = useState<string>(initialParsed.privatStatus)
    const [krankenkasseStatus, setKrankenkasseStatus] = useState<string>(initialParsed.krankenkasseStatus)

    const applyPaymentType = useCallback((newType: PaymentType) => {
        setPaymentType(newType)

        if (newType === 'Privat') {
            setStatus('Bezahlt')
            onChange('Privat_Bezahlt')
            return
        }

        if (newType === 'Krankenkasse') {
            setStatus('Genehmigt')
            onChange('Krankenkasse_Genehmigt')
            return
        }

        setStatus('')
        onChange('')
    }, [onChange])

    // Update when value prop changes
    useEffect(() => {
        const parsed = parseInitialValue(value)
        setPaymentType(parsed.type)
        setStatus(parsed.status)
        setPrivatStatus(parsed.privatStatus)
        setKrankenkasseStatus(parsed.krankenkasseStatus)
    }, [value, parseInitialValue])

    useEffect(() => {
        if (paymentType && disabledOptions.includes(paymentType)) {
            const fallbackType = (['Privat', 'Krankenkasse'] as const).find(
                (type) => !disabledOptions.includes(type)
            )
            if (fallbackType) {
                applyPaymentType(fallbackType)
            }
        }
    }, [disabledOptions, paymentType, applyPaymentType])

    const handlePaymentTypeChange = (newType: PaymentType) => {
        if (disabledOptions.includes(newType as Exclude<PaymentType, ''>)) return
        applyPaymentType(newType)
    }

    const handleStatusChange = (type: Exclude<PaymentType, ''>, newStatus: PrivatStatus | InsuranceStatus) => {
        if (disabledOptions.includes(type)) return

        if (allowDualSelection) {
            const nextPrivatStatus = type === 'Privat' ? newStatus : privatStatus
            const nextKrankenkasseStatus = type === 'Krankenkasse' ? newStatus : krankenkasseStatus

            if (type === 'Privat') setPrivatStatus(newStatus)
            if (type === 'Krankenkasse') setKrankenkasseStatus(newStatus)

            setPaymentType(type)
            setStatus(newStatus)

            const parts: string[] = []
            if (nextPrivatStatus) {
                parts.push(`Privat_${nextPrivatStatus === 'Offen' ? 'offen' : nextPrivatStatus}`)
            }
            if (nextKrankenkasseStatus) {
                parts.push(`Krankenkasse_${nextKrankenkasseStatus}`)
            }
            onChange(parts.join('|'))
            return
        }

        setPaymentType(type)
        setStatus(newStatus)

        const formattedStatus = newStatus === 'Offen' ? 'offen' : newStatus
        onChange(`${type}_${formattedStatus}`)
    }
    const privatOptions = ['Offen', 'Bezahlt'] as const
    const krankenkasseOptions = ['Ungenehmigt', 'Genehmigt'] as const
    const isPrivatDisabled = disabledOptions.includes('Privat')
    const isKrankenkasseDisabled = disabledOptions.includes('Krankenkasse')

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Kostenträger</Label>
            <div className="flex flex-wrap items-start gap-5 ">
                <div className="min-w-[220px] flex-1">
                    <div className={cn(
                        'mb-2 text-xs font-semibold text-gray-900',
                        isPrivatDisabled && 'text-gray-400'
                    )}>
                        Privat
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {privatOptions.map((option) => (
                            <Button
                                key={option}
                                type="button"
                                variant="outline"
                                onClick={() => handleStatusChange('Privat', option)}
                                disabled={isPrivatDisabled}
                                className={cn(
                                    'rounded-md border text-sm font-semibold shadow-none transition-all',
                                    (allowDualSelection ? privatStatus : paymentType === 'Privat' ? status : '') === option
                                        ? 'cursor-pointer border-[#f0b323] bg-[#f7b24d] text-black hover:bg-[#eea63c]'
                                        : 'border-[#d9d9d9] bg-[#eeeeee] text-black hover:bg-[#e6e6e6]',
                                    isPrivatDisabled && 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 hover:bg-gray-100'
                                )}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="min-w-[220px] flex-1">
                    <div className={cn(
                        'mb-2 text-xs font-semibold text-gray-900',
                        isKrankenkasseDisabled && 'text-gray-400'
                    )}>
                        Krankenkasse
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {krankenkasseOptions.map((option) => {
                            const isGenehmigtOption = option === 'Genehmigt'
                            const isOptionDisabled = isKrankenkasseDisabled || isGenehmigtOption

                            return (
                                <Button
                                    key={option}
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleStatusChange('Krankenkasse', option)}
                                    disabled={isOptionDisabled}
                                    className={cn(
                                        'rounded-md border text-sm font-semibold shadow-none transition-all',
                                        (allowDualSelection ? krankenkasseStatus : paymentType === 'Krankenkasse' ? status : '') === option
                                            ? 'border-[#f0b323] bg-[#f7b24d] text-black hover:bg-[#eea63c]'
                                            : 'border-[#d9d9d9] bg-[#eeeeee] text-black hover:bg-[#e6e6e6]',
                                        isOptionDisabled && 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 hover:bg-gray-100'
                                    )}
                                >
                                    {option}
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </div>
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    )
}

