import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getTaxRatesByCountry } from "@/utils/taxRates";

const VAT_OPTIONS = ["0", "7", "10", "19", "20", "22"];

interface AddPriceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (priceData: {
        name: string;
        price: number;
        basePrice: number;
        commissionPercentage: number;
        commissionAmount: number;
        netBeforeVat: number;
        vatPercentage: number;
        vatAmount: number;
    }) => void;
}

export default function AddPriceModal({ open, onOpenChange, onSave }: AddPriceModalProps) {
    const { user } = useAuth();
    const vatCountry = user?.accountInfo?.vat_country;
    
    // Get VAT rates based on country
    const taxRates = getTaxRatesByCountry(vatCountry);
    const countryWiseVatOptions = taxRates || VAT_OPTIONS.map((vat: string) => ({
        id: vat,
        name: `MwSt.`,
        rate: parseFloat(vat),
        description: '',
        isDefault: vat === "20"
    }));
    const defaultCountryVat = taxRates?.find(rate => rate.isDefault)?.rate.toString() || "20";
    
    const [name, setName] = useState("");
    const [basePrice, setBasePrice] = useState(""); // Base Service Price
    const [vatPercentageCountry, setVatPercentageCountry] = useState(defaultCountryVat); // VAT %

    // Calculate prices: Brutto (input) → Netto (Brutto - VAT)
    const calculatePrices = (brutto: string, vat: string) => {
        const bruttoValue = parseFloat(brutto) || 0;
        const vatValue = parseFloat(vat) || 0;
        
        if (bruttoValue === 0) {
            return { 
                bruttoPrice: 0,
                commissionAmount: 0,
                netBeforeVat: 0,
                vatAmount: 0,
            };
        }
        
        // Reverse calculation: Brutto is input, calculate Netto
        // Netto = Brutto / (1 + VAT/100)
        const netBeforeVat = bruttoValue / (1 + vatValue / 100);
        
        // VAT Amount = Brutto - Netto
        const vatAmount = bruttoValue - netBeforeVat;
        
        return {
            bruttoPrice: Math.round(bruttoValue * 100) / 100,
            commissionAmount: 0,
            netBeforeVat: Math.round(netBeforeVat * 100) / 100,
            vatAmount: Math.round(vatAmount * 100) / 100,
        };
    };

    const prices = calculatePrices(basePrice, vatPercentageCountry);

    // Update country-wise VAT when country changes
    useEffect(() => {
        if (defaultCountryVat) {
            setVatPercentageCountry(defaultCountryVat);
        }
    }, [defaultCountryVat]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setName("");
            setBasePrice("");
            setVatPercentageCountry(defaultCountryVat);
        }
    }, [open, defaultCountryVat]);

    const handleSave = () => {
        if (!name.trim()) {
            toast.error("Bitte geben Sie einen Namen ein.");
            return;
        }

        const price = parseFloat(basePrice);
        if (isNaN(price) || price < 0) {
            toast.error("Bitte geben Sie einen gültigen Preis ein.");
            return;
        }

        // Pass all calculated data
        const priceData = {
            name: name.trim(),
            price: prices.bruttoPrice,
            basePrice: prices.bruttoPrice,
            commissionPercentage: 0, // No commission anymore
            commissionAmount: 0, // No commission anymore
            netBeforeVat: prices.netBeforeVat,
            vatPercentage: parseFloat(vatPercentageCountry),
            vatAmount: prices.vatAmount,
        };
        
        onSave(priceData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center font-bold uppercase text-lg">
                        Fussanalyse Preis hinzufügen
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium uppercase">
                            Name *
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="z.B. Standard, Premium..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-gray-300 rounded-[5px] bg-white"
                        />
                    </div>

                    {/* Price Calculation Section */}
                    <div className="bg-gray-100 rounded-[5px] p-4 space-y-3">
                        {/* MwSt. country wise */}
                        <div>
                            <label className="block font-bold text-sm mb-2 text-black uppercase">
                                {(() => {
                                    const selectedRate = countryWiseVatOptions.find(
                                        (rate: { id: string; name: string; rate: number; description: string; isDefault?: boolean }) => rate.rate.toString() === vatPercentageCountry
                                    );
                                    return selectedRate 
                                        ? `MwSt (${selectedRate.rate}%)`
                                        : `MwSt. (${vatPercentageCountry}%)`;
                                })()}
                            </label>
                            <Select value={vatPercentageCountry} onValueChange={setVatPercentageCountry}>
                                <SelectTrigger className="w-full border-gray-300 rounded-[5px] bg-white">
                                    <SelectValue>
                                        {(() => {
                                            const selectedRate = countryWiseVatOptions.find(
                                                (rate: { id: string; name: string; rate: number; description: string; isDefault?: boolean }) => rate.rate.toString() === vatPercentageCountry
                                            );
                                            return selectedRate 
                                                ? `${selectedRate.name} (${selectedRate.rate}%)`
                                                : `${vatPercentageCountry}%`;
                                        })()}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {countryWiseVatOptions.map((rate: { id: string; name: string; rate: number; description: string; isDefault?: boolean }) => (
                                        <SelectItem key={rate.id} value={rate.rate.toString()} className="cursor-pointer">
                                            {rate.name} ({rate.rate}%)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Preis (Brutto) */}
                        <div>
                            <label className="block font-bold text-sm mb-2 text-black uppercase">
                                Preis (Brutto)
                            </label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    className="border-gray-300 rounded-[5px] bg-white flex-1"
                                    placeholder="0,00"
                                    step="0.01"
                                    min="0"
                                />
                                <span className="text-black font-medium">EUR</span>
                            </div>
                        </div>

                        {/* Netto */}
                        <div>
                            <label className="block font-bold text-sm mb-2 text-black uppercase">
                                Netto
                            </label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={`${prices.netBeforeVat.toFixed(2).replace('.', ',')} €`}
                                    readOnly
                                    className="border-gray-300 rounded-[5px] bg-gray-50 flex-1 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        {/* Brutto */}
                        <div>
                            <label className="block font-bold text-sm mb-2 text-black uppercase">
                                Brutto
                            </label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={`${prices.bruttoPrice.toFixed(2).replace('.', ',')} €`}
                                    readOnly
                                    className="border-green-300 rounded-[5px] bg-green-50 flex-1 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-gray-300 bg-white text-gray-700 cursor-pointer rounded-[5px] px-4 py-2 hover:bg-gray-50"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-[#61A175] hover:bg-[#61A175]/90 text-white cursor-pointer rounded-[5px] px-4 py-2"
                    >
                        Speichern
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

