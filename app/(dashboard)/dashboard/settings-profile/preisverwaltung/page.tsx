"use client";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Trash2, Edit, X, Plus, Save, Check } from "lucide-react";
import EinlagehinzufügenModal from "../_components/Preisverwaltung/EinlagehinzufügenModal";
import { useEinlagen } from "@/hooks/einlagen/useEinlagen";
import { getCustomerSettings, getSettingData } from "@/apis/einlagenApis";
import toast from "react-hot-toast";

const INPUT_ID = "cover-input";

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
    const [coverList, setCoverList] = useState<string[]>([]);
    const [priceList, setPriceList] = useState<number[]>([]);
    const [newPrice, setNewPrice] = useState("");
    const [isSaving, setIsSaving] = useState(false);

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

    const fetchSettings = useCallback(async () => {
        try {
            const response = await getSettingData();
            if (response?.success && response?.data) {
                const { cover_types, laser_print_prices } = response.data;
                
                // Set cover types
                if (cover_types && Array.isArray(cover_types)) {
                    setCoverList(cover_types);
                }
                
                // Set fussanalyse prices (all values from array)
                if (laser_print_prices && Array.isArray(laser_print_prices)) {
                    setPriceList(laser_print_prices);
                }
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    }, []);

    useEffect(() => {
        fetchEinlagen();
        fetchSettings();
    }, [fetchEinlagen, fetchSettings]);

    const handleInsoleSelect = (id: string) => {
        setInsoles((prev) =>
            prev.map((insole) =>
                insole.id === id ? { ...insole, selected: !insole.selected } : insole
            )
        );
    };

    const focusInput = useCallback(() => {
        setTimeout(() => {
            const input = document.getElementById(INPUT_ID) as HTMLInputElement;
            input?.focus();
        }, 0);
    }, []);

    // const handleMaterialToggle = (material: string) => {
    //     setCoverList((prev) =>
    //         prev.includes(material)
    //             ? prev.filter((item) => item !== material)
    //             : [...prev, material]
    //     );
    //     focusInput();
    // };

    const handleCoverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewCover(value);

        // Auto-add if comma is detected while typing
        if (value.includes(",") && !value.endsWith(",")) {
            const parts = value.split(",");
            const lastPart = parts[parts.length - 1].trim();
            if (lastPart.length > 0 && parts.length > 1) {
                const itemsToAdd = parts
                    .slice(0, -1)
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0 && !coverList.includes(item));

                if (itemsToAdd.length > 0) {
                    setCoverList((prev) => [...prev, ...itemsToAdd]);
                    setNewCover(lastPart);
                }
            }
        }
    };

    const handleCoverInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || (e.key === "," && newCover.trim())) {
            e.preventDefault();
            addCoversFromInput();
        } else if (e.key === "Backspace" && newCover === "" && coverList.length > 0) {
            e.preventDefault();
            setCoverList((prev) => prev.slice(0, -1));
        } else if (e.key === "Escape") {
            setNewCover("");
            const input = document.getElementById(INPUT_ID) as HTMLInputElement;
            input?.blur();
        }
    };

    const handleCoverInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text");
        const items = pastedText
            .split(/[,;\n]/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0 && !coverList.includes(item));

        if (items.length > 0) {
            setCoverList((prev) => [...prev, ...items]);
            setNewCover("");
        }
    };

    const handleCoverInputBlur = () => {
        if (newCover.trim()) {
            addCoversFromInput();
        }
    };

    const addCoversFromInput = useCallback(() => {
        if (!newCover.trim()) return;

        const newCovers = newCover
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0 && !coverList.includes(item));

        if (newCovers.length > 0) {
            setCoverList((prev) => [...prev, ...newCovers]);
            setNewCover("");
            focusInput();
        }
    }, [newCover, coverList, focusInput]);

    const removeCover = (coverToRemove: string) => {
        setCoverList((prev) => prev.filter((item) => item !== coverToRemove));
        focusInput();
    };

    const clearAllCovers = () => {
        setCoverList([]);
        setNewCover("");
        focusInput();
    };

    const addPriceFromInput = useCallback(() => {
        if (!newPrice.trim()) return;

        const price = parseFloat(newPrice.trim());
        if (!isNaN(price) && price > 0 && !priceList.includes(price)) {
            setPriceList((prev) => [...prev, price].sort((a, b) => a - b));
            setNewPrice("");
        }
    }, [newPrice, priceList]);

    const removePrice = (priceToRemove: number) => {
        setPriceList((prev) => prev.filter((price) => price !== priceToRemove));
    };

    const clearAllPrices = () => {
        setPriceList([]);
        setNewPrice("");
    };


    const handleAddInsole = async (data: { id?: string; name: string; description: string; price: number; image?: string; imageFile?: File }) => {
        try {
            if (data.id && editingInsole) {
                await update({
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    image: data.image,
                    imageFile: data.imageFile,
                });
            } else {
                await create({
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    image: data.image,
                    imageFile: data.imageFile,
                });
            }
            await fetchEinlagen();
            setEditingInsole(null);
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving einlage:", error);
        }
    };

    const handleDeleteClick = () => {
        setDeleteConfirmOpen(true);
    };

    const handleDeleteSelected = async () => {
        const selectedIds = insoles.filter((insole) => insole.selected).map((insole) => insole.id);
        if (selectedIds.length === 0) return;

        try {
            await removeMultiple(selectedIds);
            await fetchEinlagen();
            setDeleteConfirmOpen(false);
        } catch (error) {
            console.error("Error deleting einlagen:", error);
        }
    };

    const handleUpdateInsole = (insole: Insole) => {
        setEditingInsole(insole);
        setModalOpen(true);
    };

    const selectedCount = insoles.filter((insole) => insole.selected).length;

    const handleSaveSettings = async () => {
        try {
            setIsSaving(true);
            
            // Prepare payload with price list
            const payload = {
                laser_print_prices: priceList,
                cover_types: coverList,
            };

            await getCustomerSettings(payload.laser_print_prices, payload.cover_types);
            
            toast.success("Einstellungen erfolgreich gespeichert!");
            
            // Optionally refetch settings to ensure UI is in sync
            await fetchSettings();
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Fehler beim Speichern der Einstellungen. Bitte versuchen Sie es erneut.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="  p-6 bg-white min-h-screen">
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

            <div className="space-y-4 mb-12">
                {isInitialLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={`shimmer-${index}`}
                            className="bg-gray-50 border border-gray-300 rounded-[5px] p-4 flex items-center gap-6 relative"
                        >
                            <div className="flex-shrink-0">
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
                                    onChange={() => handleInsoleSelect(insole.id)}
                                    className="h-5 w-5 border-black border"
                                />
                            </div>
                            <div className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={() => handleUpdateInsole(insole)}
                                    className="bg-blue-500 text-white rounded-[5px] px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium hover:bg-blue-600 cursor-pointer"
                                >
                                    <Edit className="w-3 h-3" />
                                    Bearbeiten
                                </button>
                            </div>
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

            <div className="mt-12">
                <h2 className="font-bold text-lg mb-4 text-black">
                    Überzüge Verwalten
                </h2>

                <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                        <div
                            className="border border-gray-300 rounded-[5px] bg-white min-h-[44px] px-3 py-2 flex flex-wrap gap-2 items-center cursor-text focus-within:border-black focus-within:ring-2 focus-within:ring-black/20 transition-all hover:border-gray-400"
                            onClick={() => {
                                const input = document.getElementById(INPUT_ID) as HTMLInputElement;
                                input?.focus();
                            }}
                        >
                            {coverList.map((cover) => (
                                <div
                                    key={cover}
                                    className="px-3 py-1.5 rounded-full border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 text-xs font-semibold flex items-center gap-2 hover:from-blue-100 hover:to-blue-200 transition-all shadow-sm group"
                                >
                                    <span>{cover}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeCover(cover);
                                        }}
                                        className="hover:bg-red-100 rounded-full p-0.5 cursor-pointer transition-colors opacity-70 group-hover:opacity-100 text-red-600 hover:text-red-700"
                                        aria-label={`${cover} entfernen`}
                                        type="button"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            <Input
                                id={INPUT_ID}
                                type="text"
                                placeholder={coverList.length === 0 ? "Neuen Überzug Eingeben (durch Komma getrennt für mehrere)....." : "Weiter eingeben..."}
                                value={newCover}
                                onChange={handleCoverInputChange}
                                onKeyDown={handleCoverInputKeyDown}
                                onPaste={handleCoverInputPaste}
                                onBlur={handleCoverInputBlur}
                                className="border-0 p-0 h-auto flex-1 min-w-[120px] focus-visible:ring-0 focus-visible:border-0 bg-transparent text-black placeholder:text-gray-400 outline-none"
                                autoComplete="off"
                            />

                            {coverList.length > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearAllCovers();
                                    }}
                                    className="ml-auto text-gray-400 hover:text-black transition-colors p-1"
                                    aria-label="Alle entfernen"
                                    type="button"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {coverList.length > 0 && (
                            <p className="text-xs text-gray-600 mt-2 ml-1 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                {coverList.length} {coverList.length === 1 ? "Überzug" : "Überzüge"} hinzugefügt
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={addCoversFromInput}
                        disabled={!newCover.trim()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg px-6 py-2.5 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-md whitespace-nowrap flex items-center gap-2"
                        type="button"
                    >
                        <Plus className="w-4 h-4" />
                        Hinzufügen
                    </Button>
                </div>

                {/* <div className="flex gap-3 mb-6">
                    {MATERIALS.map((material) => (
                        <button
                            key={material}
                            onClick={() => handleMaterialToggle(material)}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${coverList.includes(material)
                                ? "bg-gradient-to-r from-gray-800 to-black text-white shadow-lg"
                                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                                }`}
                        >
                            {material}
                        </button>
                    ))}
                </div> */}

                {/* Save Button for Cover List */}
                {/* {coverList.length > 0 && (
                    <div className="mt-6 flex items-center gap-3">

                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Check className="w-4 h-4 text-green-600" />
                            {coverList.length} {coverList.length === 1 ? "Überzug" : "Überzüge"} bereit zum Speichern
                        </span>
                    </div>
                )} */}
            </div>

            {/* Fussanalyse Price Section */}
            <div className="mt-12">
                <h2 className="font-bold text-lg mb-4 text-black">
                    Fussanalyse Preis
                </h2>

                <div className="flex gap-3 items-center mb-4">
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="Preis eingeben (z.B. 50.00)"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addPriceFromInput();
                            }
                        }}
                        className="border-2 border-gray-300 rounded-lg bg-white max-w-xs h-12 px-4 text-black placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200 transition-all shadow-sm hover:border-gray-400"
                    />
                    <Button
                        onClick={addPriceFromInput}
                        disabled={!newPrice.trim()}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg px-6 py-2.5 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-md whitespace-nowrap flex items-center gap-2"
                        type="button"
                    >
                        <Plus className="w-4 h-4" />
                        Hinzufügen
                    </Button>
                </div>

                {/* Price List */}
                {priceList.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                                <Check className="w-4 h-4 text-green-600" />
                                {priceList.length} {priceList.length === 1 ? "Preis" : "Preise"} hinzugefügt
                            </p>
                            <button
                                onClick={clearAllPrices}
                                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                type="button"
                            >
                                <X className="w-4 h-4" />
                                Alle entfernen
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {priceList.map((price) => (
                                <div
                                    key={price}
                                    className="px-4 py-2 rounded-lg border-2 border-green-500 bg-gradient-to-r from-green-50 to-green-100 text-green-900 text-sm font-semibold flex items-center gap-2 hover:from-green-100 hover:to-green-200 transition-all shadow-sm group"
                                >
                                    <span>{price.toFixed(2).replace(".", ",")}€</span>
                                    <button
                                        onClick={() => removePrice(price)}
                                        className="hover:bg-red-100 rounded-full p-0.5 cursor-pointer transition-colors opacity-70 group-hover:opacity-100 text-red-600 hover:text-red-700"
                                        aria-label={`${price} entfernen`}
                                        type="button"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* save button  */}
            <div className="mt-12">
                <Button
                    onClick={handleSaveSettings}
                    disabled={isSaving || (coverList.length === 0 && priceList.length === 0)}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg px-6 py-2.5 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-md"
                >
                    {isSaving ? "Speichern..." : "Speichern"}
                </Button>
            </div>
        </div>
    );
}
