'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface MasschuHistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    orderData?: {
        id: string;
        name: string;
        orderNumber: string;
        product: string;
    };
}

export default function MasschuHistorySidebar({
    isOpen,
    onClose,
    orderData
}: MasschuHistorySidebarProps) {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        } else {
            // Delay unmounting to allow exit animation
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm ${
                    isOpen 
                        ? 'opacity-100' 
                        : 'opacity-0'
                }`}
                style={{
                    transition: 'opacity 350ms ease-in-out',
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
                onClick={onClose}
                aria-hidden={!isOpen}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform ${
                    isOpen 
                        ? 'translate-x-0' 
                        : 'translate-x-full'
                }`}
                style={{
                    transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                    willChange: 'transform',
                }}
                aria-hidden={!isOpen}
            >
                <div className="h-full flex flex-col bg-white overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10 bg-white">
                        <h2 className="text-lg font-medium text-gray-900">
                            Historie & Analyse{orderData?.orderNumber ? ` - ${orderData.orderNumber}` : ''}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
                        {orderData && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700 text-sm">Kunde:</span>
                                        <span className="text-gray-900 text-sm">{orderData.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700 text-sm">Auftragsnummer:</span>
                                        <span className="text-gray-900 text-sm">{orderData.orderNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700 text-sm">Produkt:</span>
                                        <span className="text-gray-900 text-sm">{orderData.product}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <p className="text-gray-600">Keine Historie-Daten verfügbar</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
