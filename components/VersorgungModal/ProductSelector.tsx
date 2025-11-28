import React from 'react'

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
            <label className="font-bold mb-1 block">Produkt aus Lager auswählen</label>
            <div className="relative">
                <select
                    value={selectedProductId}
                    onChange={(e) => onSelect(e.target.value)}
                    className="border p-2 rounded w-full"
                    disabled={isLoading}
                >
                    <option value="">
                        {isLoading ? 'Lade Produkte...' : 'Produkt auswählen'}
                    </option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.produktname} - {product.artikelnummer}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

