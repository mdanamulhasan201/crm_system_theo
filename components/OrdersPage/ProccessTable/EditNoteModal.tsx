'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateNote } from '@/apis/productsOrder';
import toast from 'react-hot-toast';

interface EditNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    noteId: string | null;
    initialNote: string;
    onSuccess?: () => void;
}

export default function EditNoteModal({
    isOpen,
    onClose,
    noteId,
    initialNote,
    onSuccess,
}: EditNoteModalProps) {
    const [note, setNote] = useState(initialNote);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) setNote(initialNote);
    }, [isOpen, initialNote]);

    const handleClose = () => {
        setNote('');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteId || !note.trim()) {
            toast.error('Bitte Notiz eingeben');
            return;
        }
        setSubmitting(true);
        try {
            await updateNote(noteId, { note: note.trim() });
            toast.success('Notiz aktualisiert');
            onSuccess?.();
            handleClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Fehler beim Aktualisieren');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Notiz bearbeiten</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-2">
                        <label className="block text-sm font-medium text-gray-700">Notiz</label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Notiz eingeben..."
                            rows={4}
                            className="resize-none"
                            disabled={submitting}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={submitting} className="cursor-pointer">
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={submitting || !note.trim()} className="cursor-pointer bg-[#62A07C] hover:bg-[#62A07C]/90">
                            {submitting ? 'Wird gespeichert...' : 'Speichern'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
