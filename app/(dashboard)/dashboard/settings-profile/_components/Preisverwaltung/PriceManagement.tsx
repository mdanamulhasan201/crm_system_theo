import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
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

    const removePrice = (priceToRemove: PriceItem) => {
        const filteredList = priceList.filter(
            (item) => item.name !== priceToRemove.name || item.price !== priceToRemove.price
        );
        const sortedList = sortPricesWithStandardFirst(filteredList);
        onPriceListChange(sortedList);
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
                                        Brutto
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        Steuersatz
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                        Netto
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {priceList.map((item, index) => {
                                    const { net } = calculateNetAndVat(item.price, 20);
                                    return (
                                        <tr
                                            key={`${item.name}-${item.price}-${index}`}
                                            className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-900 text-left">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-green-600 font-semibold text-right">
                                                {item.price.toFixed(2).replace(".", ",")} €
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 text-center">
                                                20%
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                                {net.toFixed(2).replace(".", ",")} €
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

            {/* Add Price Modal */}
            <AddPriceModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSave={(name, price) => {
                    const nameExists = priceList.some((item) => item.name.toLowerCase() === name.toLowerCase());
                    if (nameExists) {
                        toast.error("Ein Preis mit diesem Namen existiert bereits.");
                        return;
                    }
                    const updatedList = [...priceList, { name, price }];
                    const sortedList = sortPricesWithStandardFirst(updatedList);
                    onPriceListChange(sortedList);
                    toast.success("Preis erfolgreich hinzugefügt!");
                }}
            />
        </div>
    );
}
