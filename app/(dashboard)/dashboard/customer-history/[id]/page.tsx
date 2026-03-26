'use client'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSingleCustomer } from '@/hooks/customer/useSingleCustomer'
import NoteProcess from '../../_components/CustomerHistory/NoteProcess';
import Link from 'next/link';
import ShoePurchasesMade from '@/components/CustomerHistory/ShoePurchasesMade/ShoePurchasesMade';
import TreatmentsCarriedOut from '@/components/CustomerHistory/TreatmentsCarriedOut/TreatmentsCarriedOut';
import ScansPromoted from '@/components/CustomerHistory/ScansPromoted/ScansPromoted';
import Reviews from '@/components/CustomerHistory/Reviews/Reviews';
import KostenvoranschlagDialog from '@/app/(dashboard)/dashboard/_components/Receipts/KostenvoranschlagDialog'
import RechnungDialog from '@/app/(dashboard)/dashboard/_components/Receipts/RechnungDialog'
import RechnungErstellenDialog from '@/app/(dashboard)/dashboard/_components/Receipts/RechnungErstellenDialog'
import DatenschutzDialog from '@/app/(dashboard)/dashboard/_components/Receipts/DatenschutzDialog'
import GebrauchsanweisungDialog from '@/app/(dashboard)/dashboard/_components/Receipts/GebrauchsanweisungDialog'
import KonformitatDialog from '@/app/(dashboard)/dashboard/_components/Receipts/KonformitatDialog'
import MehrkostenVereinbarungDialog from '@/app/(dashboard)/dashboard/_components/Receipts/MehrkostenVereinbarungDialog'
import { Edit, X, Loader2, Trash, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import CustomerHistoryShimmer from '@/components/ShimmerEffect/Customer/CustomerHistoryShimmer';
import CustomerHeader from '../../_components/CustomerHistory/CustomerHeader';
import CustomerDetailsPage from '../../_components/CustomerHistory/CustomerDetailsPage';
import FilterButton from '../../_components/CustomerHistory/FilterButton';
import CardFilterTab from '../../_components/CustomerHistory/CardFilterTab';

export default function CustomerHistory() {
    const params = useParams();
    const router = useRouter();
    const { customer: scanData, loading, error, updateCustomer, isUpdating, deleteCustomer, isDeleting } = useSingleCustomer(String(params.id));
    const [activeTab, setActiveTab] = useState<'scans' | 'shoes' | 'versorgungen' | 'reviews'>('scans');
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        gender: '',
        geburtsdatum: '',
        vorname: '',
        nachname: '',
        email: '',
        straße: '',
        land: '',
        ort: '',
        telefon: '',
        telefonnummer: '',
        wohnort: '',
        billingType: '',
        firmenname: '',
        firmenStrasse: '',
        firmenPLZ: '',
        firmenOrt: '',
        firmenLand: '',
        firmenUID: ''
    });
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
    const [isDocumentPopoverOpen, setIsDocumentPopoverOpen] = useState(false);
    const [isKostenvoranschlagOpen, setIsKostenvoranschlagOpen] = useState(false);
    const [isRechnungErstellenOpen, setIsRechnungErstellenOpen] = useState(false);
    const [isRechnungOpen, setIsRechnungOpen] = useState(false);
    const [rechnungData, setRechnungData] = useState<any>(null);
    const [isDatenschutzOpen, setIsDatenschutzOpen] = useState(false);
    const [isGebrauchsanweisungOpen, setIsGebrauchsanweisungOpen] = useState(false);
    const [isKonformitatOpen, setIsKonformitatOpen] = useState(false);
    const [isMehrkostenOpen, setIsMehrkostenOpen] = useState(false);
    /** Kostenvoranschlag (Codex) — persists while on this customer page */
    const [codexSelectedPositions, setCodexSelectedPositions] = useState<string[]>([]);
    const [codexItemSides, setCodexItemSides] = useState<Record<string, 'L' | 'R' | 'BDS'>>({});

    // Show shimmer while the real data is loading
    if (loading) return <CustomerHistoryShimmer />;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
    if (!scanData) return <div className="p-4">Customer not found</div>;

    const isPrivatBilling = scanData.billingType === 'privat';

    const handleVersorgung = () => {

        router.push(`/dashboard/scanning-data/${params.id}`);
    }

    const normalizeGender = (value: string | undefined) => {
        const v = (value || '').toLowerCase();
        if (v === 'male' || v === 'mann') return 'MALE';
        if (v === 'female' || v === 'frau') return 'frau';
        if (v.includes('keine')) return 'keine';
        return '';
    };

    // Helper function to format date for date input
    const formatDateForInput = (dateString: string | undefined) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch {
            return '';
        }
    }

    const handleEditClick = () => {
        setEditFormData({
            gender: normalizeGender(scanData.gender),
            geburtsdatum: formatDateForInput(scanData.geburtsdatum),
            vorname: scanData.vorname || '',
            nachname: scanData.nachname || '',
            email: scanData.email || '',
            straße: scanData.straße || '',
            land: scanData.land || '',
            ort: scanData.ort || '',
            telefon: scanData.telefon || '',
            telefonnummer: scanData.telefonnummer || '',
            wohnort: scanData.wohnort || '',
            billingType: scanData.billingType || '',
            firmenname: (scanData as any).firmenname || '',
            firmenStrasse: (scanData as any).firmenStrasse || '',
            firmenPLZ: (scanData as any).firmenPLZ || '',
            firmenOrt: (scanData as any).firmenOrt || '',
            firmenLand: (scanData as any).firmenLand || '',
            firmenUID: (scanData as any).firmenUID || ''
        });
        setIsEditing(true);
    }

    const handleSaveClick = async () => {
        try {
            // Send gender directly as MALE/FEMALE to API
            const updateData: any = {
                gender: editFormData.gender,
                geburtsdatum: editFormData.geburtsdatum,
                vorname: editFormData.vorname ?? '',
                nachname: editFormData.nachname ?? '',
                email: editFormData.email ?? '',
                straße: editFormData.straße,
                land: editFormData.land,
                ort: editFormData.ort,
            };

            // Add wohnort (always include it, even if empty, to allow clearing)
            updateData.wohnort = editFormData.wohnort || '';

            // Add billingType if it's being edited
            if (editFormData.billingType) {
                updateData.billingType = editFormData.billingType;
            }

            // Use telefonnummer if original data had it or if user entered a value
            // Otherwise fall back to telefon
            const phoneValue = editFormData.telefonnummer || editFormData.telefon || '';
            if (phoneValue) {
                // If original data had telefonnummer, always use telefonnummer for updates
                if (scanData.telefonnummer) {
                    updateData.telefonnummer = phoneValue;
                } else {
                    // If original data only had telefon, use telefon for updates
                    updateData.telefon = phoneValue;
                }
            }

            // Add company billing data fields
            updateData.firmenname = editFormData.firmenname || '';
            updateData.firmenStrasse = editFormData.firmenStrasse || '';
            updateData.firmenPLZ = editFormData.firmenPLZ || '';
            updateData.firmenOrt = editFormData.firmenOrt || '';
            updateData.firmenLand = editFormData.firmenLand || '';
            updateData.firmenUID = editFormData.firmenUID || '';

            // console.log('Sending update data:', updateData);
            const success = await updateCustomer(updateData);
            if (success) {
                toast.success('Customer information updated successfully');
                setIsEditing(false);
            } else {
                toast.error('Failed to update customer information');
            }
        } catch (error) {
            toast.error('An error occurred while updating customer information');
        }
    }

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditFormData({
            gender: normalizeGender(scanData.gender),
            geburtsdatum: formatDateForInput(scanData.geburtsdatum),
            vorname: scanData.vorname || '',
            nachname: scanData.nachname || '',
            email: scanData.email || '',
            straße: scanData.straße || '',
            land: scanData.land || '',
            ort: scanData.ort || '',
            telefon: scanData.telefon || '',
            telefonnummer: scanData.telefonnummer || '',
            wohnort: scanData.wohnort || '',
            billingType: scanData.billingType || '',
            firmenname: (scanData as any).firmenname || '',
            firmenStrasse: (scanData as any).firmenStrasse || '',
            firmenPLZ: (scanData as any).firmenPLZ || '',
            firmenOrt: (scanData as any).firmenOrt || '',
            firmenLand: (scanData as any).firmenLand || '',
            firmenUID: (scanData as any).firmenUID || ''
        });
    }

    const handleInputChange = (field: string, value: string) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }

    const handleShowPopUp = () => {
        setIsPopUpOpen(true);
    }

    const handleKundenordner = () => {
        router.push(`/dashboard/kundenordner/${params.id}`);
    }

    const handleDocumentClick = (documentType: string) => {
        setSelectedDocumentType(documentType);
        setIsDocumentPopoverOpen(false);

        switch (documentType) {
            case 'Kostenvoranschlag (Codex)':
                setIsKostenvoranschlagOpen(true);
                break;
            case 'Rechnung (Firma)':
                setIsRechnungErstellenOpen(true);
                break;
            case 'Datenschutzerklärung':
                setIsDatenschutzOpen(true);
                break;
            case 'Gebrauchsanweisung':
                setIsGebrauchsanweisungOpen(true);
                break;
            case 'Konformitätserklärung':
                setIsKonformitatOpen(true);
                break;
            case 'Mehrkosten-Vereinbarung':
                setIsMehrkostenOpen(true);
                break;
            default:
                toast.error('Dokument nicht gefunden');
        }
    }

    const handleRechnungErstellen = (data: any) => {
        setRechnungData(data);
        setIsRechnungErstellenOpen(false);
        setIsRechnungOpen(true);
    }


    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true);
    }

    const handleConfirmDelete = async () => {
        if (!scanData?.id) {
            toast.error('Customer ID not found');
            return;
        }

        try {
            const success = await deleteCustomer(scanData.id);
            if (success) {
                toast.success('Customer deleted successfully');
                router.push('/dashboard/customers');
            } else {
                toast.error('Failed to delete customer');
            }
        } catch (error) {
            toast.error('An error occurred while deleting customer');
        } finally {
            setIsDeleteDialogOpen(false);
        }
    }

    return (
        <div className="p-4 space-y-6">
            <CustomerHeader
                customerData={{
                    ...scanData,
                    customerNumber: (scanData as any).customerNumber ?? scanData.id,
                }}
                isEditing={isEditing}
                isDeleting={isDeleting}
                isUpdating={isUpdating}
                onEdit={handleEditClick}
                onSave={handleSaveClick}
                onCancel={handleCancelClick}
                onDelete={handleDeleteClick}
            />

            {/* Customer details – 4 cards (Persönliche Daten, Kontaktdaten, Versicherung, Firmendaten) */}
            <CustomerDetailsPage
                data={{
                    ...scanData,
                    customerNumber: (scanData as any).customerNumber ?? scanData.id,
                    prescription: (scanData as any).prescription ?? null,
                }}
                editFormData={editFormData}
                isEditing={isEditing}
                onInputChange={handleInputChange}
                formatDateForInput={formatDateForInput}
                normalizeGender={normalizeGender}
            />


            {/* Filter / action cards – design matching Figma */}
            <FilterButton
                onVersorgung={handleVersorgung}
                onKundenordner={handleKundenordner}
                onDocumentClick={handleDocumentClick}
                isDocumentPopoverOpen={isDocumentPopoverOpen}
                onDocumentPopoverOpenChange={setIsDocumentPopoverOpen}
            />

            {/* Aktivitäten timeline */}
            <NoteProcess />





            {/* Tab navigation — new design with icon + label, green active state + underline */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <CardFilterTab
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                        if (tab === 'shoes' || tab === 'reviews') {
                            handleShowPopUp();
                        } else {
                            setActiveTab(tab);
                        }
                    }}
                />

                {/* Tab content */}
                <div>
                    {activeTab === 'scans' && <ScansPromoted customerData={scanData} />}
                    {activeTab === 'shoes' && <ShoePurchasesMade />}
                    {activeTab === 'versorgungen' && <TreatmentsCarriedOut customerId={scanData.id} />}
                    {activeTab === 'reviews' && <Reviews />}
                </div>
            </div>

            <Dialog open={isPopUpOpen} onOpenChange={setIsPopUpOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">COMING SOON</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center pt-2">
                        <Button onClick={() => setIsPopUpOpen(false)} className="cursor-pointer">OK</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-semibold">Delete Customer</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-gray-700 mb-2">
                                    Are you sure you want to delete this customer?
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {scanData?.vorname} {scanData?.nachname}
                                </p>
                                <p className="text-sm text-red-600 mt-2 font-medium">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-3 pt-2">
                        <Button
                            onClick={() => setIsDeleteDialogOpen(false)}
                            variant="outline"
                            disabled={isDeleting}
                            className="cursor-pointer min-w-[100px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer min-w-[100px]"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Receipt Dialogs */}
            <KostenvoranschlagDialog
                open={isKostenvoranschlagOpen}
                onOpenChange={setIsKostenvoranschlagOpen}
                customerId={String(params.id)}
                selectedPositionsnummer={codexSelectedPositions}
                onSelectedPositionsnummerChange={setCodexSelectedPositions}
                itemSides={codexItemSides}
                onItemSideChange={(posNum, side) =>
                    setCodexItemSides((prev) => ({ ...prev, [posNum]: side }))
                }
                onClearCodexSelection={() => {
                    setCodexSelectedPositions([])
                    setCodexItemSides({})
                }}
            />

            <RechnungErstellenDialog
                open={isRechnungErstellenOpen}
                onOpenChange={setIsRechnungErstellenOpen}
                customerData={scanData}
                onErstellen={handleRechnungErstellen}
            />

            <RechnungDialog
                open={isRechnungOpen}
                onOpenChange={setIsRechnungOpen}
                customerData={scanData}
                rechnungData={rechnungData}
            />

            <DatenschutzDialog
                open={isDatenschutzOpen}
                onOpenChange={setIsDatenschutzOpen}
                customerData={scanData}
            />

            <GebrauchsanweisungDialog
                open={isGebrauchsanweisungOpen}
                onOpenChange={setIsGebrauchsanweisungOpen}
                customerData={scanData}
            />

            <KonformitatDialog
                open={isKonformitatOpen}
                onOpenChange={setIsKonformitatOpen}
                customerData={scanData}
            />

            <MehrkostenVereinbarungDialog
                open={isMehrkostenOpen}
                onOpenChange={setIsMehrkostenOpen}
                customerData={scanData}
            />


        </div>
    )
}
