'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import PositionsnummerDropdown from '@/app/(dashboard)/dashboard/_components/Scanning/Einlagen/Dropdowns/PositionsnummerDropdown'
import { getKvaDataByCustomerId, uploadKvaPdf } from '@/apis/productsOrder'
import { generatePdfFromElement } from '@/lib/pdfGenerator'
import type { KvaData } from '@/components/OrdersPage/ProccessTable/KvaPdf/KvaSheet'
import KostenvoranschlagPdf from '@/components/OrdersPage/ProccessTable/KvaPdf/KostenvoranschlagPdf'
import { buildKvaInsurancesFromCodexSelection } from '@/app/(dashboard)/dashboard/_components/Receipts/buildKvaInsurancesFromPositions'

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

const KVA_CODEX_PDF_ELEMENT_ID = 'kva-codex-customer-pdf'

const getProxyImageUrl = (externalUrl: string): string => {
    if (!externalUrl) return externalUrl
    if (externalUrl.startsWith('/api/proxy-image?url=')) return externalUrl
    const absoluteUrl = externalUrl.startsWith('http')
        ? externalUrl
        : `${window.location.origin}${externalUrl.startsWith('/') ? '' : '/'}${externalUrl}`
    return `/api/proxy-image?url=${encodeURIComponent(absoluteUrl)}`
}

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

/** KVA API may return camelCase or snake_case; modal needs `{ address }[]`. */
function normalizeKvShippingList(data: Record<string, unknown> | null | undefined): { address: string }[] {
    const raw =
        (data as { shippingAddressesForKv?: unknown; shipping_addresses_for_kv?: unknown } | undefined)
            ?.shippingAddressesForKv ??
        (data as { shipping_addresses_for_kv?: unknown } | undefined)?.shipping_addresses_for_kv
    if (!raw || !Array.isArray(raw)) return []
    return raw
        .map((x: unknown) => {
            if (typeof x === 'string') return { address: x }
            if (x && typeof x === 'object' && 'address' in x) {
                const a = (x as { address: unknown }).address
                return { address: typeof a === 'string' ? a : '' }
            }
            return { address: '' }
        })
        .filter((x) => x.address.length > 0)
}

export interface KostenvoranschlagDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerId?: string
    selectedPositionsnummer: string[]
    onSelectedPositionsnummerChange: (value: string[]) => void
    itemSides: Record<string, 'L' | 'R' | 'BDS'>
    onItemSideChange: (posNum: string, side: 'L' | 'R' | 'BDS') => void
    onClearCodexSelection: () => void
}

export default function KostenvoranschlagDialog({
    open,
    onOpenChange,
    customerId,
    selectedPositionsnummer,
    onSelectedPositionsnummerChange,
    itemSides,
    onItemSideChange,
    onClearCodexSelection,
}: KostenvoranschlagDialogProps) {
    const { user } = useAuth()
    const vatCountry = user?.accountInfo?.vat_country

    const [positionsnummerAustriaData, setPositionsnummerAustriaData] = useState<PositionsnummerItem[]>([])
    const [positionsnummerItalyData, setPositionsnummerItalyData] = useState<PositionsnummerItem[]>([])
    const [loadingPositionsnummer, setLoadingPositionsnummer] = useState(true)

    const [kvaPdfData, setKvaPdfData] = useState<KvaData | null>(null)
    const [kvaPdfLogoProxy, setKvaPdfLogoProxy] = useState<string | null>(null)
    const [pdfGenerating, setPdfGenerating] = useState(false)
    const [showKvaLocationModal, setShowKvaLocationModal] = useState(false)
    const [kvaShippingAddresses, setKvaShippingAddresses] = useState<{ address: string }[]>([])
    const [isLoadingKvaAddresses, setIsLoadingKvaAddresses] = useState(false)
    /** Base payload from first `getKvaDataByCustomerId` (before user picks Versandadresse). */
    const [pendingKvaBaseData, setPendingKvaBaseData] = useState<KvaData | null>(null)

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
            setShowKvaLocationModal(false)
            setKvaShippingAddresses([])
            setIsLoadingKvaAddresses(false)
            setPendingKvaBaseData(null)
        }
    }, [open])

    const clearSelection = () => {
        onClearCodexSelection()
    }

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

    const discardLocationFlow = () => {
        setShowKvaLocationModal(false)
        setKvaShippingAddresses([])
        setPendingKvaBaseData(null)
    }

    /** Step 1: load KVA without location; use `shippingAddressesForKv` from response for the modal. */
    const handleRequestPdfWithLocation = async () => {
        if (!customerId) {
            toast.error('Kunden-ID fehlt')
            return
        }
        if (!selectedPositionsnummer.length) {
            toast.error('Bitte wählen Sie mindestens eine Positionsnummer.')
            return
        }

        setIsLoadingKvaAddresses(true)
        try {
            const res = await getKvaDataByCustomerId(customerId)
            if (!res?.success || !res?.data) {
                toast.error(res?.message || 'KVA-Daten konnten nicht geladen werden')
                return
            }

            const addresses = normalizeKvShippingList(res.data as Record<string, unknown>)
            if (!addresses.length) {
                toast.error('Keine Versandadressen in den KVA-Daten. Bitte Backend prüfen.')
                return
            }

            setPendingKvaBaseData(res.data as KvaData)
            setKvaShippingAddresses(addresses)
            setShowKvaLocationModal(true)
        } catch (e) {
            console.error('KVA fetch (Codex):', e)
            toast.error('Fehler beim Laden der KVA-Daten')
        } finally {
            setIsLoadingKvaAddresses(false)
        }
    }

    /** Step 2: merge stored base KVA + selected Versandadresse (PDF shows first `shippingAddressesForKv` entry). */
    const handleCreatePdfWithKvLocation = async (kvLocation: string) => {
        const base = pendingKvaBaseData
        if (!customerId) {
            toast.error('Kunden-ID fehlt')
            return
        }
        if (!base) {
            toast.error('KVA-Daten fehlen. Bitte erneut „PDF erstellen“ wählen.')
            return
        }

        setShowKvaLocationModal(false)
        setKvaShippingAddresses([])
        setPendingKvaBaseData(null)

        setPdfGenerating(true)
        try {
            const insurancesInfo = buildKvaInsurancesFromCodexSelection(
                selectedPositionsnummer,
                itemSides,
                positionsnummerAustriaData,
                positionsnummerItalyData,
                vatCountry
            )

            if (!insurancesInfo.length) {
                toast.error('Ausgewählte Positionen konnten nicht zugeordnet werden.')
                return
            }

            const merged: KvaData = {
                ...base,
                shippingAddressesForKv: [{ address: kvLocation }],
                insurancesInfo,
            }

            setKvaPdfData(merged)
            setKvaPdfLogoProxy(merged.logo ? getProxyImageUrl(String(merged.logo)) : null)

            await nextFrame()

            const pdfBlob = await generatePdfFromElement(KVA_CODEX_PDF_ELEMENT_ID, {
                scale: 1.5,
                quality: 0.88,
                format: 'jpeg',
            })
            const safeName = (merged?.customerInfo?.firstName || 'KVA').toString().trim().replace(/\s+/g, '_')
            const pdfFileName = `Kostenvoranschlag_${safeName}.pdf`
            downloadBlob(pdfBlob, pdfFileName)

            const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' })
            try {
                const uploadRes = await uploadKvaPdf(customerId, pdfFile)
                if (uploadRes && typeof uploadRes === 'object' && 'success' in uploadRes && uploadRes.success === false) {
                    throw new Error(
                        (uploadRes as { message?: string }).message || 'Upload fehlgeschlagen'
                    )
                }
                toast.success('PDF heruntergeladen und gespeichert')
            } catch (uploadErr) {
                console.error('KVA PDF upload:', uploadErr)
                toast.error(
                    'PDF wurde heruntergeladen, der Upload zum Server ist fehlgeschlagen.'
                )
            }

            onClearCodexSelection()
            onOpenChange(false)
        } catch (e) {
            console.error('Kostenvoranschlag PDF:', e)
            toast.error('Fehler beim Erstellen des PDFs')
        } finally {
            setPdfGenerating(false)
            setTimeout(() => {
                setKvaPdfData(null)
                setKvaPdfLogoProxy(null)
            }, 1500)
        }
    }

    return (
        <>
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
                            <p className="text-sm text-gray-500 font-normal text-left flex-1 min-w-0">
                                Nach erfolgreichem PDF wird die Positionsauswahl geleert. Mit „Auswahl leeren“
                                jederzeit zurücksetzen.
                            </p>
                            {selectedPositionsnummer.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearSelection}
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
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                            <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6">
                                <PositionsnummerDropdown
                                    variant="embedded"
                                    embeddedActive={open}
                                    label="Positionsnummer"
                                    value={selectedPositionsnummer}
                                    placeholder="Pos.-Nr."
                                    options={options}
                                    isOpen={false}
                                    onToggle={() => {}}
                                    onSelect={onSelectedPositionsnummerChange}
                                    onClear={clearSelection}
                                    itemSides={itemSides}
                                    onItemSideChange={onItemSideChange}
                                    vatCountry={vatCountry || undefined}
                                />
                            </div>
                            <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex flex-wrap justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() => onOpenChange(false)}
                                    disabled={pdfGenerating || isLoadingKvaAddresses}
                                >
                                    Schließen
                                </Button>
                                <Button
                                    type="button"
                                    className="cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                                    onClick={handleRequestPdfWithLocation}
                                    disabled={
                                        pdfGenerating ||
                                        isLoadingKvaAddresses ||
                                        !customerId ||
                                        selectedPositionsnummer.length === 0
                                    }
                                >
                                    {pdfGenerating || isLoadingKvaAddresses ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isLoadingKvaAddresses ? 'Adressen werden geladen…' : 'PDF wird erstellt…'}
                                        </>
                                    ) : (
                                        'PDF erstellen'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={showKvaLocationModal}
                onOpenChange={(next) => {
                    if (!next) discardLocationFlow()
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Versandadresse auswählen</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500">
                        Bitte wählen Sie eine Versandadresse für den Kostenvoranschlag aus.
                    </p>
                    <div className="grid max-h-72 grid-cols-1 gap-3 overflow-y-auto pr-1 mt-2">
                        {kvaShippingAddresses.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">Keine Adressen verfügbar</p>
                        ) : (
                            kvaShippingAddresses.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="w-full text-left border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                                    onClick={() => void handleCreatePdfWithKvLocation(item.address)}
                                    disabled={pdfGenerating}
                                >
                                    {item.address}
                                </button>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={discardLocationFlow}
                            disabled={pdfGenerating}
                        >
                            Abbrechen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div
                id={KVA_CODEX_PDF_ELEMENT_ID}
                style={{
                    position: 'fixed',
                    top: '-9999px',
                    left: '-9999px',
                    zIndex: -1,
                    pointerEvents: 'none',
                }}
            >
                {kvaPdfData ? (
                    <KostenvoranschlagPdf data={kvaPdfData} logoProxyUrl={kvaPdfLogoProxy} />
                ) : null}
            </div>
        </>
    )
}
