import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

interface AddPriceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (name: string, price: number) => void;
}

export default function AddPriceModal({ open, onOpenChange, onSave }: AddPriceModalProps) {
    const [name, setName] = useState("");
    const [grossPrice, setGrossPrice] = useState("");
    const [taxRate, setTaxRate] = useState("20");

    // Calculate net and VAT
    const calculateValues = () => {
        const gross = parseFloat(grossPrice) || 0;
        const rate = parseFloat(taxRate) || 20;
        const net = gross / (1 + rate / 100);
        const vat = gross - net;
        return { net, vat, gross };
    };

    const { net, vat, gross } = calculateValues();

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setName("");
            setGrossPrice("");
            setTaxRate("20");
        }
    }, [open]);

    const handleSave = () => {
        if (!name.trim()) {
            toast.error("Bitte geben Sie einen Namen ein.");
            return;
        }

        const price = parseFloat(grossPrice);
        if (isNaN(price) || price < 0) {
            toast.error("Bitte geben Sie einen gültigen Preis ein.");
            return;
        }

        onSave(name.trim(), price);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Fussanalyse Preis hinzufügen
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Name *
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="z.B. Standard, Premium..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-2 border-green-500 rounded-lg focus-visible:ring-2 focus-visible:ring-green-200"
                        />
                    </div>

                    {/* Price Calculation Section */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium">MwSt.</Label>
                            <Select value={taxRate} onValueChange={setTaxRate}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="20">20%</SelectItem>
                                    <SelectItem value="19">19%</SelectItem>
                                    <SelectItem value="7">7%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Label className="text-sm font-medium min-w-[120px]">Preis (Brutto)</Label>
                                <div className="flex items-center gap-2 flex-1">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={grossPrice}
                                        onChange={(e) => setGrossPrice(e.target.value)}
                                        className="flex-1"
                                    />
                                    <span className="text-sm text-gray-600">EUR</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Label className="text-sm font-medium min-w-[120px]">Netto</Label>
                                <Input
                                    type="text"
                                    value={net.toFixed(2).replace(".", ",")}
                                    readOnly
                                    className="flex-1 bg-gray-50"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <Label className="text-sm font-medium min-w-[120px]">MwSt. ({taxRate}%)</Label>
                                <Input
                                    type="text"
                                    value={`${vat.toFixed(2).replace(".", ",")} €`}
                                    readOnly
                                    className="flex-1 bg-gray-50"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <Label className="text-sm font-medium min-w-[120px]">Brutto</Label>
                                <Input
                                    type="text"
                                    value={gross.toFixed(2).replace(".", ",")}
                                    readOnly
                                    className="flex-1 bg-gray-50 text-green-600 font-semibold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="px-6"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6"
                    >
                        Speichern
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

