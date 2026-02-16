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
import { Plus } from "lucide-react";

interface Insole {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string | null;
    selected: boolean;
    vatRate?: number;
    profitPercentage?: number;
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
                    image: item.image || null,
                    selected: false,
                    vatRate: item.vatRate || 0,
                    profitPercentage: item.profitPercentage || 0,
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
                        .map((item: any): PriceItem | null => {
                            if (typeof item === 'number') {
                                return { name: `Preis ${item}`, price: item };
                            }
                            if (item && typeof item === 'object' && item.name && item.price !== undefined) {
                                const priceItem: PriceItem = { 
                                    name: item.name, 
                                    price: item.price ?? 0
                                };
                                if (item.basePrice !== undefined) priceItem.basePrice = item.basePrice;
                                if (item.commissionPercentage !== undefined) priceItem.commissionPercentage = item.commissionPercentage;
                                if (item.commissionAmount !== undefined) priceItem.commissionAmount = item.commissionAmount;
                                if (item.netBeforeVat !== undefined) priceItem.netBeforeVat = item.netBeforeVat;
                                if (item.vatPercentage !== undefined) priceItem.vatPercentage = item.vatPercentage;
                                if (item.vatAmount !== undefined) priceItem.vatAmount = item.vatAmount;
                                return priceItem;
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
        vatRate: number;
        profitPercentage: number;
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
                    vatRate: data.vatRate,
                    profitPercentage: data.profitPercentage,
                    image: data.image,
                    imageFile: data.imageFile,
                });
            } else {
                await create({
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    vatRate: data.vatRate,
                    profitPercentage: data.profitPercentage,
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
    const handleSaveSettings = async (prices?: PriceItem[], covers?: string[]) => {
        try {
            setIsSaving(true);
            
            const pricesToSave = prices !== undefined ? prices : priceList;
            const coversToSave = covers !== undefined ? covers : coverList;
            
            await getCustomerSettings(pricesToSave, coversToSave);
            
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
                    className="border cursor-pointer bg-[#61A175] text-white rounded-md px-4 py-2 font-bold uppercase text-sm tracking-wide hover:bg-[#61A175]/80 flex items-center gap-2"
                >
                         <Plus className="w-4 h-4" />
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
                editingInsole={editingInsole ? {
                    id: editingInsole.id,
                    name: editingInsole.name,
                    description: editingInsole.description,
                    price: editingInsole.price,
                    image: editingInsole.image || undefined,
                } : null}
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
                onPriceListChange={(prices) => {
                    setPriceList(prices);
                    // Auto-save when price list changes
                    handleSaveSettings(prices, coverList);
                }}
            />
        </div>
    );
}
