import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import toast from 'react-hot-toast'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'

interface MillingBlock {
    id: string
    Produktname: string
    Produktkürzel: string
    Hersteller: string
    Lagerort: string
    minStockLevel: number
    sizeQuantities: { [key: string]: number }
    Status: string
    image?: string
    purchase_price?: number
    selling_price?: number
}

interface SizeData {
    quantity: number
    mindestmenge?: number
    autoOrderLimit?: number
    orderQuantity?: number
}

interface EditMillingBlockProps {
    product: MillingBlock | null
    isOpen: boolean
    onClose: () => void
    onUpdated?: (updatedProduct: MillingBlock) => void
    sizeColumns: string[]
}

export default function EditMillingBlock({
    product,
    isOpen,
    onClose,
    onUpdated,
    sizeColumns
}: EditMillingBlockProps) {
    const { updateExistingProduct } = useStockManagementSlice()
    const [isLoading, setIsLoading] = useState(false)
    const [sizeQuantities, setSizeQuantities] = useState<{ [key: string]: SizeData }>({})
    const [produktname, setProduktname] = useState('')
    const [hersteller, setHersteller] = useState('')
    const [artikelnummer, setArtikelnummer] = useState('')
    const [purchasePrice, setPurchasePrice] = useState<number>(0)
    const [sellingPrice, setSellingPrice] = useState<number>(0)

    // Initialize form data when product changes
    useEffect(() => {
        if (product && isOpen) {
            setProduktname(product.Produktname)
            setHersteller(product.Hersteller)
            setArtikelnummer(product.Produktkürzel)
            setPurchasePrice(product.purchase_price || 0)
            setSellingPrice(product.selling_price || 0)
            
            const initialSizeQuantities: { [key: string]: SizeData } = {}
            sizeColumns.forEach(size => {
                initialSizeQuantities[size] = {
                    quantity: product.sizeQuantities[size] || 0,
                    mindestmenge: product.minStockLevel || 0,
                    autoOrderLimit: undefined,
                    orderQuantity: undefined
                }
            })
            setSizeQuantities(initialSizeQuantities)
        }
    }, [product, isOpen, sizeColumns])

    const handleSizeQuantityChange = (size: string, value: string) => {
        setSizeQuantities(prev => ({
            ...prev,
            [size]: {
                ...prev[size],
                quantity: parseInt(value) || 0
            }
        }))
    }

    const handleMindestmengeChange = (size: string, value: string) => {
        setSizeQuantities(prev => ({
            ...prev,
            [size]: {
                ...prev[size],
                mindestmenge: parseInt(value) || 0
            }
        }))
    }

    const handleAutoOrderLimitChange = (size: string, value: string) => {
        setSizeQuantities(prev => ({
            ...prev,
            [size]: {
                ...prev[size],
                autoOrderLimit: value === '' ? undefined : (parseInt(value) || undefined)
            }
        }))
    }

    const handleOrderQuantityChange = (size: string, value: string) => {
        setSizeQuantities(prev => ({
            ...prev,
            [size]: {
                ...prev[size],
                orderQuantity: value === '' ? undefined : (parseInt(value) || undefined)
            }
        }))
    }

    const handleSave = async () => {
        if (!product) return

        setIsLoading(true)
        try {
            // Prepare groessenMengen in the format expected by API
            // For milling blocks, convert "Size 1", "Size 2", "Size 3" to "1", "2", "3"
            const groessenMengen: { [key: string]: any } = {}
            sizeColumns.forEach(size => {
                const sizeData = sizeQuantities[size]
                if (sizeData) {
                    // Extract numeric part from "Size 1" -> "1" or use as-is if already "1"
                    const sizeKey = size.replace(/^Size\s+/i, '')
                    groessenMengen[sizeKey] = {
                        quantity: sizeData.quantity || 0,
                        ...(sizeData.mindestmenge !== undefined && { mindestmenge: sizeData.mindestmenge }),
                        auto_order_limit: sizeData.autoOrderLimit !== undefined ? sizeData.autoOrderLimit : null,
                        auto_order_quantity: sizeData.orderQuantity !== undefined ? sizeData.orderQuantity : null
                    }
                }
            })

            // Get minimum mindestmenge from all sizes
            const minMindestmenge = Math.min(
                ...sizeColumns.map(size => sizeQuantities[size]?.mindestmenge || product.minStockLevel)
            )

            // Prepare update payload
            const updatePayload = {
                produktname: produktname,
                hersteller: hersteller,
                artikelnummer: artikelnummer,
                purchase_price: purchasePrice,
                selling_price: sellingPrice,
                groessenMengen: groessenMengen,
                mindestbestand: minMindestmenge
            }

            // Call API to update
            const response = await updateExistingProduct(product.id, updatePayload)
            
            if (response.success) {
                // Convert updated product back to local format
                const updatedProduct: MillingBlock = {
                    ...product,
                    Produktname: produktname,
                    Hersteller: hersteller,
                    Produktkürzel: artikelnummer,
                    purchase_price: purchasePrice,
                    selling_price: sellingPrice,
                    sizeQuantities: Object.fromEntries(
                        Object.entries(sizeQuantities).map(([size, data]) => [size, data.quantity])
                    ),
                    minStockLevel: minMindestmenge
                }

                toast.success('Fräsblock erfolgreich aktualisiert')
                onUpdated && onUpdated(updatedProduct)
                onClose()
            } else {
                toast.error(response.message || 'Fehler beim Aktualisieren des Fräsblocks')
            }
        } catch (error: any) {
            console.error('Failed to update milling block:', error)
            toast.error(error?.response?.data?.message || 'Fehler beim Aktualisieren des Fräsblocks')
        } finally {
            setIsLoading(false)
        }
    }

    if (!product) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="!max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Produkt bearbeiten</DialogTitle>
                </DialogHeader>
                <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-6">
                    {/* Row 1: Produktname and Hersteller */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Produktname</label>
                            <Input 
                                value={produktname} 
                                onChange={e => setProduktname(e.target.value)} 
                                required 
                                disabled={true}
                                className="bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Hersteller</label>
                            <Input 
                                value={hersteller} 
                                onChange={e => setHersteller(e.target.value)} 
                                required 
                                disabled={true}
                                className="bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Row 2: Artikelnummer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Artikelnummer</label>
                            <Input 
                                value={artikelnummer} 
                                onChange={e => setArtikelnummer(e.target.value)} 
                                required 
                                disabled={true}
                                className="bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Row 3: Einkaufspreis and Verkaufspreis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Einkaufspreis (€)</label>
                            <Input 
                                type="number" 
                                step="0.01" 
                                min={0} 
                                value={purchasePrice} 
                                onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)} 
                                required 
                                disabled={isLoading} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Verkaufspreis (€)</label>
                            <Input 
                                type="number" 
                                step="0.01" 
                                min={0} 
                                value={sellingPrice} 
                                onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)} 
                                required 
                                disabled={isLoading} 
                            />
                        </div>
                    </div>

                    {/* Size Quantities Table */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Größen & Mengen</label>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-medium">Größe</TableHead>
                                        <TableHead className="font-medium">Bestand</TableHead>
                                        <TableHead className="font-medium">Mindestmenge</TableHead>
                                        <TableHead className="font-medium">Auto-Bestellgrenze</TableHead>
                                        <TableHead className="font-medium">Bestellmenge</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sizeColumns.map(size => (
                                        <TableRow key={size}>
                                            <TableCell className="font-medium">{size}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={sizeQuantities[size]?.quantity || 0}
                                                    onChange={e => handleSizeQuantityChange(size, e.target.value)}
                                                    className="w-full"
                                                    disabled={isLoading}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="0"
                                                    value={sizeQuantities[size]?.mindestmenge ?? ''}
                                                    onChange={e => handleMindestmengeChange(size, e.target.value)}
                                                    className="w-full"
                                                    disabled={isLoading}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="3"
                                                    value={sizeQuantities[size]?.autoOrderLimit !== undefined ? sizeQuantities[size]?.autoOrderLimit : ''}
                                                    onChange={e => handleAutoOrderLimitChange(size, e.target.value)}
                                                    className="w-full"
                                                    disabled={isLoading}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="10"
                                                    value={sizeQuantities[size]?.orderQuantity !== undefined ? sizeQuantities[size]?.orderQuantity : ''}
                                                    onChange={e => handleOrderQuantityChange(size, e.target.value)}
                                                    className="w-full"
                                                    disabled={isLoading}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                        <Button
                            className="cursor-pointer"
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#61A178] cursor-pointer hover:bg-[#61A178]/80 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Aktualisieren...' : 'Aktualisieren'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

