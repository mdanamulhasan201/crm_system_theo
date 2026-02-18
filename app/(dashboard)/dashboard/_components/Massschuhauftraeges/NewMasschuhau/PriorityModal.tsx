'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';

interface PriorityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    orderName?: string;
    orderNumber?: string;
    isUrgent: boolean;
}

export default function PriorityModal({
    isOpen,
    onClose,
    onConfirm,
    orderName,
    orderNumber,
    isUrgent
}: PriorityModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className={`w-5 h-5 ${isUrgent ? 'text-gray-600' : 'text-red-600'}`} />
                        {isUrgent ? 'Priorität entfernen' : 'Als Dringend markieren'}
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        {isUrgent ? (
                            <>
                                Möchten Sie die Priorität für <strong>{orderName}</strong> ({orderNumber}) entfernen?
                            </>
                        ) : (
                            <>
                                Möchten Sie <strong>{orderName}</strong> ({orderNumber}) als dringend markieren?
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className={`flex items-center justify-between p-3 rounded-lg ${
                        isUrgent ? 'bg-gray-50' : 'bg-red-50'
                    }`}>
                        <span className="text-sm text-gray-600">Aktueller Status:</span>
                        <span className={`text-sm font-medium ${
                            isUrgent ? 'text-red-800' : 'text-gray-800'
                        }`}>
                            {isUrgent ? 'Dringend' : 'Normal'}
                        </span>
                    </div>
                    {!isUrgent && (
                        <>
                            <div className="flex items-center justify-center my-2">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <span className="text-sm text-gray-600">Neuer Status:</span>
                                <span className="text-sm font-medium text-red-800">Dringend</span>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={onClose}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className={`cursor-pointer ${
                            isUrgent 
                                ? 'bg-gray-600 hover:bg-gray-700' 
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {isUrgent ? 'Priorität entfernen' : 'Als Dringend markieren'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
