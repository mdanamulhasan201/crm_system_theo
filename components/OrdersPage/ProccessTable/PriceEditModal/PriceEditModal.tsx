'use client';

import React, { useEffect, useState } from 'react';
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
                        vatRate: d.vatRate ?? 19,
                        fussanalysePreis: d.fussanalysePreis ?? 0,
                        einlagenversorgungPreis: d.einlagenversorgungPreis ?? 0,
                        quantity: d.quantity ?? 1,
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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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

                <div className="py-4 space-y-6">
                    {loading && (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        </div>
                    )}
                    {error && (
                        <p className="text-sm text-red-600 text-center py-4">{error}</p>
                    )}
                    {!loading && !error && formData && (
                        <>
                            {/* Main price fields */}
                            <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Preisangaben
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
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
                        </>
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
