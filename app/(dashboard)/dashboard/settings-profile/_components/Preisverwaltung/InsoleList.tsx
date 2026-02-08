import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { Trash2, Package } from "lucide-react";

interface Insole {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    selected: boolean;
}

interface InsoleListProps {
    insoles: Insole[];
    isLoading: boolean;
    isInitialLoading: boolean;
    onSelect: (id: string) => void;
    onEdit: (insole: Insole) => void;
    onDeleteClick: () => void;
    onDeleteConfirm: () => void;
    deleteConfirmOpen: boolean;
    onCloseDeleteConfirm: () => void;
    selectedCount: number;
}

export default function InsoleList({
    insoles,
    isLoading,
    isInitialLoading,
    onSelect,
    onEdit,
    onDeleteClick,
    onDeleteConfirm,
    deleteConfirmOpen,
    onCloseDeleteConfirm,
    selectedCount,
}: InsoleListProps) {
    return (
        <>
            <div className="flex justify-between items-center mb-8">
                {selectedCount > 0 && (
                    <div className="flex gap-3">
                        <button
                            onClick={onDeleteClick}
                            className="border border-red-500 text-red-500 rounded-[5px] px-4 py-2 font-bold uppercase text-sm tracking-wide bg-white hover:bg-red-50 cursor-pointer flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Löschen ({selectedCount})
                        </button>
                    </div>
                )}
            </div>

            <Dialog open={deleteConfirmOpen} onOpenChange={onCloseDeleteConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">
                            Einlagen löschen bestätigen
                        </DialogTitle>
                        <DialogDescription>
                            Sind Sie sicher, dass Sie {selectedCount} Einlage(n) löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={onCloseDeleteConfirm}
                            disabled={isLoading}
                            className="cursor-pointer"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            onClick={onDeleteConfirm}
                            disabled={isLoading}
                            className="bg-red-600 cursor-pointer hover:bg-red-700 text-white"
                        >
                            {isLoading ? "Löschen..." : "Ja, löschen"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Section Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-6">Einlagen</h2>

            <div className="space-y-4 mb-12">
                {isInitialLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={`shimmer-${index}`}
                            className="bg-white border border-gray-300 rounded-lg p-4 flex items-center gap-6 shadow-sm"
                        >
                            <div className="shrink-0">
                                <div className="w-16 h-16 rounded-md bg-gray-200 animate-pulse" />
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="h-5 bg-gray-200 animate-pulse rounded w-48" />
                                    <div className="h-4 bg-gray-200 animate-pulse rounded w-64" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-5 bg-gray-200 animate-pulse rounded w-32" />
                                    <div className="h-5 w-5 bg-gray-200 animate-pulse rounded" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    insoles.map((insole) => {
                        // Calculate VAT (assuming 20% VAT rate)
                        const vatRate = 20;
                        const grossPrice = insole.price;
                        const formattedPrice = grossPrice.toFixed(2).replace(".", ",");

                        return (
                            <div
                                key={insole.id}
                                onClick={() => onEdit(insole)}
                                className="bg-white border border-gray-300 rounded-lg p-4 flex items-center gap-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            >
                                {/* Left: Icon */}
                                <div className="shrink-0">
                                    {insole.image.startsWith('data:') || insole.image.startsWith('http') ? (
                                        <div className="w-16 h-16 rounded-md overflow-hidden relative bg-gray-100 flex items-center justify-center">
                                            <Image
                                                src={insole.image}
                                                alt={insole.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Middle: Product Details */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base uppercase mb-1 text-gray-900">
                                        {insole.name}
                                    </h3>
                                    <p className="text-sm text-gray-700">{insole.description}</p>
                                </div>

                                {/* Right: Price, VAT, Checkbox */}
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <div className="font-bold text-lg text-green-600 mb-1">
                                            Brutto: {formattedPrice} €
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            MwSt. {vatRate}% enthalten
                                        </div>
                                    </div>
                                    <div 
                                        className="shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Checkbox
                                            checked={insole.selected}
                                            onChange={() => onSelect(insole.id)}
                                            className="h-5 w-5 border-[#61A175] data-[state=checked]:bg-[#61A175] data-[state=checked]:border-[#61A175]"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}

