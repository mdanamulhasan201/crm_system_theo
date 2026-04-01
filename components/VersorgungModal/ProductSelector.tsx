import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface StorageProduct {
    id: string
    produktname: string
    artikelnummer: string
}

type ProductSelectorProps = {
    products: StorageProduct[]
    isLoading: boolean
    selectedProductId: string
    onSelect: (productId: string) => void
}

export default function ProductSelector({
    products,
    isLoading,
    selectedProductId,
    onSelect,
}: ProductSelectorProps) {
    return (
        <div>
            <label className="font-semibold mb-1 block">Rohling / Fräsblock</label>
            <Select
                value={selectedProductId}
                onValueChange={onSelect}
                disabled={isLoading}
            >
                <SelectTrigger className="w-full border border-gray-300 px-3 py-2 rounded-md h-auto min-h-[42px]">
                    <SelectValue
                        placeholder={isLoading ? 'Lade Produkte...' : 'Produkt auswählen'}
                    />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                    {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                            {product.produktname}
                            {product.artikelnummer ? ` - ${product.artikelnummer}` : ''}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
