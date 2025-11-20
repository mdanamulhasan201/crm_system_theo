import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React from 'react'

interface FormData {
    ausführliche_diagnose?: string;
    versorgung_laut_arzt?: string;
    einlagentyp?: string;
    überzug?: string;
    menge?: number;
    versorgung_note?: string;
    schuhmodell_wählen?: string;
    kostenvoranschlag?: boolean;
    employeeName?: string;
    employeeId?: string;
}

interface OrderConfirmationModalProps {
    showConfirmModal: boolean;
    setShowConfirmModal: (showConfirmModal: boolean) => void;
    handleConfirmOrder: () => void;
    isCreating: boolean;
    formData?: FormData | null;
    customerId?: string;
    versorgungId?: string | null;
}
export default function OrderConfirmationModal({ showConfirmModal, setShowConfirmModal, handleConfirmOrder, isCreating, formData, customerId, versorgungId }: OrderConfirmationModalProps) {


    return (

        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal} >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bestellung bestätigen</DialogTitle>
                    <DialogDescription>
                        Sind Sie sicher, dass Sie eine neue Bestellung für diesen Kunden erstellen möchten?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        className='cursor-pointer'
                        variant="outline"
                        onClick={() => setShowConfirmModal(false)}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        className='cursor-pointer'
                        onClick={handleConfirmOrder}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Erstelle...' : 'Ja, erstellen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


    )
}
