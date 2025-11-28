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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-red-600">Kunde löschen bestätigen</DialogTitle>
                    <DialogDescription>
                        Sind Sie sicher, dass Sie den Kunden <strong>{customer?.name}</strong> löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-red-600 cursor-pointer hover:bg-red-700 text-white"
                    >
                        {isDeleting ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Löschen...</span>
                            </div>
                        ) : (
                            'Ja, löschen'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

