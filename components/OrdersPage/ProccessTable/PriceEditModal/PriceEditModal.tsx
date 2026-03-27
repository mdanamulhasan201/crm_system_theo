'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPriseDetails, updateOrder } from '@/apis/productsOrder';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface InsurancePosition {
    id?: string;
    price: number;
    description: string;
    vat_country?: string | null;
}

interface PriceEditFormData {
    discount: number;
    addonPrices: number;
    insuranceTotalPrice: number;
    privatePrice: number;
    vatRate: number;
    fussanalysePreis: number;
    einlagenversorgungPreis: number;
    quantity: number;
    austria_price: number;
    totalPrice: number;
    customerOrderInsurances: InsurancePosition[];
}

interface PriceEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    customerName?: string;
    orderNumber?: string;
    onUpdated?: () => void;
}

export default function PriceEditModal({
    isOpen,
    onClose,
    orderId,
    customerName = '',
    orderNumber = '',
    onUpdated,
}: PriceEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<PriceEditFormData | null>(null);

    useEffect(() => {
        if (!isOpen || !orderId) {
            setFormData(null);
            setError(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        getPriseDetails(orderId)
            .then((res: any) => {
                if (cancelled) return;
                if (res?.success && res?.data) {
                    const d = res.data;
                    setFormData({
                        discount: d.discount ?? 0,
                        addonPrices: d.addonPrices ?? 0,
                        insuranceTotalPrice: d.insuranceTotalPrice ?? 0,
                        privatePrice: d.privatePrice ?? 0,
                        vatRate: d.vatRate ?? 0,
                        fussanalysePreis: d.fussanalysePreis ?? 0,
                        einlagenversorgungPreis: d.einlagenversorgungPreis ?? 0,
                        quantity: d.quantity ?? 0,
                        austria_price: d.austria_price ?? 0,
                        totalPrice: d.totalPrice ?? 0,
                        customerOrderInsurances: (d.customerOrderInsurances ?? []).map((pos: any) => ({
                            id: pos.id,
                            price: pos.price ?? 0,
                            description: typeof pos.description === 'string' ? pos.description : '',
                            vat_country: pos.vat_country ?? null,
                        })),
                    });
                } else {
                    setError('Keine Daten erhalten');
                }
            })
            .catch((err: any) => {
                if (cancelled) return;
                setError(err?.message || 'Fehler beim Laden der Preisdetails');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [isOpen, orderId]);

    const updateField = <K extends keyof PriceEditFormData>(key: K, value: PriceEditFormData[K]) => {
        setFormData(prev => (prev ? { ...prev, [key]: value } : prev));
    };

    const updateInsurance = (index: number, field: keyof InsurancePosition, value: string | number | null) => {
        setFormData(prev => {
            if (!prev) return prev;
            const updated = [...prev.customerOrderInsurances];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, customerOrderInsurances: updated };
        });
    };

    const addInsurance = () => {
        setFormData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                customerOrderInsurances: [
                    ...prev.customerOrderInsurances,
                    { price: 0, description: '' },
                ],
            };
        });
    };

    const removeInsurance = (index: number) => {
        setFormData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                customerOrderInsurances: prev.customerOrderInsurances.filter((_, i) => i !== index),
            };
        });
    };

    const priceOverview = useMemo(() => {
        if (!formData) return null;
        const quantityNum = Math.max(1, Number(formData.quantity) || 1);
        const versorgungPrice = Number(formData.einlagenversorgungPreis) || 0;
        const footPrice = Number(formData.fussanalysePreis) || 0;
        const addonPricesTotal = Number(formData.addonPrices) || 0;
        const discountEuro = Number(formData.discount) || 0;
        const eigenanteil = Number(formData.austria_price) || 0;
        const vatRate = Number(formData.vatRate) || 0;

        const netFromLines = formData.customerOrderInsurances.reduce(
            (s, p) => s + (Number(p.price) || 0),
            0
        );

        let positionsNet: number;
        let positionsVatAmount: number;
        let positionsGross: number;

        if (formData.customerOrderInsurances.length > 0 && netFromLines > 0) {
            positionsNet = netFromLines;
            positionsVatAmount = vatRate > 0 ? (positionsNet * vatRate) / 100 : 0;
            positionsGross = positionsNet + positionsVatAmount;
        } else {
            positionsGross = Number(formData.insuranceTotalPrice) || 0;
            positionsNet = vatRate > 0 ? positionsGross / (1 + vatRate / 100) : positionsGross;
            positionsVatAmount = Math.max(0, positionsGross - positionsNet);
        }

        const zwischensumme =
            versorgungPrice * quantityNum + footPrice + addonPricesTotal + positionsGross;
        const total = zwischensumme - discountEuro + eigenanteil;

        const privateTotal = eigenanteil + footPrice + addonPricesTotal;
        const insuranceTotal = Math.max(0, total - privateTotal);
        const showInsuranceSplit = eigenanteil > 0 && positionsGross > 0;

        return {
            quantityNum,
            versorgungPrice,
            footPrice,
            addonPricesTotal,
            discountEuro,
            eigenanteil,
            vatRate,
            positionsNet,
            positionsVatAmount,
            positionsGross,
            zwischensumme,
            total,
            privateTotal,
            insuranceTotal,
            showInsuranceSplit,
        };
    }, [formData]);

    const formatPrice = (n: number) =>
        (Number.isFinite(n) ? n : 0).toFixed(2).replace('.', ',') + '€';

    const handleSave = async () => {
        if (!orderId || !formData) return;
        setSaving(true);
        try {
            const payload: Record<string, any> = {
                insurances: formData.customerOrderInsurances.map(pos => ({
                    ...(pos.id ? { id: pos.id } : {}),
                    price: Number(pos.price),
                    description: pos.description,
                    ...(pos.vat_country != null ? { vat_country: pos.vat_country } : {}),
                })),
                fussanalysePreis: Number(formData.fussanalysePreis),
                einlagenversorgungPreis: Number(formData.einlagenversorgungPreis),
                discount: Number(formData.discount),
                quantity: Number(formData.quantity),
                addonPrices: Number(formData.addonPrices),
                totalPrice: Number(formData.totalPrice),
                privatePrice: Number(formData.privatePrice),
                insuranceTotalPrice: Number(formData.insuranceTotalPrice),
                vat_rate: Number(formData.vatRate),
                austria_price: Number(formData.austria_price),
            };
            const res = await updateOrder(orderId, payload);
            if (res?.success !== false) {
                toast.success('Preise erfolgreich aktualisiert');
                onUpdated?.();
                onClose();
            } else {
                toast.error(res?.message || 'Fehler beim Speichern');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Fehler beim Speichern der Preise');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[min(100vw-1.5rem,1200px)] max-w-6xl sm:max-w-6xl max-h-[92vh] overflow-y-auto overflow-x-hidden p-6">
                <DialogHeader className="pb-4 border-b border-gray-100">
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Preisdetails bearbeiten
                    </DialogTitle>
                    {(customerName || orderNumber) && (
                        <p className="text-sm text-gray-500 mt-1">
                            {customerName}{orderNumber ? ` · #${orderNumber}` : ''}
                        </p>
                    )}
                </DialogHeader>

                <div className="py-4">
                    {loading && (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        </div>
                    )}
                    {error && (
                        <p className="text-sm text-red-600 text-center py-4">{error}</p>
                    )}
                    {!loading && !error && formData && priceOverview && (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
                            <div className="xl:col-span-7 space-y-6 min-w-0">
                            {/* Main price fields */}
                            <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Preisangaben
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-gray-600">Einlagenversorgung (€)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.einlagenversorgungPreis}
                                            onChange={e => updateField('einlagenversorgungPreis', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-gray-600">Fußanalyse (€)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.fussanalysePreis}
                                            onChange={e => updateField('fussanalysePreis', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-gray-600">Menge</Label>
                                        <Input
                                            type="number"
                                            step="1"
                                            min="1"
                                            value={formData.quantity}
                                            onChange={e => updateField('quantity', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-gray-600">Aufpreis (€)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.addonPrices}
                                            onChange={e => updateField('addonPrices', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-gray-600">Rabatt (€)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.discount}
                                            onChange={e => updateField('discount', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-gray-600">MwSt. Rate (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.vatRate}
                                            onChange={e => updateField('vatRate', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-gray-600">Eigenanteil AT (€)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.austria_price}
                                            onChange={e => updateField('austria_price', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-gray-600">Gesamtpreis (€)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.totalPrice}
                                            onChange={e => updateField('totalPrice', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-gray-600">Privatanteil (€)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.privatePrice}
                                            onChange={e => updateField('privatePrice', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-gray-600">Versicherungsanteil (€)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.insuranceTotalPrice}
                                            onChange={e => updateField('insuranceTotalPrice', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Insurance positions */}
                            <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Versicherungspositionen
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addInsurance}
                                        className="gap-1.5 h-7 text-xs cursor-pointer"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Position hinzufügen
                                    </Button>
                                </div>
                                {formData.customerOrderInsurances.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        Keine Positionen vorhanden
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.customerOrderInsurances.map((pos, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-end gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                                            >
                                                <div className="flex-1 space-y-1.5">
                                                    <Label className="text-xs text-gray-600">Beschreibung</Label>
                                                    <Input
                                                        type="text"
                                                        value={pos.description}
                                                        onChange={e => updateInsurance(idx, 'description', e.target.value)}
                                                        placeholder="Position Beschreibung"
                                                    />
                                                </div>
                                                <div className="w-28 space-y-1.5">
                                                    <Label className="text-xs text-gray-600">Preis (€)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={pos.price}
                                                        onChange={e => updateInsurance(idx, 'price', Number(e.target.value))}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                                                    onClick={() => removeInsurance(idx)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            </div>

                            {/* Preisübersicht – gleiche Logik/Optik wie Werkstattzettel PriceSection */}
                            <div className="xl:col-span-5 w-full min-w-0 xl:sticky xl:top-2">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5 space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                        Preisübersicht
                                    </h4>
                                    <div className="space-y-3 min-w-0">
                                        {priceOverview.positionsGross > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center gap-2">
                                                    <span className="text-sm text-gray-600 truncate">
                                                        Positionsnummer netto
                                                    </span>
                                                    <span className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">
                                                        {formatPrice(priceOverview.positionsNet)}
                                                    </span>
                                                </div>
                                                {priceOverview.vatRate > 0 && (
                                                    <div className="flex justify-between items-center gap-2">
                                                        <span className="text-sm text-gray-600 truncate">
                                                            + {priceOverview.vatRate}% MwSt.
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">
                                                            {formatPrice(priceOverview.positionsVatAmount)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center gap-2">
                                                    <span className="text-sm text-gray-600 truncate">
                                                        Positionsnummer (inkl. MwSt.)
                                                    </span>
                                                    <span className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">
                                                        {formatPrice(priceOverview.positionsGross)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-sm text-gray-600 truncate">Versorgung</span>
                                            <span className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">
                                                {formatPrice(priceOverview.versorgungPrice * priceOverview.quantityNum)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-sm text-gray-600 truncate">Menge</span>
                                            <span className="text-sm font-semibold text-gray-900 shrink-0">
                                                × {priceOverview.quantityNum}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-sm text-gray-600 truncate">Fußanalyse</span>
                                            <span className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">
                                                {formatPrice(priceOverview.footPrice)}
                                            </span>
                                        </div>

                                        {priceOverview.eigenanteil > 0 && (
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-sm text-gray-600 truncate">
                                                    Enthält Eigenanteil (AT)
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">
                                                    {formatPrice(priceOverview.eigenanteil)}
                                                </span>
                                            </div>
                                        )}

                                        {priceOverview.addonPricesTotal > 0 && (
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-sm text-gray-600 truncate">
                                                    Wirtschaftlicher Aufpreis
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">
                                                    {formatPrice(priceOverview.addonPricesTotal)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center gap-2 pt-3 border-t border-gray-300">
                                            <span className="text-sm text-gray-600 truncate">Zwischensumme</span>
                                            <span className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">
                                                {formatPrice(priceOverview.zwischensumme)}
                                            </span>
                                        </div>

                                        {priceOverview.discountEuro > 0 && (
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-sm text-gray-600 truncate">Rabatt</span>
                                                <span className="text-sm font-semibold text-red-600 shrink-0 tabular-nums">
                                                    -{formatPrice(priceOverview.discountEuro)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center gap-2 pt-3 border-t-2 border-gray-400">
                                            <span className="text-base font-bold text-gray-900">Gesamt</span>
                                            <span className="text-lg sm:text-xl font-bold text-green-600 shrink-0 tabular-nums">
                                                {formatPrice(priceOverview.total)}
                                            </span>
                                        </div>

                                        {priceOverview.showInsuranceSplit && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                                    <span className="inline-flex items-center gap-1.5 text-xs">
                                                        <span className="text-amber-600 font-medium">Privat</span>
                                                        <span className="text-amber-700 font-semibold tabular-nums">
                                                            {formatPrice(priceOverview.privateTotal)}
                                                        </span>
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 text-xs">
                                                        <span className="text-emerald-600 font-medium">
                                                            Versicherung
                                                        </span>
                                                        <span className="text-emerald-700 font-semibold tabular-nums">
                                                            {formatPrice(priceOverview.insuranceTotal)}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={saving}
                        className="cursor-pointer"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || loading || !formData}
                        className="cursor-pointer gap-2"
                    >
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {saving ? 'Speichern...' : 'Speichern'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
