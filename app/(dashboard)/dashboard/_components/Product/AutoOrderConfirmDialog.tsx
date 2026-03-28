'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AutoOrderConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    isLoading?: boolean
}

export default function AutoOrderConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    isLoading = false,
}: AutoOrderConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className=" gap-0 rounded-xl border border-gray-200 bg-white shadow-xl sm:max-w-xl  p-5">
                <DialogHeader className="space-y-4 pr-8 text-left">
                    <DialogTitle className="text-2xl leading-tight font-semibold mb-2 text-gray-800">
                        Wurde die Bestellung durchgeführt?
                    </DialogTitle>
                    <DialogDescription className="text-left text-sm md:text-base leading-relaxed text-gray-600">
                        Wenn ja, wird der Lagerbestand entsprechend der empfohlenen Mengen erhöht.
                        Andernfalls bleibt der Artikel als „Nachbesteller“ markiert.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row flex-wrap items-center justify-end gap-3 border-0 pt-2 ">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="h-11 min-w-40 cursor-pointer rounded-lg border border-gray-300 bg-white px-5 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
                    >
                        <span className="inline-flex items-center gap-2">
                            <span aria-hidden>⌛</span>
                            Nein, später
                        </span>
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="h-11 min-w-48 cursor-pointer rounded-lg bg-[#61A178] px-5 text-base font-medium text-white shadow-sm hover:bg-[#61A178]/90"
                    >
                        <span className="inline-flex items-center gap-2">
                            <span aria-hidden>✅</span>
                            Ja, wurde bestellt
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
