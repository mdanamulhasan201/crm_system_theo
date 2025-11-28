import { Button } from '@/components/ui/button';

interface LastScanToolbarProps {
    onExport: () => void;
}

export function LastScanToolbar({ onExport }: LastScanToolbarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h2 className="text-2xl font-semibold text-gray-900">Kundenaufträge Übersicht</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Überwachen Sie die Kundenaktivität, neueste Scans und den Auftragspipeline auf einen Blick.
                </p>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    className="rounded-full border-gray-300 text-sm px-4 py-2 cursor-pointer"
                    onClick={onExport}
                >
                    Exportieren
                </Button>
                <Button variant="outline" className="rounded-full border-gray-300 text-sm px-4 py-2 cursor-pointer">
                    Import
                </Button>
            </div>
        </div>
    );
}

