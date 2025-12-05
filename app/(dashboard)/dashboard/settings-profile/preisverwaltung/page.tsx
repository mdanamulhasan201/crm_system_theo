"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Trash2, Edit } from "lucide-react";
import EinlagehinzufügenModal from "../_components/Preisverwaltung/EinlagehinzufügenModal";
import { useEinlagen } from "@/hooks/einlagen/useEinlagen";

interface Insole {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    selected: boolean;
}

export default function PreisverwaltungPage() {
    const { create, update, removeMultiple, getAll, isLoading } = useEinlagen();
    const [insoles, setInsoles] = useState<Insole[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editingInsole, setEditingInsole] = useState<Insole | null>(null);
    const [newCover, setNewCover] = useState("");
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

    const fetchEinlagen = useCallback(async () => {
        try {
            const response = await getAll(1, 100);
            if (response?.data) {
                const formattedInsoles: Insole[] = response.data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description || "",
                    price: item.price,
                    image: item.image || "#CCCCCC",
                    selected: false,
                }));
                setInsoles(formattedInsoles);
            }
        } catch (error) {
            console.error("Error fetching einlagen:", error);
        } finally {
            setIsInitialLoading(false);
        }
    }, [getAll]);

    // Fetch einlagen on component mount
    useEffect(() => {
        fetchEinlagen();
    }, [fetchEinlagen]);

    const handleInsoleSelect = (id: string) => {
        setInsoles((prev) =>
            prev.map((insole) =>
                insole.id === id ? { ...insole, selected: !insole.selected } : insole
            )
        );
    };

    const handleMaterialToggle = (material: string) => {
        setSelectedMaterials((prev) =>
            prev.includes(material)
                ? prev.filter((m) => m !== material)
                : [...prev, material]
        );
    };

    const handleAddInsole = async (data: { id?: string; name: string; description: string; price: number; image?: string; imageFile?: File }) => {
        try {
            if (data.id && editingInsole) {
                // Update existing insole
                await update({
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    image: data.image,
                    imageFile: data.imageFile,
                });
                // Refresh the list
                await fetchEinlagen();
                setEditingInsole(null);
                setModalOpen(false);
            } else {
                // Create new insole
                await create({
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    image: data.image,
                    imageFile: data.imageFile,
                });
                // Refresh the list
                await fetchEinlagen();
                setModalOpen(false);
            }
        } catch (error) {
            console.error("Error saving einlage:", error);
            // Don't close modal on error so user can retry
        }
    };

    const handleDeleteClick = () => {
        setDeleteConfirmOpen(true);
    };

    const handleDeleteSelected = async () => {
        const selectedIds = insoles.filter((insole) => insole.selected).map((insole) => insole.id);
        if (selectedIds.length > 0) {
            try {
                await removeMultiple(selectedIds);
                // Refresh the list
                await fetchEinlagen();
                setDeleteConfirmOpen(false);
            } catch (error) {
                console.error("Error deleting einlagen:", error);
            }
        }
    };

    const handleUpdateInsole = (insole: Insole) => {
        setEditingInsole(insole);
        setModalOpen(true);
    };

    const selectedCount = insoles.filter((insole) => insole.selected).length;

    return (
        <div className="  p-6 bg-white min-h-screen">
            {/* Header with Add Button and Action Buttons */}
            <div className="flex justify-between items-center mb-8">
                {selectedCount > 0 && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleDeleteClick}
                            className="border border-red-500 text-red-500 rounded-[5px] px-4 py-2 font-bold uppercase text-sm tracking-wide bg-white hover:bg-red-50 cursor-pointer flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Löschen ({selectedCount})
                        </button>
                    </div>
                )}
                <button
                    onClick={() => {
                        setEditingInsole(null);
                        setModalOpen(true);
                    }}
                    className="border cursor-pointer border-black rounded-[5px] px-4 py-2 font-bold uppercase text-sm tracking-wide bg-white hover:bg-gray-50 text-black ml-auto"
                >
                    EINLAGE HINZUFÜGEN
                </button>
            </div>

            {/* Add/Edit Modal */}
            <EinlagehinzufügenModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) {
                        setEditingInsole(null);
                    }
                }}
                onSubmit={handleAddInsole}
                editingInsole={editingInsole}
                isLoading={isLoading}
            />

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
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
                            onClick={() => setDeleteConfirmOpen(false)}
                            disabled={isLoading}
                            className="cursor-pointer"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            onClick={handleDeleteSelected}
                            disabled={isLoading}
                            className="bg-red-600 cursor-pointer hover:bg-red-700 text-white"
                        >
                            {isLoading ? "Löschen..." : "Ja, löschen"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Insole Cards Section */}
            <div className="space-y-4 mb-12">
                {isInitialLoading ? (
                    // Shimmer Loading Effect
                    Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={`shimmer-${index}`}
                            className="bg-gray-50 border border-gray-300 rounded-[5px] p-4 flex items-center gap-6 relative"
                        >
                            {/* Image Shimmer */}
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-sm bg-gray-200 animate-pulse" />
                            </div>

                            {/* Content Shimmer */}
                            <div className="flex-1 flex flex-col justify-between min-h-[64px] pr-8">
                                <div className="space-y-2">
                                    {/* Name Shimmer */}
                                    <div className="h-5 bg-gray-200 animate-pulse rounded w-48" />
                                    {/* Description Shimmer */}
                                    <div className="h-4 bg-gray-200 animate-pulse rounded w-64" />
                                </div>
                                {/* Price Shimmer */}
                                <div className="text-right mt-2">
                                    <div className="h-5 bg-gray-200 animate-pulse rounded w-32 ml-auto" />
                                </div>
                            </div>

                            {/* Checkbox Shimmer */}
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
                            {/* Checkbox in top right */}
                            <div className="absolute top-4 right-4 z-10">
                                <Checkbox
                                    checked={insole.selected}
                                    onChange={() => handleInsoleSelect(insole.id)}
                                    className="h-5 w-5 border-black border"
                                />
                            </div>

                            {/* Update Button - Show on Hover */}
                            <div className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={() => handleUpdateInsole(insole)}
                                    className="bg-blue-500 text-white rounded-[5px] px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium hover:bg-blue-600 cursor-pointer"
                                >
                                    <Edit className="w-3 h-3" />
                                    Bearbeiten
                                </button>
                            </div>

                            {/* Insole Image */}
                            <div className="flex-shrink-0">
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

                            {/* Insole Details */}
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

            {/* Überzüge Verwalten Section */}
            <div className="mt-12">
                <h2 className="font-bold text-lg mb-4 text-black">
                    Überzüge Verwalten
                </h2>

                {/* Input Field */}
                <Input
                    type="text"
                    placeholder="Neuen Überzug Eingeben....."
                    value={newCover}
                    onChange={(e) => setNewCover(e.target.value)}
                    className="border-gray-300 rounded-[5px] mb-4 bg-white"
                />

                {/* Material Tags */}
                <div className="flex gap-3">
                    {["Leder", "Microfaser"].map((material) => (
                        <button
                            key={material}
                            onClick={() => handleMaterialToggle(material)}
                            className={`px-4 py-2 rounded-full border border-black text-sm font-medium transition-colors ${selectedMaterials.includes(material)
                                ? "bg-black text-white"
                                : "bg-gray-50 text-black hover:bg-gray-100"
                                }`}
                        >
                            {material}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
