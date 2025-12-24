import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Check } from "lucide-react";
import toast from "react-hot-toast";
import { PriceItem } from "./types";

interface PriceManagementProps {
    priceList: PriceItem[];
    onPriceListChange: (prices: PriceItem[]) => void;
}

export default function PriceManagement({ priceList, onPriceListChange }: PriceManagementProps) {
    const [newPrice, setNewPrice] = useState("");
    const [newPriceName, setNewPriceName] = useState("");

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
            const updatedList = [...priceList, { name, price }].sort((a, b) => a.price - b.price);
            onPriceListChange(updatedList);
            setNewPrice("");
            setNewPriceName("");
        }
    }, [newPrice, newPriceName, priceList, onPriceListChange]);

    const removePrice = (priceToRemove: PriceItem) => {
        onPriceListChange(
            priceList.filter((item) => item.name !== priceToRemove.name || item.price !== priceToRemove.price)
        );
    };

    const clearAllPrices = () => {
        onPriceListChange([]);
        setNewPrice("");
        setNewPriceName("");
    };

    return (
        <div className="mt-12">
            <h2 className="font-bold text-lg mb-4 text-black">
                Fussanalyse Preis
            </h2>

            <div className="flex gap-3 items-center mb-4 flex-wrap">
                <Input
                    type="text"
                    placeholder="Name eingeben (z.B. High)"
                    value={newPriceName}
                    onChange={(e) => setNewPriceName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && newPrice.trim()) {
                            e.preventDefault();
                            addPriceFromInput();
                        }
                    }}
                    className="border-2 border-gray-300 rounded-lg bg-white max-w-xs h-12 px-4 text-black placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200 transition-all shadow-sm hover:border-gray-400"
                />
                <Input
                    type="number"
                    step="0.01"
                    placeholder="Preis eingeben (z.B. 122.00)"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && newPriceName.trim()) {
                            e.preventDefault();
                            addPriceFromInput();
                        }
                    }}
                    className="border-2 border-gray-300 rounded-lg bg-white max-w-xs h-12 px-4 text-black placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200 transition-all shadow-sm hover:border-gray-400"
                />
                <Button
                    onClick={addPriceFromInput}
                    disabled={!newPrice.trim() || !newPriceName.trim()}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg px-6 py-2.5 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-md whitespace-nowrap flex items-center gap-2"
                    type="button"
                >
                    <Plus className="w-4 h-4" />
                    Hinzufügen
                </Button>
            </div>

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
                        {priceList.map((item, index) => (
                            <div
                                key={`${item.name}-${item.price}-${index}`}
                                className="px-4 py-2 rounded-lg border-2 border-green-500 bg-gradient-to-r from-green-50 to-green-100 text-green-900 text-sm font-semibold flex items-center gap-2 hover:from-green-100 hover:to-green-200 transition-all shadow-sm group"
                            >
                                <span className="font-bold">{item.name}:</span>
                                <span>{item.price.toFixed(2).replace(".", ",")}€</span>
                                <button
                                    onClick={() => removePrice(item)}
                                    className="hover:bg-red-100 rounded-full p-0.5 cursor-pointer transition-colors opacity-70 group-hover:opacity-100 text-red-600 hover:text-red-700"
                                    aria-label={`${item.name} entfernen`}
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
    );
}
