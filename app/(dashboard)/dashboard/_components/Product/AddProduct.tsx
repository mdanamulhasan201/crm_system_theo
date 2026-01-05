import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'
import toast from 'react-hot-toast'
import AddProductShimmer from '@/components/ShimmerEffect/Product/AddProductShimmer'

interface SizeData {
    length: number;
    quantity: number;
    // Per-size minimum quantity, maps to backend field `mindestmenge`
    mindestmenge?: number;
    autoOrderLimit?: number;
    orderQuantity?: number;
}

interface NewProduct {
    Produktname: string;
    Hersteller: string;
    Produktkürzel: string;
    purchase_price: number;
    selling_price: number;
    sizeQuantities: { [key: string]: SizeData };
}

interface AddProductProps {
    onAddProduct: (product: NewProduct) => void;
    sizeColumns: string[];
    editProductId?: string; // if provided, modal works in edit mode
    open?: boolean; // controlled open (for edit from table)
    onOpenChange?: (open: boolean) => void;
    showTrigger?: boolean; // show default trigger button
    onUpdated?: () => void; // callback after successful update
}

export default function AddProduct({ onAddProduct, sizeColumns, editProductId, open, onOpenChange, showTrigger = true, onUpdated }: AddProductProps) {
    const { createNewProduct, updateExistingProduct, getProductById, isLoading, error, clearError } = useStockManagementSlice();
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const isOpen = open !== undefined ? open : showAddProductModal;
    const setOpen = onOpenChange || setShowAddProductModal;
    const [isPrefilling, setIsPrefilling] = useState(false)
    const [increaseAllSizesInput, setIncreaseAllSizesInput] = useState<string>('');
    const [cumulativeIncreaseValue, setCumulativeIncreaseValue] = useState<number>(0);
    const [newProduct, setNewProduct] = useState<NewProduct>({
        Produktname: '',
        Hersteller: '',
        Produktkürzel: '',
        purchase_price: 0,
        selling_price: 0,
        sizeQuantities: Object.fromEntries(sizeColumns.map(size => [size, { length: 0, quantity: 0, autoOrderLimit: undefined, orderQuantity: undefined }]))
    });

    const handleNewProductChange = (field: keyof NewProduct, value: string | number) => {
        setNewProduct(prev => ({ ...prev, [field]: value }));
    };
    const handleNewProductSizeChange = (size: string, value: string) => {
        setNewProduct(prev => ({
            ...prev,
            sizeQuantities: {
                ...prev.sizeQuantities,
                [size]: {
                    ...prev.sizeQuantities[size],
                    quantity: parseInt(value) || 0
                }
            }
        }));
    };
    const handleNewProductLengthChange = (size: string, value: string) => {
        setNewProduct(prev => ({
            ...prev,
            sizeQuantities: {
                ...prev.sizeQuantities,
                [size]: {
                    ...prev.sizeQuantities[size],
                    length: parseFloat(value) || 0
                }
            }
        }));
    };
    const handleNewProductMinQuantityChange = (size: string, value: string) => {
        setNewProduct(prev => ({
            ...prev,
            sizeQuantities: {
                ...prev.sizeQuantities,
                [size]: {
                    ...prev.sizeQuantities[size],
                    mindestmenge: parseInt(value) || 0
                }
            }
        }));
    };
    const handleAutoOrderLimitChange = (size: string, value: string) => {
        setNewProduct(prev => ({
            ...prev,
            sizeQuantities: {
                ...prev.sizeQuantities,
                [size]: {
                    ...prev.sizeQuantities[size],
                    autoOrderLimit: value === '' ? undefined : (parseInt(value) || undefined)
                }
            }
        }));
    };
    const handleOrderQuantityChange = (size: string, value: string) => {
        setNewProduct(prev => ({
            ...prev,
            sizeQuantities: {
                ...prev.sizeQuantities,
                [size]: {
                    ...prev.sizeQuantities[size],
                    orderQuantity: value === '' ? undefined : (parseInt(value) || undefined)
                }
            }
        }));
    };
    const handleIncreaseAllSizes = () => {
        if (!increaseAllSizesInput || increaseAllSizesInput.trim() === '') {
            return;
        }

        const numValue = parseInt(increaseAllSizesInput) || 0;
        if (numValue <= 0) return;

        // Update all sizes by adding the entered value
        setNewProduct(prev => {
            const updatedSizeQuantities = { ...prev.sizeQuantities };
            Object.keys(updatedSizeQuantities).forEach(size => {
                const currentQuantity = updatedSizeQuantities[size]?.quantity || 0;
                updatedSizeQuantities[size] = {
                    ...updatedSizeQuantities[size],
                    quantity: currentQuantity + numValue
                };
            });
            return {
                ...prev,
                sizeQuantities: updatedSizeQuantities
            };
        });

        // Update cumulative value and clear input for next entry
        setCumulativeIncreaseValue(prev => prev + numValue);
        setIncreaseAllSizesInput('');
    };
    // Helper function to transform sizeQuantities from camelCase to snake_case for backend
    const transformSizeQuantitiesForBackend = (sizeQuantities: { [key: string]: SizeData }) => {
        const transformed: { [key: string]: any } = {};
        Object.keys(sizeQuantities).forEach(size => {
            const sizeData = sizeQuantities[size];
            transformed[size] = {
                length: sizeData.length,
                quantity: sizeData.quantity,
                ...(sizeData.mindestmenge !== undefined && { mindestmenge: sizeData.mindestmenge }),
                // Always include auto_order_limit and auto_order_quantity, even if undefined
                auto_order_limit: sizeData.autoOrderLimit !== undefined ? sizeData.autoOrderLimit : null,
                auto_order_quantity: sizeData.orderQuantity !== undefined ? sizeData.orderQuantity : null
            };
        });
        return transformed;
    };

    const handleAddProduct = async () => {
        try {
            clearError();
            // If edit mode -> update, else create
            if (editProductId) {
                const payload = {
                    produktname: newProduct.Produktname,
                    hersteller: newProduct.Hersteller,
                    artikelnummer: newProduct.Produktkürzel,
                    mindestbestand: 0,
                    // do not send 'historie' on update; backend model doesn't accept it
                    groessenMengen: transformSizeQuantitiesForBackend(newProduct.sizeQuantities),
                    purchase_price: newProduct.purchase_price,
                    selling_price: newProduct.selling_price,
                    Status: 'In Stock'
                } as const;
                const res = await updateExistingProduct(editProductId, payload);
                toast.success(res?.message || 'Produkt erfolgreich aktualisiert');
                setOpen(false);
                onUpdated && onUpdated();
                return;
            }
            const response = await createNewProduct(newProduct);

            // Show success toast with product details
            if (response.success && response.data) {
                const productInfo = response.data;
                // Use the message from API response and show product details
                toast.success(`${response.message} `);

                // Call the onAddProduct callback with the API response - don't add id to avoid TypeScript error
                onAddProduct(newProduct);
            } else {
                toast.success(response.message || 'Storage created successfully',
                    {
                        duration: 4000,
                        position: 'top-right',
                    });

                onAddProduct(newProduct);
            }

            // Reset form and close modal
            setOpen(false);
            setNewProduct({
                Produktname: '',
                Hersteller: '',
                Produktkürzel: '',
                purchase_price: 0,
                selling_price: 0,
                sizeQuantities: Object.fromEntries(sizeColumns.map(size => [size, { length: 0, quantity: 0, autoOrderLimit: undefined, orderQuantity: undefined }]))
            });
            setIncreaseAllSizesInput('');
            setCumulativeIncreaseValue(0);
        } catch (err) {
            console.error('Failed to create product:', err);
            // Show error toast
            toast.error('Fehler beim Erstellen des Produkts. Bitte versuchen Sie es erneut.', {
                duration: 5000,
                position: 'top-right',
            });
        }
    };

    // Preload data when editing
    React.useEffect(() => {
        const load = async () => {
            if (!editProductId || !isOpen) return;
            try {
                setIsPrefilling(true)
                const product = await getProductById(editProductId);
                // Convert backend format to frontend format
                const convertedSizeQuantities: { [key: string]: SizeData } = {};
                if (product.groessenMengen) {
                    Object.keys(product.groessenMengen).forEach(size => {
                        const sizeData = product.groessenMengen[size];
                        // Check if it's already in the new format {length, quantity}
                        if (typeof sizeData === 'object' && 'length' in sizeData && 'quantity' in sizeData) {
                            const data = sizeData as any;
                            convertedSizeQuantities[size] = {
                                ...sizeData as SizeData,
                                // Transform snake_case from backend to camelCase for frontend
                                autoOrderLimit: data.auto_order_limit ?? data.autoOrderLimit ?? undefined,
                                orderQuantity: data.auto_order_quantity ?? data.orderQuantity ?? undefined
                            };
                        } else {
                            // Old format: just a number, convert to new format
                            convertedSizeQuantities[size] = {
                                quantity: sizeData as number,
                                length: product.groessenLaengen?.[size] ? parseFloat(product.groessenLaengen[size]) || 0 : 0,
                                autoOrderLimit: undefined,
                                orderQuantity: undefined
                            };
                        }
                    });
                }

                setNewProduct({
                    Produktname: product.produktname,
                    Hersteller: product.hersteller,
                    Produktkürzel: product.artikelnummer,
                    purchase_price: product.purchase_price,
                    selling_price: product.selling_price,
                    sizeQuantities: Object.keys(convertedSizeQuantities).length > 0
                        ? convertedSizeQuantities
                        : Object.fromEntries(sizeColumns.map(size => [size, { length: 0, quantity: 0, autoOrderLimit: undefined, orderQuantity: undefined }]))
                });
                // Reset increase all sizes field when editing
                setIncreaseAllSizesInput('');
                setCumulativeIncreaseValue(0);
            } finally {
                setIsPrefilling(false)
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editProductId, isOpen]);

    // Reset form when modal closes (uncontrolled case handled too)
    React.useEffect(() => {
        if (!isOpen && !editProductId) {
            setNewProduct({
                Produktname: '',
                Hersteller: '',
                Produktkürzel: '',
                purchase_price: 0,
                selling_price: 0,
                sizeQuantities: Object.fromEntries(sizeColumns.map(size => [size, { length: 0, quantity: 0, autoOrderLimit: undefined, orderQuantity: undefined }]))
            });
            setIncreaseAllSizesInput('');
            setCumulativeIncreaseValue(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    return (
        <>
            {showTrigger && (
                <button
                    className='bg-[#61A178] px-4 py-2 rounded-md hover:bg-[#61A178]/80 text-white cursor-pointer transition-all duration-300'
                    onClick={() => setOpen(true)}
                >
                    {editProductId ? 'Produkt bearbeiten' : 'Add Product'}
                </button>
            )}
            <Dialog open={isOpen} onOpenChange={setOpen}>
                <DialogContent className="!max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editProductId ? 'Produkt bearbeiten' : 'Produkt manuell hinzufügen'}</DialogTitle>
                    </DialogHeader>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            <p className="font-medium">Fehler beim Erstellen des Produkts</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    <form onSubmit={e => { e.preventDefault(); handleAddProduct(); }} className="space-y-6 relative">
                        {/* Shimmer overlay when updating */}
                        {isLoading && editProductId && <AddProductShimmer />}
                        
                        {/* Row 1: Produktname and Hersteller */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Produktname</label>
                                <Input value={newProduct.Produktname} onChange={e => handleNewProductChange('Produktname', e.target.value)} required disabled={!!editProductId || !!(isLoading && editProductId)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Hersteller</label>
                                <Input value={newProduct.Hersteller} onChange={e => handleNewProductChange('Hersteller', e.target.value)} required disabled={!!editProductId || !!(isLoading && editProductId)} />
                            </div>
                        </div>

                        {/* Row 2: Artikelnummer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Artikelnummer</label>
                                <Input value={newProduct.Produktkürzel} onChange={e => handleNewProductChange('Produktkürzel', e.target.value)} required disabled={!!editProductId || !!(isLoading && editProductId)} />
                            </div>
                        </div>

                        {/* Row 3: Einkaufspreis and Verkaufspreis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Einkaufspreis (€)</label>
                                <Input type="number" step="0.01" min={0} value={newProduct.purchase_price} onChange={e => handleNewProductChange('purchase_price', parseFloat(e.target.value) || 0)} required disabled={!!editProductId || !!(isLoading && editProductId)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Verkaufspreis (€)</label>
                                <Input type="number" step="0.01" min={0} value={newProduct.selling_price} onChange={e => handleNewProductChange('selling_price', parseFloat(e.target.value) || 0)} required disabled={!!editProductId || !!(isLoading && editProductId)} />
                            </div>
                        </div>

                        {/* Row 4: Alle Größen um X erhöhen - Commented out for edit mode */}
                        {/* {!editProductId && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Alle Größen um X erhöhen
                                        {cumulativeIncreaseValue > 0 && (
                                            <span className="ml-2 text-sm text-gray-500">(Gesamt: {cumulativeIncreaseValue})</span>
                                        )}
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            min={0}
                                            value={increaseAllSizesInput}
                                            onChange={e => setIncreaseAllSizesInput(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleIncreaseAllSizes();
                                                }
                                            }}
                                            placeholder="Anzahl eingeben..."
                                            className="flex-1"
                                            disabled={!!(isLoading && editProductId)}
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleIncreaseAllSizes}
                                            className="bg-[#61A178] hover:bg-[#61A178]/80 text-white"
                                            disabled={!!(isLoading && editProductId)}
                                        >
                                            Hinzufügen
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )} */}
                        <div>
                            <label className="block text-sm font-medium mb-3">Größen & Mengen</label>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-medium">Größe</TableHead>
                                            <TableHead className="font-medium">Bestand</TableHead>
                                            <TableHead className="font-medium">Länge (cm)</TableHead>
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
                                                        value={newProduct.sizeQuantities[size]?.quantity || 0}
                                                        onChange={e => handleNewProductSizeChange(size, e.target.value)}
                                                        className="w-full"
                                                        disabled={!!editProductId || !!(isLoading && editProductId)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        min={0}
                                                        value={newProduct.sizeQuantities[size]?.length || ''}
                                                        onChange={e => handleNewProductLengthChange(size, e.target.value)}
                                                        placeholder="z.B. 150"
                                                        className="w-full"
                                                        disabled={!!editProductId || !!(isLoading && editProductId)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        placeholder="0"
                                                        value={newProduct.sizeQuantities[size]?.mindestmenge ?? ''}
                                                        onChange={e => handleNewProductMinQuantityChange(size, e.target.value)}
                                                        className="w-full"
                                                        disabled={!!(isLoading && editProductId)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        placeholder=" 3"
                                                        value={newProduct.sizeQuantities[size]?.autoOrderLimit !== undefined ? newProduct.sizeQuantities[size]?.autoOrderLimit : ''}
                                                        onChange={e => handleAutoOrderLimitChange(size, e.target.value)}
                                                        className="w-full"
                                                        disabled={!!(isLoading && editProductId)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        placeholder="10"
                                                        value={newProduct.sizeQuantities[size]?.orderQuantity !== undefined ? newProduct.sizeQuantities[size]?.orderQuantity : ''}
                                                        onChange={e => handleOrderQuantityChange(size, e.target.value)}
                                                        className="w-full"
                                                        disabled={!!(isLoading && editProductId)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                className="cursor-pointer"
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowAddProductModal(false);
                                    clearError();
                                }}
                                disabled={isLoading}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#61A178] cursor-pointer hover:bg-[#61A178]/80 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (editProductId ? 'Aktualisieren...' : 'Erstellen...') : (editProductId ? 'Aktualisieren' : 'Hinzufügen')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
