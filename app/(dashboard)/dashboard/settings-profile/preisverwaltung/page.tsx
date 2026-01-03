"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import EinlagehinzufügenModal from "../_components/Preisverwaltung/EinlagehinzufügenModal";
import InsoleList from "../_components/Preisverwaltung/InsoleList";
import CoverManagement from "../_components/Preisverwaltung/CoverManagement";
import PriceManagement from "../_components/Preisverwaltung/PriceManagement";
import { useEinlagen } from "@/hooks/einlagen/useEinlagen";
import { getCustomerSettings, getSettingData } from "@/apis/einlagenApis";
import toast from "react-hot-toast";
import { PriceItem } from "../_components/Preisverwaltung/types";

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
    const [coverList, setCoverList] = useState<string[]>([]);
    const [priceList, setPriceList] = useState<PriceItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Einlagen
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

    // Fetch Settings
    const fetchSettings = useCallback(async () => {
        try {
            const response = await getSettingData();
            if (response?.success && response?.data) {
                const { cover_types, laser_print_prices } = response.data;
                
                if (cover_types && Array.isArray(cover_types)) {
                    setCoverList(cover_types);
                }
                
                if (laser_print_prices && Array.isArray(laser_print_prices)) {
                    const formattedPrices: PriceItem[] = laser_print_prices
                        .map((item: any) => {
                            if (typeof item === 'number') {
                                return { name: `Preis ${item}`, price: item };
                            }
                            if (item && typeof item === 'object' && item.name && item.price) {
                                return { name: item.name, price: item.price };
                            }
                            return null;
                        })
                        .filter((item): item is PriceItem => item !== null);
                    
                    // Ensure "Standard" is always first
                    const standardItem = formattedPrices.find((item) => item.name.toLowerCase() === "standard");
                    const otherItems = formattedPrices.filter((item) => item.name.toLowerCase() !== "standard");
                    const sortedOthers = otherItems.sort((a, b) => a.price - b.price);
                    const sortedPrices = standardItem ? [standardItem, ...sortedOthers] : sortedOthers;
                    
                    setPriceList(sortedPrices);
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

    // Insole handlers
    const handleInsoleSelect = (id: string) => {
        setInsoles((prev) =>
            prev.map((insole) =>
                insole.id === id ? { ...insole, selected: !insole.selected } : insole
            )
        );
    };

    const handleAddInsole = async (data: { 
        id?: string; 
        name: string; 
        description: string; 
        price: number; 
        image?: string; 
        imageFile?: File 
    }) => {
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

    const handleUpdateInsole = (insole: Insole) => {
        setEditingInsole(insole);
        setModalOpen(true);
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

    // Settings handlers
    const handleSaveSettings = async () => {
        try {
            setIsSaving(true);
            
            await getCustomerSettings(priceList, coverList);
            
            toast.success("Einstellungen erfolgreich gespeichert!");
            await fetchSettings();
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Fehler beim Speichern der Einstellungen. Bitte versuchen Sie es erneut.");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedCount = insoles.filter((insole) => insole.selected).length;

    return (
        <div className="p-6 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div className="flex-1" />
                <button
                    onClick={() => {
                        setEditingInsole(null);
                        setModalOpen(true);
                    }}
                    className="border cursor-pointer border-black rounded-[5px] px-4 py-2 font-bold uppercase text-sm tracking-wide bg-white hover:bg-gray-50 text-black"
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

            <InsoleList
                insoles={insoles}
                isLoading={isLoading}
                isInitialLoading={isInitialLoading}
                onSelect={handleInsoleSelect}
                onEdit={handleUpdateInsole}
                onDeleteClick={handleDeleteClick}
                onDeleteConfirm={handleDeleteSelected}
                deleteConfirmOpen={deleteConfirmOpen}
                onCloseDeleteConfirm={() => setDeleteConfirmOpen(false)}
                selectedCount={selectedCount}
            />

            <CoverManagement
                coverList={coverList}
                onCoverListChange={setCoverList}
            />

            <PriceManagement
                priceList={priceList}
                onPriceListChange={setPriceList}
            />

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
