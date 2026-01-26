import React, { useState } from 'react';
import Image from 'next/image';
import { X, Check, Truck, Minus, Plus } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface ProductDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        description: string;
        image: string;
        size: string;
        matchPercentage: number;
    };
}

const AVAILABLE_SIZES = [
    '36', '37', '38', '39', '40', '41', '42', '43',
    '44', '45', '46', '47'
];

export default function ProductDetailsDialog({ isOpen, onClose, product }: ProductDetailsDialogProps) {
    const [selectedSize, setSelectedSize] = useState(product.size.split(' ')[1] || '42'); // Extract number from "EU 42"
    const [quantity, setQuantity] = useState(1);

    const handleQuantityDecrease = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handleQuantityIncrease = () => {
        setQuantity(quantity + 1);
    };

    const handleOrderNow = () => {
        // Handle order logic here
        console.log('Order:', { product, selectedSize, quantity });
        onClose();
    };

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[70] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg w-[90vw] max-w-md h-auto max-h-[90vh] overflow-y-auto p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {/* Close Button */}
                    <DialogPrimitive.Close className="absolute top-4 right-4 z-10 rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5" />
                    </DialogPrimitive.Close>

                    {/* Product Image */}
                    <div className="relative bg-gray-50 h-64 flex items-center justify-center">
                        <div className="relative w-full h-full">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain p-8"
                            />
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-6">
                        {/* Product Name */}
                        <h2 className="text-2xl font-bold mb-3">{product.name}</h2>

                        {/* Product Description */}
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            Experience ultimate comfort with our flagship orthopedic insole.
                            Featuring multi-layer cushioning technology and anatomical arch
                            support, the {product.name} is perfect for extended daily use.
                        </p>

                        {/* Recommended Section */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="bg-red-600 rounded-full p-1 mt-0.5">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-1">
                                        Recommended from your 3D scan
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        Size {product.size} is your perfect fit
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">Select Size (EU)</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {AVAILABLE_SIZES.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                                            selectedSize === size
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">Quantity</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleQuantityDecrease}
                                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val > 0) setQuantity(val);
                                    }}
                                    className="w-16 h-10 text-center border border-gray-300 rounded-lg font-medium"
                                    min="1"
                                />
                                <button
                                    onClick={handleQuantityIncrease}
                                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Price and Delivery */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-3xl font-bold">€89.00</div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Truck className="h-4 w-4" />
                                <span>Delivery in 4-5 days</span>
                            </div>
                        </div>

                        {/* Order Button */}
                        <button
                            onClick={handleOrderNow}
                            className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                            Order now · EU {selectedSize}
                        </button>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
