import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { Trash2, Edit } from "lucide-react";

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

            <div className="space-y-4 mb-12">
                {isInitialLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={`shimmer-${index}`}
                            className="bg-gray-50 border border-gray-300 rounded-[5px] p-4 flex items-center gap-6 relative"
                        >
                            <div className="shrink-0">
                                <div className="w-16 h-16 rounded-sm bg-gray-200 animate-pulse" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-h-[64px] pr-8">
                                <div className="space-y-2">
                                    <div className="h-5 bg-gray-200 animate-pulse rounded w-48" />
                                    <div className="h-4 bg-gray-200 animate-pulse rounded w-64" />
                                </div>
                                <div className="text-right mt-2">
                                    <div className="h-5 bg-gray-200 animate-pulse rounded w-32 ml-auto" />
                                </div>
                            </div>
                            <div className="absolute top-4 right-4">
                                <div className="h-5 w-5 bg-gray-200 animate-pulse rounded" />
                            </div>
                        </div>
                    ))
                ) : (
                    insoles.map((insole) => (
                        <div
                            key={insole.id}
                            className="bg-gray-50 border border-gray-300 rounded-[5px] p-4 flex items-center gap-6 relative group hover:shadow-md transition-shadow"
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <Checkbox
                                    checked={insole.selected}
                                    onChange={() => onSelect(insole.id)}
                                    className="h-5 w-5 border-black border"
                                />
                            </div>
                            <div className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={() => onEdit(insole)}
                                    className="bg-blue-500 text-white rounded-[5px] px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium hover:bg-blue-600 cursor-pointer"
                                >
                                    <Edit className="w-3 h-3" />
                                    Bearbeiten
                                </button>
                            </div>
                            <div className="shrink-0">
                                {insole.image.startsWith('data:') || insole.image.startsWith('http') ? (
                                    <div className="w-16 h-16 rounded-sm overflow-hidden relative">
                                        <Image
                                            src={insole.image}
                                            alt={insole.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-16 h-16 rounded-sm"
                                        style={{ backgroundColor: insole.image }}
                                    />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-h-[64px] pr-8">
                                <div>
                                    <h3 className="font-bold text-base uppercase mb-1 text-black">
                                        {insole.name}
                                    </h3>
                                    <p className="text-sm text-black">{insole.description}</p>
                                </div>
                                <div className="text-right mt-2">
                                    <span className="font-bold text-black">
                                        Preis: {insole.price.toFixed(2).replace(".", ",")}€
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

