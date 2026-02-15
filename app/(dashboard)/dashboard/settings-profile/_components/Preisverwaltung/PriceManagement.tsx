import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { PriceItem } from "./types";
import AddPriceModal from "./AddPriceModal";

interface PriceManagementProps {
    priceList: PriceItem[];
    onPriceListChange: (prices: PriceItem[]) => void;
}

export default function PriceManagement({ priceList, onPriceListChange }: PriceManagementProps) {
    const [newPrice, setNewPrice] = useState("");
    const [newPriceName, setNewPriceName] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [priceToDelete, setPriceToDelete] = useState<PriceItem | null>(null);

    // Helper function to ensure "Standard" is always first
    const sortPricesWithStandardFirst = (prices: PriceItem[]): PriceItem[] => {
        const standardItem = prices.find((item) => item.name.toLowerCase() === "standard");
        const otherItems = prices.filter((item) => item.name.toLowerCase() !== "standard");

        // Sort other items by price
        const sortedOthers = otherItems.sort((a, b) => a.price - b.price);

        // Put Standard first, then others
        return standardItem ? [standardItem, ...sortedOthers] : sortedOthers;
    };

    const addPriceFromInput = useCallback(() => {
        if (!newPrice.trim() || !newPriceName.trim()) return;

        const price = parseFloat(newPrice.trim());
        if (!isNaN(price) && price > 0) {
            const name = newPriceName.trim();
            const nameExists = priceList.some((item) => item.name === name);
            if (nameExists) {
                toast.error("Ein Preis mit diesem Namen existiert bereits.");
                return;
            }
            const updatedList = [...priceList, { name, price }];
            const sortedList = sortPricesWithStandardFirst(updatedList);
            onPriceListChange(sortedList);
            setNewPrice("");
            setNewPriceName("");
        }
    }, [newPrice, newPriceName, priceList, onPriceListChange]);

    const handleDeleteClick = (price: PriceItem) => {
        setPriceToDelete(price);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!priceToDelete) return;
        
        const filteredList = priceList.filter(
            (item) => item.name !== priceToDelete.name || item.price !== priceToDelete.price
        );
        const sortedList = sortPricesWithStandardFirst(filteredList);
        onPriceListChange(sortedList);
        
        setDeleteConfirmOpen(false);
        setPriceToDelete(null);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setPriceToDelete(null);
    };

    const clearAllPrices = () => {
        onPriceListChange([]);
        setNewPrice("");
        setNewPriceName("");
    };

    // Calculate net price and VAT from gross price
    const calculateNetAndVat = (grossPrice: number, taxRate: number = 20) => {
        const net = grossPrice / (1 + taxRate / 100);
        const vat = grossPrice - net;
        return { net, vat };
    };

    return (
        <div className="mt-12">
            {/* Alle entfernen link - outside card, top right */}
            {priceList.length > 0 && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={clearAllPrices}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer"
                        type="button"
                    >
                        <X className="w-4 h-4" />
                        Alle entfernen
                    </button>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                {/* Header with title and button in same row */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg text-black">
                        Fussanalyse Preise
                    </h2>
                    <Button
                        onClick={() => setModalOpen(true)}
                        className="bg-[#61A175]  cursor-pointer hover:bg-[#61A175]/80 text-white font-semibold rounded-lg px-6 py-2.5 flex items-center gap-2"
                        type="button"
                    >
                        <Plus className="w-4 h-4" />
                        Preis hinzufügen
                    </Button>
                </div>

                {/* Table */}
                {priceList.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                        Basispreis
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        Provision
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                        Netto
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        MwSt.
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        Aktion
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {priceList.map((item, index) => {
                                    // Use stored values or calculate from price for backward compatibility
                                    const basePrice = item.basePrice ?? item.price;
                                    const commission = item.commissionPercentage ?? 10;
                                    const netto = item.netBeforeVat ?? calculateNetAndVat(item.price, item.vatPercentage ?? 20).net;
                                    const vatPercentage = item.vatPercentage ?? 20;
                                    const vatAmount = item.vatAmount ?? (item.price - netto);
                                    
                                    return (
                                        <tr
                                            key={`${item.name}-${item.price}-${index}`}
                                            className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-900 text-left font-medium">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                                {basePrice.toFixed(2).replace(".", ",")} €
                                            </td>
                                            <td className="px-4 py-3 text-sm text-blue-600 text-center">
                                                {commission}%
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                                {netto.toFixed(2).replace(".", ",")} €
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 text-center">
                                                {vatPercentage}%
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="text-red-600 hover:text-red-700 cursor-pointer p-1 transition-colors"
                                                    type="button"
                                                    title="Löschen"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Noch keine Preise hinzugefügt</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={handleCloseDeleteConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">
                            Preis löschen bestätigen
                        </DialogTitle>
                        <DialogDescription>
                            Sind Sie sicher, dass Sie den Preis "{priceToDelete?.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={handleCloseDeleteConfirm}
                            className="cursor-pointer"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 cursor-pointer hover:bg-red-700 text-white"
                        >
                            Ja, löschen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Price Modal */}
            <AddPriceModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSave={(priceData) => {
                    const nameExists = priceList.some((item) => item.name.toLowerCase() === priceData.name.toLowerCase());
                    if (nameExists) {
                        toast.error("Ein Preis mit diesem Namen existiert bereits.");
                        return;
                    }
                    const updatedList = [...priceList, priceData];
                    const sortedList = sortPricesWithStandardFirst(updatedList);
                    onPriceListChange(sortedList);
                    toast.success("Preis erfolgreich hinzugefügt!");
                }}
            />
        </div>
    );
}
