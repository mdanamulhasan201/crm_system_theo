'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Document } from '../../../kundenordner/[id]/_types'

interface DeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    documentToDelete: Document | null
    onConfirm: () => void
    loading: boolean
}

export default function DeleteDialog({
    open,
    onOpenChange,
    documentToDelete,
    onConfirm,
    loading
}: DeleteDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Dokument löschen?</DialogTitle>
                    <DialogDescription>
                        {documentToDelete
                            ? `Möchten Sie "${documentToDelete.title}" endgültig löschen?`
                            : 'Möchten Sie dieses Dokument endgültig löschen?'}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        variant='destructive'
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className='flex items-center gap-2'>
                                <Loader2 className='w-4 h-4 animate-spin' />
                                Löschen...
                            </span>
                        ) : (
                            'Löschen'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
