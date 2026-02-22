'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IoWarning } from 'react-icons/io5'

interface SonstigesDeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    count: number
    isLoading?: boolean
}

export default function SonstigesDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    count,
    isLoading = false,
}: SonstigesDeleteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <IoWarning className="w-5 h-5" />
                        Löschen bestätigen
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-gray-700">
                        {count === 1
                            ? 'Sind Sie sicher, dass Sie diesen Eintrag löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.'
                            : `Sind Sie sicher, dass Sie ${count} Einträge löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`}
                    </p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Abbrechen
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 cursor-pointer"
                    >
                        {isLoading ? 'Löschen...' : 'Löschen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
