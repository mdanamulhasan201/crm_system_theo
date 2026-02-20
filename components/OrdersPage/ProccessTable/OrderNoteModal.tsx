'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface OrderNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderData?: {
        name: string;
        orderNumber: string;
        product?: string;
    };
    notes?: string;
}

export default function OrderNoteModal({
    isOpen,
    onClose,
    orderData,
    notes
}: OrderNoteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Notizen
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                    {orderData && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Kunde:</span>
                                <span className="text-gray-900">{orderData.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Auftragsnummer:</span>
                                <span className="text-gray-900">{orderData.orderNumber}</span>
                            </div>
                            {orderData.product && (
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Produkt:</span>
                                    <span className="text-gray-900">{orderData.product}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Notizen
                        </label>
                        <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 border border-gray-200 rounded-lg bg-white">
                            {notes ? (
                                <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
                            ) : (
                                <p className="text-gray-400 italic">Keine Notizen vorhanden</p>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
