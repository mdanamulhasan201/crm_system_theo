'use client'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSingleCustomer } from '@/hooks/customer/useSingleCustomer'
import NoteAdd from '@/components/CustomerHistory/NoteAdd/NoteAdd';
import Link from 'next/link';
import Image from 'next/image';
// import emailImg from '@/public/CustomerHistory/email.png';
import folderImg from '@/public/CustomerHistory/folder.png';
// import LegImg from '@/public/CustomerHistory/leg.png';
import ShoePurchasesMade from '@/components/CustomerHistory/ShoePurchasesMade/ShoePurchasesMade';
import TreatmentsCarriedOut from '@/components/CustomerHistory/TreatmentsCarriedOut/TreatmentsCarriedOut';
import ScansPromoted from '@/components/CustomerHistory/ScansPromoted/ScansPromoted';
import Reviews from '@/components/CustomerHistory/Reviews/Reviews';
import userload from '@/public/images/scanning/userload.png'
import scanImg from '@/public/images/history/scan.png'
import KostenvoranschlagDialog from '@/app/(dashboard)/dashboard/_components/Receipts/KostenvoranschlagDialog'
import RechnungDialog from '@/app/(dashboard)/dashboard/_components/Receipts/RechnungDialog'
import RechnungErstellenDialog from '@/app/(dashboard)/dashboard/_components/Receipts/RechnungErstellenDialog'
import DatenschutzDialog from '@/app/(dashboard)/dashboard/_components/Receipts/DatenschutzDialog'
import GebrauchsanweisungDialog from '@/app/(dashboard)/dashboard/_components/Receipts/GebrauchsanweisungDialog'
import KonformitatDialog from '@/app/(dashboard)/dashboard/_components/Receipts/KonformitatDialog'
import MehrkostenVereinbarungDialog from '@/app/(dashboard)/dashboard/_components/Receipts/MehrkostenVereinbarungDialog'
import { Edit, X, Loader2, Trash, AlertTriangle, ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import CustomerHistoryShimmer from '@/components/ShimmerEffect/Customer/CustomerHistoryShimmer';
import CustomerHeader from '../../_components/CustomerHistory/CustomerHeader';
import CustomerDetailsPage from '../../_components/CustomerHistory/CustomerDetailsPage';

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
                }}
                editFormData={editFormData}
                isEditing={isEditing}
                onInputChange={handleInputChange}
                formatDateForInput={formatDateForInput}
                normalizeGender={normalizeGender}
            />

            <div className="flex  items-center gap-10 my-10 flex-wrap">
                {/* Versorgung starten */}
                <div className="flex flex-col items-center">
                    <button
                        onClick={handleVersorgung}
                        className="p-2 flex items-center justify-center rounded-2xl border border-black bg-white hover:bg-gray-100 transition cursor-pointer"
                    >
                        <Image src={userload} alt="Versorgung starten" width={70} height={70} />
                    </button>
                    <span className="mt-2 text-center text-sm font-normal">Scans & Versorgung</span>
                    {/* <span className="text-center text-sm font-normal"> Versorgung starten</span> */}
                </div>
                {/* Kundendaten -historie */}
                <div className="flex flex-col items-center">
                    <button
                        className="p-2 flex items-center justify-center rounded-2xl border border-black bg-white hover:bg-gray-100 transition cursor-pointer"
                    >
                        <Image src={scanImg} alt="Versorgung starten" width={60} height={60} />
                    </button>
                    <span className="mt-2 text-center text-sm font-normal">Scan durchführen</span>
                </div>

                {/* <div className="flex flex-col items-center">
                        <Link href="/dashboard/email" className="p-3 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full  relative transition-all duration-300">
                            <Image src={emailImg} alt="Kundenordner" width={50} height={50} className='w-11 h-auto' />

                        </Link>
                        <span className="text-sm">Schuh reservieren</span>
                    </div> */}
                <div className="flex flex-col items-center">

                    <button
                        onClick={handleKundenordner}
                        className="p-2 flex items-center justify-center rounded-2xl border border-black bg-white hover:bg-gray-100 transition cursor-pointer"
                    >
                        <Image src={folderImg} alt="Kundenordner" width={60} height={60} />
                    </button>
                    <span className="mt-2 text-center text-sm font-normal">Kundenordner</span>
                </div>

                {/* Zettel anschaffen Dropdown */}
                <div className="flex flex-col items-center">
                    <Popover open={isDocumentPopoverOpen} onOpenChange={setIsDocumentPopoverOpen}>
                        <PopoverTrigger asChild>
                            <button
                                className="p-2 flex items-center justify-center rounded-2xl bg-[#FF7B3D] hover:bg-[#FF6A28] transition cursor-pointer shadow-md"
                            >
                                <div className="w-[60px] h-[60px] flex items-center justify-center">
                                    <FileText className="w-9 h-9 text-white" strokeWidth={2} />
                                </div>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0 bg-white shadow-lg" align="start">
                            <div className="flex flex-col">
                                <button
                                    onClick={() => handleDocumentClick('Kostenvoranschlag (Codex)')}
                                    className="px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Kostenvoranschlag (Codex)
                                </button>
                                <button
                                    onClick={() => handleDocumentClick('Rechnung (Firma)')}
                                    className="px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Rechnung (Firma)
                                </button>
                                <button
                                    onClick={() => handleDocumentClick('Datenschutzerklärung')}
                                    className="px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Datenschutzerklärung
                                </button>
                                <button
                                    onClick={() => handleDocumentClick('Gebrauchsanweisung')}
                                    className="px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Gebrauchsanweisung
                                </button>
                                <button
                                    onClick={() => handleDocumentClick('Konformitätserklärung')}
                                    className="px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Konformitätserklärung
                                </button>
                                <button
                                    onClick={() => handleDocumentClick('Mehrkosten-Vereinbarung')}
                                    className="px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Mehrkosten-Vereinbarung
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <span className="mt-2 text-center text-sm font-normal">Zettel anschaffen</span>
                </div>


                {/* <div className="flex flex-col items-center">

                    <button
                        className="p-2 flex items-center justify-center rounded-2xl border border-black bg-white hover:bg-gray-100 transition cursor-pointer"
                    >
                        <Image src={LegImg} alt="Einlagenherstellung" width={60} height={60} />
                    </button>
                    <span className="mt-2 text-center text-sm font-normal">Einlagenherstellung</span>
                </div> */}
            </div>


            {/* note Table */}
            <NoteAdd />


            {/* Responsive Button Group */}
            <div className="-mx-4">
                <div className="overflow-x-auto flex-nowrap py-6 px-4 w-full min-w-0 scrollbar-hide">
                    <div className="flex gap-4 min-w-max mx-auto md:justify-center">
                        <button
                            className={`min-w-[220px] cursor-pointer px-6 py-2 border border-black font-semibold text-center text-sm md:text-base rounded transition-all shadow-sm ${activeTab === 'scans' ? 'bg-white' : 'bg-gray-200'}`}
                            onClick={() => setActiveTab('scans')}
                        >
                            DURCHGEFÜHRTE SCANS
                        </button>
                        <button
                            className={`min-w-[220px] cursor-pointer px-6 py-2 border border-black font-semibold text-center text-sm md:text-base rounded transition-all ${activeTab === 'shoes' ? 'bg-white' : 'bg-gray-200'}`}
                            // onClick={() => setActiveTab('shoes')}
                            onClick={handleShowPopUp}
                        >
                            DURCHGEFÜHRTE SCHUHKÄUFE
                        </button>
                        <button
                            className={`min-w-[220px] cursor-pointer px-6 py-2 border border-black font-semibold text-center text-sm md:text-base rounded transition-all ${activeTab === 'versorgungen' ? 'bg-white' : 'bg-gray-200'}`}
                            onClick={() => setActiveTab('versorgungen')}
                        >
                            DURCHGEFÜHRTE VERSORGUNGEN
                        </button>
                        <button
                            className={`min-w-[220px] cursor-pointer px-6 py-2 border border-black font-semibold text-center text-sm md:text-base rounded transition-all ${activeTab === 'reviews' ? 'bg-white' : 'bg-gray-200'}`}
                            // onClick={() => setActiveTab('reviews')}
                            onClick={handleShowPopUp}
                        >
                            BEWERTUNGEN
                        </button>
                        <div className="min-w-[16px]" />
                    </div>
                </div>
            </div>

            {/* Tab content */}
            <div>
                {activeTab === 'scans' && <ScansPromoted customerData={scanData} />}
                {activeTab === 'shoes' && <ShoePurchasesMade />}
                {activeTab === 'versorgungen' && <TreatmentsCarriedOut customerId={scanData.id} />}
                {activeTab === 'reviews' && <Reviews />}
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
                customerData={scanData}
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
