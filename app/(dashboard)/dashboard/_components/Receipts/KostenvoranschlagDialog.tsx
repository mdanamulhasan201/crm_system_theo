'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import PositionsnummerDropdown from '@/app/(dashboard)/dashboard/_components/Scanning/Einlagen/Dropdowns/PositionsnummerDropdown'

interface PositionsnummerItem {
    id: string
    positionsnummer?: string
    category?: string
    description: string | {
        positionsnummer?: string
        title?: string
        subtitle?: string
        Quantità?: string
        'Importo U.'?: string
        IVA?: string
    }
    price: number
}

interface KostenvoranschlagDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerId?: string
}

export default function KostenvoranschlagDialog({ open, onOpenChange }: KostenvoranschlagDialogProps) {
    const { user } = useAuth()
    const vatCountry = user?.accountInfo?.vat_country

    const [positionsnummerAustriaData, setPositionsnummerAustriaData] = useState<PositionsnummerItem[]>([])
    const [positionsnummerItalyData, setPositionsnummerItalyData] = useState<PositionsnummerItem[]>([])
    const [loadingPositionsnummer, setLoadingPositionsnummer] = useState(true)

    const [selectedPositionsnummer, setSelectedPositionsnummer] = useState<string[]>([])
    const [itemSides, setItemSides] = useState<Record<string, 'L' | 'R' | 'BDS'>>({})

    useEffect(() => {
        const loadPositionsnummerData = async () => {
            try {
                const [austriaResponse, italyResponse] = await Promise.all([
                    fetch('/data/positionsnummer-austria.json'),
                    fetch('/data/positionsnummer-italy.json'),
                ])
                if (austriaResponse.ok) {
                    const austriaData = await austriaResponse.json()
                    setPositionsnummerAustriaData(austriaData)
                }
                if (italyResponse.ok) {
                    const italyData = await italyResponse.json()
                    setPositionsnummerItalyData(italyData)
                }
            } catch (error) {
                console.error('Failed to load positionsnummer data:', error)
            } finally {
                setLoadingPositionsnummer(false)
            }
        }
        loadPositionsnummerData()
    }, [])

    useEffect(() => {
        if (!open) {
            setSelectedPositionsnummer([])
            setItemSides({})
        }
    }, [open])

    const getFilteredPositionsnummerData = (): PositionsnummerItem[] => {
        if (vatCountry === 'Österreich (AT)' || vatCountry === 'Austria (AT)') {
            return positionsnummerAustriaData
        }
        if (vatCountry === 'Italien (IT)') {
            return positionsnummerItalyData
        }
        return []
    }

    const options = getFilteredPositionsnummerData()

    const getVatRate = (): number => {
        if (vatCountry === 'Italien (IT)') return 4
        if (vatCountry === 'Österreich (AT)' || vatCountry === 'Austria (AT)') return 20
        return 0
    }

    const unavailableMessage =
        vatCountry && options.length === 0 && !loadingPositionsnummer
            ? 'Positionsnummer ist für Ihr Land nicht verfügbar'
            : null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-w-2xl max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
                <DialogHeader className="p-4 sm:p-6 pr-12 border-b border-gray-200 space-y-0 shrink-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                            Kostenvoranschlag (Codex)
                        </DialogTitle>
                        {getVatRate() > 0 && (
                            <span className="text-sm text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                                +{getVatRate()}% VAT
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-2 mt-2">
                      
                        {selectedPositionsnummer.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedPositionsnummer([])
                                    setItemSides({})
                                }}
                                className="text-sm font-medium text-emerald-700 hover:text-emerald-800 shrink-0 cursor-pointer"
                            >
                                Auswahl leeren
                            </button>
                        )}
                    </div>
                </DialogHeader>

                {loadingPositionsnummer ? (
                    <div className="flex flex-col items-center gap-4 py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                        <p className="text-sm text-gray-600">Daten werden geladen…</p>
                    </div>
                ) : unavailableMessage ? (
                    <div className="p-8 text-center text-gray-600 text-sm">{unavailableMessage}</div>
                ) : (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden ">
                        <PositionsnummerDropdown
                            variant="embedded"
                            embeddedActive={open}
                            label="Positionsnummer"
                            value={selectedPositionsnummer}
                            placeholder="Pos.-Nr."
                            options={options}
                            isOpen={false}
                            onToggle={() => {}}
                            onSelect={setSelectedPositionsnummer}
                            onClear={() => {
                                setSelectedPositionsnummer([])
                                setItemSides({})
                            }}
                            itemSides={itemSides}
                            onItemSideChange={(posNum, side) =>
                                setItemSides((prev) => ({ ...prev, [posNum]: side }))
                            }
                            vatCountry={vatCountry || undefined}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
