'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { getAllStorages } from '@/apis/productsManagementApis';
import ProductSelector from '@/components/VersorgungModal/ProductSelector';
import MaterialienInput from '@/components/VersorgungModal/MaterialienInput';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface StorageProduct {
    id: string
    produktname: string
    hersteller: string
    artikelnummer: string
    lagerort: string | null
    mindestbestand: number | null
    groessenMengen: { [key: string]: any }
    purchase_price: number
    selling_price: number
    Status: string
    userId: string
    type?: 'milling_block' | 'rady_insole'
    createdAt: string
    updatedAt: string
}

interface EinmaligeVersorgungContentProps {
    insoleStandards: Array<{ name: string; left: number; right: number }>;
    onInsoleStandardsChange: (standards: Array<{ name: string; left: number; right: number }>) => void;
    menge?: string;
}

export default function EinmaligeVersorgungContent({
    insoleStandards,
    onInsoleStandardsChange,
    menge
}: EinmaligeVersorgungContentProps) {
    const [storageProducts, setStorageProducts] = useState<StorageProduct[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<StorageProduct | null>(null)

    // Materialien state
    const [materialien, setMaterialien] = useState<string[]>([])
    const [materialienInput, setMaterialienInput] = useState('')

    // Local menge state, initialized from prop
    const [localMenge, setLocalMenge] = useState<string>('1')

    // Update local menge when prop changes
    useEffect(() => {
        if (menge) {
            // Extract number from menge string like "2 paar" -> "2"
            const mengeNumber = menge.split(' ')[0];
            setLocalMenge(mengeNumber);
        }
    }, [menge])

    // Fetch all storage products (without type filter)
    const fetchStorageProducts = useCallback(async () => {
        try {
            setIsLoadingProducts(true)
            const response = await getAllStorages(1, 1000, '', undefined)
            if (response.success && response.data) {
                setStorageProducts(response.data)
            }
        } catch (err: any) {
            console.error('Failed to fetch storage products:', err)
            toast.error('Failed to load products')
        } finally {
            setIsLoadingProducts(false)
        }
    }, [])

    // Fetch products on component mount
    useEffect(() => {
        fetchStorageProducts()
    }, [fetchStorageProducts])

    // Handle product selection
    const handleProductSelect = (productId: string) => {
        const product = storageProducts.find(p => p.id === productId)
        if (product) {
            setSelectedProduct(product)
            // You can emit this data to parent component or handle it here
            console.log('Selected product:', product)
        }
    }

    // Handle materialien tag input
    const handleAddMaterialTag = () => {
        const trimmedInput = materialienInput.trim()
        if (trimmedInput && !materialien.includes(trimmedInput)) {
            setMaterialien([...materialien, trimmedInput])
            setMaterialienInput('')
        }
    }

    const handleMaterialienKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            handleAddMaterialTag()
        }
    }

    const handleRemoveMaterialTag = (indexToRemove: number) => {
        setMaterialien(materialien.filter((_, index) => index !== indexToRemove))
    }

    return (
        <div className="mb-6">
            <div className="mb-4">
                {/* <h3 className="text-base font-semibold text-gray-700 mb-3">Einmalige Versorgung konfigurieren</h3> */}
                <p className="text-sm text-gray-600">
                    Hier können Sie eine einmalige Versorgung für diesen speziellen Fall definieren.
                </p>
            </div>

            {/* Rohling / Fräsblock Selection */}
            <div className="mb-4">
                <ProductSelector
                    products={storageProducts}
                    isLoading={isLoadingProducts}
                    selectedProductId={selectedProduct?.id || ''}
                    onSelect={handleProductSelect}
                />
            </div>

            {/* Versorgungsname */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Versorgungsname
                </label>
                <input
                    type="text"
                    placeholder="z.B. Sonderanfertigung für..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                />
            </div>

            {/* Menge */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menge
                </label>
                <select
                    value={localMenge}
                    onChange={(e) => setLocalMenge(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                >
                    <option value="1">1 Paar</option>
                    <option value="2">2 Paar</option>
                    <option value="3">3 Paar</option>
                    <option value="4">4 Paar</option>
                    <option value="5">5 Paar</option>
                </select>
            </div>

            {/* Materialien */}
            <div className="mb-4">
                <MaterialienInput
                    materialien={materialien}
                    inputValue={materialienInput}
                    onInputChange={setMaterialienInput}
                    onAdd={handleAddMaterialTag}
                    onRemove={handleRemoveMaterialTag}
                    onKeyDown={handleMaterialienKeyDown}
                />
            </div>


            <div className='flex justify-end'>
                {/* button */}
                <Button
                    type="button"
                    className="bg-black cursor-pointer transform duration-300 text-white rounded-full px-12 py-2 text-sm font-semibold focus:outline-none hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[160px]"
                // onClick={handleSave}
                >
                    Add
                </Button>
            </div>
        </div>
    );
}
