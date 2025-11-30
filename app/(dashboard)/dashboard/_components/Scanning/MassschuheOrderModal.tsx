import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePriceManagement } from '@/hooks/priceManagement/usePriceManagement';
import { CalendarIcon } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { initializeDeliveryDate, getRequiredDeliveryDate } from './utils/dateUtils';

interface Customer {
    id: string;
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    telefonnummer?: string;
    wohnort?: string;
    datumAuftrag?: string;
    fertigstellungBis?: string;
    workshopNote?: {
        completionDays?: string | number;
    };
    partner?: {
        hauptstandort?: string[];
        workshopNote?: {
            completionDays?: string | number;
        };
    };
}

interface OrderFormData {
    customerId: string;
    employeeId: string;
    arztliche_diagnose: string;
    usführliche_diagnose: string;
    rezeptnummer: string;
    durchgeführt_von: string;
    note: string;
    halbprobe_geplant: boolean;
    kostenvoranschlag: boolean;
    datumAuftrag: string;
    fertigstellungBis?: string;
    filiale: string;
    paymentType: 'krankenkasse' | 'privat';
    fußanalyse?: number;
    einlagenversorgung?: number;
    orderNote?: string;
    location?: string;
    // Additional fields for API
    delivery_date?: string;
    telefon?: string;
    kunde?: string;
    email?: string;
    button_text?: string;
    customer_note?: string;
}

interface MassschuheOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer?: Customer;
    formData: {
        arztlicheDiagnose: string;
        ausführlicheDiagnose: string;
        rezeptnummer: string;
        versorgungNote: string;
        halbprobeGeplant: boolean | null;
        kostenvoranschlag: boolean | null;
        selectedEmployee: string;
        selectedEmployeeId: string;
    };
    onSubmit: (orderData: OrderFormData) => Promise<void>;
    isLoading?: boolean;
}

export default function MassschuheOrderModal({
    isOpen,
    onClose,
    customer,
    formData,
    onSubmit,
    isLoading = false
}: MassschuheOrderModalProps) {
    const { prices, loading: pricesLoading, fetchPrices } = usePriceManagement();

    // Order modal form state
    const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [fertigstellungDate, setFertigstellungDate] = useState<string>('');
    const [filiale, setFiliale] = useState<string>('');
    const [paymentType, setPaymentType] = useState<'krankenkasse' | 'privat' | null>(null);
    const [selectedFußanalyse, setSelectedFußanalyse] = useState<string>('');
    const [selectedEinlagenversorgung, setSelectedEinlagenversorgung] = useState<string>('');
    const [orderNote, setOrderNote] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');

    const { user } = useAuth();


    const completionDays =
        (customer as any)?.workshopNote?.completionDays ??
        (customer as any)?.partner?.workshopNote?.completionDays;

    // Fetch prices on mount
    useEffect(() => {
        if (isOpen) {
            fetchPrices();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Set default location from customer wohnort
    useEffect(() => {
        if (customer && !filiale && isOpen) {
            if (customer?.wohnort) {
                setFiliale(customer.wohnort);
            } else {
                const hauptstandort = customer?.partner?.hauptstandort;
                if (hauptstandort && Array.isArray(hauptstandort) && hauptstandort.length > 0) {
                    setFiliale(hauptstandort[0]);
                }
            }
        }
    }, [customer, filiale, isOpen]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().slice(0, 10);
            const initialOrder = customer?.datumAuftrag || today;
            setOrderDate(initialOrder);

            const deliveryFromApi = customer ? initializeDeliveryDate(customer as any) : '';
            const fallbackDelivery = initialOrder ? getRequiredDeliveryDate(initialOrder, completionDays) : today;
            setFertigstellungDate(deliveryFromApi || fallbackDelivery);

            setPaymentType(null);
            setSelectedFußanalyse('');
            setSelectedEinlagenversorgung('');
            setOrderNote('');
            setSelectedLocation('');
            if (user?.hauptstandort && user.hauptstandort.length > 0) {
                setSelectedLocation(user.hauptstandort[0] || '');
            }
        }
    }, [isOpen, user?.hauptstandort, customer, completionDays]);

    const handleOrderDateChange = (value: string) => {
        setOrderDate(value);
        if (value) {
            const nextDelivery = getRequiredDeliveryDate(value, completionDays);
            setFertigstellungDate(nextDelivery);
        } else {
            setFertigstellungDate('');
        }
    };

    const handleFertigstellungDateChange = (value: string) => {
        if (value && orderDate) {
            const requiredDate = getRequiredDeliveryDate(orderDate, completionDays);
            if (new Date(value) < new Date(requiredDate)) {
                const daysText = completionDays ? `${completionDays} Tage` : '5 Tage';
                toast.error(`Fertigstellung muss mindestens ${daysText} nach Auftragsdatum sein. Minimum: ${requiredDate}`);
                setFertigstellungDate(requiredDate);
                return;
            }
        }
        setFertigstellungDate(value);
    };

    const deliveryMinDate = orderDate ? getRequiredDeliveryDate(orderDate, completionDays) : undefined;

    const handleSubmit = async () => {
        if (!customer?.id) {
            toast.error('Kunde-ID fehlt');
            return;
        }

        if (!paymentType) {
            toast.error('Bitte wählen Sie eine Zahlungsart aus (Krankenkasse oder Privat)');
            return;
        }

        if (paymentType === 'privat') {
            if (!selectedFußanalyse && !selectedEinlagenversorgung) {
                toast.error('Bitte wählen Sie beide Preise aus (Fußanalyse und Einlagenversorgung)');
                return;
            }
            if (!selectedFußanalyse) {
                toast.error('Bitte wählen Sie einen Preis für Fußanalyse aus');
                return;
            }
            if (!selectedEinlagenversorgung) {
                toast.error('Bitte wählen Sie einen Preis für Einlagenversorgung aus');
                return;
            }
        }

        // Prepare data for API
        const customerName = `${customer.vorname || ''} ${customer.nachname || ''}`.trim();
        const customerPhone = customer.telefonnummer || customer.telefon || '';
        const customerEmail = customer.email || '';

        const orderData: OrderFormData = {
            customerId: customer.id,
            employeeId: formData.selectedEmployeeId,
            arztliche_diagnose: formData.arztlicheDiagnose,
            usführliche_diagnose: formData.ausführlicheDiagnose,
            rezeptnummer: formData.rezeptnummer,
            durchgeführt_von: formData.selectedEmployee,
            note: formData.versorgungNote,
            halbprobe_geplant: formData.halbprobeGeplant === true,
            kostenvoranschlag: formData.kostenvoranschlag === true,
            datumAuftrag: orderDate,
            fertigstellungBis: fertigstellungDate || undefined,
            filiale: filiale,
            paymentType: paymentType,
            fußanalyse: paymentType === 'privat' ? parseFloat(selectedFußanalyse) : undefined,
            einlagenversorgung: paymentType === 'privat' ? parseFloat(selectedEinlagenversorgung) : undefined,
            orderNote: orderNote,
            location: selectedLocation || undefined,
            // Additional fields
            delivery_date: fertigstellungDate || undefined,
            telefon: customerPhone,
            kunde: customerName,
            email: customerEmail,
            button_text: 'Bestellung speichern',
            customer_note: orderNote,
        };

        await onSubmit(orderData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Neuer Auftrag erstellen</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* AUFTRAGSÜBERSICHT Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 uppercase mb-4">AUFTRAGSÜBERSICHT</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Kunde</label>
                                <p className="text-gray-900 font-medium">{customer?.vorname || ''} {customer?.nachname || ''}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">E-Mail</label>
                                <p className="text-gray-900">{customer?.email || '-'}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Telefon</label>
                                <p className="text-gray-900">{customer?.telefonnummer || customer?.telefon || '-'}</p>
                            </div>





                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Datum des Auftrags</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="date"
                                        className="pl-9"
                                        value={orderDate}
                                        onChange={(e) => handleOrderDateChange(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Wohnort</label>
                                <Input
                                    value={filiale}
                                    onChange={(e) => setFiliale(e.target.value)}
                                    placeholder="Filiale eingeben"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Fertigstellung</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="date"
                                        className="pl-9"
                                        value={fertigstellungDate}
                                        onChange={(e) => handleFertigstellungDateChange(e.target.value)}
                                        min={deliveryMinDate}
                                    />
                                </div>
                            </div>

                            {!!user?.hauptstandort?.length && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">Standort auswählen</label>
                                    <Select
                                        value={selectedLocation}
                                        onValueChange={(value) => setSelectedLocation(value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Standort wählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {user.hauptstandort.map((location) => (
                                                <SelectItem key={location} value={location}>
                                                    {location}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Durchgeführt von</label>
                                <p className="text-gray-900 font-medium">
                                    {formData.selectedEmployee || 'Nicht ausgewählt'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Type Selection */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 uppercase mb-4">ZAHLUNGSART</h3>
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant={paymentType === 'krankenkasse' ? 'default' : 'outline'}
                                onClick={() => {
                                    setPaymentType('krankenkasse');
                                    setSelectedFußanalyse('');
                                    setSelectedEinlagenversorgung('');
                                }}
                                className={cn(
                                    "flex-1",
                                    paymentType === 'krankenkasse' && "bg-[#62A07C] hover:bg-[#4A8A5F] text-white"
                                )}
                            >
                                Krankenkasse
                            </Button>
                            <Button
                                type="button"
                                variant={paymentType === 'privat' ? 'default' : 'outline'}
                                onClick={() => setPaymentType('privat')}
                                className={cn(
                                    "flex-1",
                                    paymentType === 'privat' && "bg-[#62A07C] hover:bg-[#4A8A5F] text-white"
                                )}
                            >
                                Privat
                            </Button>
                        </div>
                    </div>

                    {/* PREISAUSWAHL Section - Only show when Privat is selected */}
                    {paymentType === 'privat' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 uppercase mb-4">PREISAUSWAHL</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-2 block">Fußanalyse</label>
                                    <Select value={selectedFußanalyse} onValueChange={setSelectedFußanalyse}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={pricesLoading ? "Lade Preise..." : "Auswählen"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {prices.map((price) => (
                                                <SelectItem key={`foot-${price.id}`} value={String(price.fußanalyse)}>
                                                    Basis Analyse - €{price.fußanalyse}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-2 block">Einlagenversorgung</label>
                                    <Select value={selectedEinlagenversorgung} onValueChange={setSelectedEinlagenversorgung}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={pricesLoading ? "Lade Preise..." : "Auswählen"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {prices.map((price) => (
                                                <SelectItem key={`insole-${price.id}`} value={String(price.einlagenversorgung)}>
                                                    Standard Einlagen - €{price.einlagenversorgung}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* KONTROLLE & AKTIONEN Section */}
                    {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 uppercase mb-4">KONTROLLE & AKTIONEN</h3>

                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Notiz</label>
                            <Textarea
                                id="order-note"
                                value={orderNote}
                                onChange={(e) => setOrderNote(e.target.value)}
                                placeholder="Notiz hinzufügen..."
                                className="w-full min-h-[100px]"
                                rows={4}
                            />
                        </div>
                    </div> */}
                </div>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 bg-[#62A07C] hover:bg-[#4A8A5F] text-white"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Wird gespeichert...
                            </>
                        ) : (
                            'Weiter'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

