'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export interface AuftragserstellungNotesDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderNote: string;
    supplyNote: string;
    stepNote: string;
}

export default function AuftragserstellungNotesDetailModal({
    open,
    onOpenChange,
    orderNote,
    supplyNote,
    stepNote,
}: AuftragserstellungNotesDetailModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Notizen (Auftragserstellung)</DialogTitle>
                    <DialogDescription className="sr-only">
                        Order Note, Supply Note und Step Note
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-1">
                    <div>
                        <Label className="text-sm font-medium text-gray-800 mb-2 block">Order Note</Label>
                        <textarea
                            readOnly
                            value={orderNote}
                            placeholder="Keine Order Note"
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm text-gray-800 placeholder:text-gray-400 resize-none"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-800 mb-2 block">Supply Note</Label>
                        <textarea
                            readOnly
                            value={supplyNote}
                            placeholder="Keine Supply Note"
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm text-gray-800 placeholder:text-gray-400 resize-none"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-800 mb-2 block">
                            Step Note (Status: Auftragserstellung)
                        </Label>
                        <textarea
                            readOnly
                            value={stepNote}
                            placeholder="Keine Step Note"
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm text-gray-800 placeholder:text-gray-400 resize-none"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
