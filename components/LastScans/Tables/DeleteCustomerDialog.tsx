'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeleteCustomerDialogProps {
    open: boolean;
    customer: { id: string; name: string } | null;
    isDeleting: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function DeleteCustomerDialog({
    open,
    customer,
    isDeleting,
    onOpenChange,
    onConfirm,
}: DeleteCustomerDialogProps) {
    const [showFinalWarning, setShowFinalWarning] = useState(false);

    // Reset when dialog opens/closes
    useEffect(() => {
        if (open) {
            setShowFinalWarning(false);
        }
    }, [open]);

    const handleFirstConfirm = () => {
        setShowFinalWarning(true);
    };

    const handleFinalConfirm = () => {
        onConfirm();
    };

    const handleCancel = () => {
        setShowFinalWarning(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    {!showFinalWarning ? (
                        <>
                            <DialogTitle className="text-red-600">Kunde löschen bestätigen</DialogTitle>
                            <DialogDescription>
                                Sind Sie sicher, dass Sie den Kunden <strong>{customer?.name}</strong> löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                            </DialogDescription>
                        </>
                    ) : (
                        <>
                            <DialogTitle className="text-red-600 text-xl font-bold">Achtung: Alle Daten gehen dauerhaft verloren</DialogTitle>
                            <DialogDescription className="text-base pt-2">
                                Sind Sie sicher, dass Sie alle Scans und sämtliche Daten dieses Kunden endgültig löschen möchten?
                                <br /><br />
                                <strong className="text-red-600">Dieser Vorgang kann nicht rückgängig gemacht werden.</strong>
                            </DialogDescription>
                        </>
                    )}
                </DialogHeader>
                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={showFinalWarning ? () => setShowFinalWarning(false) : handleCancel}
                        disabled={isDeleting}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={showFinalWarning ? handleFinalConfirm : handleFirstConfirm}
                        disabled={isDeleting}
                        className="bg-red-600 cursor-pointer hover:bg-red-700 text-white"
                    >
                        {isDeleting ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Löschen...</span>
                            </div>
                        ) : showFinalWarning ? (
                            'Endgültig löschen'
                        ) : (
                            'Ja, löschen'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

