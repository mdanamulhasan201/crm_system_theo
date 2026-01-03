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
import AdvancedFeaturesModal from '@/app/(dashboard)/dashboard/_components/Customers/AdvancedFeaturesModal'
import { Edit, X, Loader2, Trash, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import CustomerHistoryShimmer from '@/components/ShimmerEffect/Customer/CustomerHistoryShimmer';

export default function CustomerHistory() {
    const params = useParams();
    const router = useRouter();
    const { customer: scanData, loading, error, updateCustomer, isUpdating, deleteCustomer, isDeleting } = useSingleCustomer(String(params.id));
    const [activeTab, setActiveTab] = useState<'scans' | 'shoes' | 'versorgungen' | 'reviews'>('scans');
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        gender: '',
        geburtsdatum: '',
        straße: '',
        land: '',
        ort: '',
        telefon: '',
        telefonnummer: '',
        wohnort: '',
        billingType: ''
    });
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
            straße: scanData.straße || '',
            land: scanData.land || '',
            ort: scanData.ort || '',
            telefon: scanData.telefon || '',
            telefonnummer: scanData.telefonnummer || '',
            wohnort: scanData.wohnort || '',
            billingType: scanData.billingType || ''
        });
        setIsEditing(true);
    }

    const handleSaveClick = async () => {
        try {
            // Send gender directly as MALE/FEMALE to API
            const updateData: any = {
                gender: editFormData.gender,
                geburtsdatum: editFormData.geburtsdatum,
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
            straße: scanData.straße || '',
            land: scanData.land || '',
            ort: scanData.ort || '',
            telefon: scanData.telefon || '',
            telefonnummer: scanData.telefonnummer || '',
            wohnort: scanData.wohnort || '',
            billingType: scanData.billingType || ''
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
         

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{scanData.vorname} {scanData.nachname}</h1>
                <div className="flex gap-2">
                    {/* delete button */}
                    <div>
                        <Button
                            onClick={handleDeleteClick}
                            variant="outline"
                            disabled={isDeleting}
                            className="flex items-center  gap-2 cursor-pointer hover:bg-red-50 hover:border-red-300"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Löschen...
                                </>
                            ) : (
                                <>
                                    <Trash className="w-4 h-4" />
                                    Löschen
                                </>
                            )}
                        </Button>
                    </div>

                    {/* edit and save buttons */}
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <Button
                                onClick={handleEditClick}
                                variant="outline"
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Edit className="w-4 h-4" />
                                Bearbeiten
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={handleCancelClick}
                                    variant="outline"
                                    disabled={isUpdating}
                                    className="cursor-pointer"
                                >
                                    Abbrechen
                                </Button>
                                <Button
                                    onClick={handleSaveClick}
                                    disabled={isUpdating}
                                    className="bg-[#61A07B] hover:bg-[#528c68] text-white cursor-pointer"
                                >
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isUpdating ? 'Speichern...' : 'Speichern'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>


            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button className="bg-[#62A07C] text-white px-6 py-2 rounded border border-black">
                    Stammdaten
                </button>

                {/* Erweitert Button with Modal */}
                <AdvancedFeaturesModal
                    scanData={scanData}
                    trigger={
                        <button className="bg-gray-300 cursor-pointer text-black px-6 py-2 rounded hover:bg-gray-400 transition">
                            Erweitert
                        </button>
                    }
                />
            </div>

            {/* Basic Customer Info*/}
            <div className="space-y-6 mb-6">
                {/* Gender Selection */}
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 border px-4 py-2 rounded-md bg-gray-50">
                        <input
                            type="radio"
                            name="gender"
                            checked={isEditing ? editFormData.gender === 'MALE' : normalizeGender(scanData.gender) === 'MALE'}
                            onChange={isEditing ? () => handleInputChange('gender', 'MALE') : undefined}
                            disabled={!isEditing}
                            className="cursor-pointer"
                        />
                        <span className="text-sm font-medium">Men</span>
                    </label>
                    <label className="flex items-center gap-2 border px-4 py-2 rounded-md bg-gray-50">
                        <input
                            type="radio"
                            name="gender"
                            checked={isEditing ? editFormData.gender === 'frau' : normalizeGender(scanData.gender) === 'frau'}
                            onChange={isEditing ? () => handleInputChange('gender', 'frau') : undefined}
                            disabled={!isEditing}
                            className="cursor-pointer"
                        />
                        <span className="text-sm font-medium">Women</span>
                    </label>
                    <label className="flex items-center gap-2 border px-4 py-2 rounded-md bg-gray-50">
                        <input
                            type="radio"
                            name="gender"
                            checked={isEditing ? editFormData.gender === 'keine' : normalizeGender(scanData.gender) === 'keine'}
                            onChange={isEditing ? () => handleInputChange('gender', 'keine') : undefined}
                            disabled={!isEditing}
                            className="cursor-pointer"
                        />
                        <span className="text-sm font-medium">Keine Angabe</span>
                    </label>
                </div>

                {/* Personal Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md border-gray-300 bg-gray-50"
                            value={scanData.vorname || '-'}
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md border-gray-300 bg-gray-50"
                            value={scanData.nachname || '-'}
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Geburtsdatum</label>
                        <input
                            type="date"
                            className={`w-full p-2 border rounded-md ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-300 bg-gray-50'}`}
                            value={isEditing ? editFormData.geburtsdatum : formatDateForInput(scanData.geburtsdatum)}
                            onChange={isEditing ? (e) => handleInputChange('geburtsdatum', e.target.value) : undefined}
                            readOnly={!isEditing}
                        />
                    </div>
                </div>

                {/* Contact and Address */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                        <input
                            type="email"
                            className="w-full p-2 border rounded-md border-gray-300 bg-gray-50"
                            value={scanData.email || ''}
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded-md ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-300 bg-gray-50'}`}
                            value={isEditing ? editFormData.wohnort : (scanData.wohnort || scanData.straße || '')}
                            onChange={isEditing ? (e) => handleInputChange('wohnort', e.target.value) : undefined}
                            placeholder="Stadt, PLZ, Adresse"
                            readOnly={!isEditing}
                        />
                    </div>
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Straße</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded-md ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-300 bg-gray-50'}`}
                            value={isEditing ? editFormData.straße : (scanData.straße || '')}
                            onChange={isEditing ? (e) => handleInputChange('straße', e.target.value) : undefined}
                            placeholder="Street, Street Number"
                            readOnly={!isEditing}
                        />
                    </div> */}

                    {/* Customer ID */}
                    <div >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kunden-ID</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md border-gray-300 bg-gray-50"
                                value={(scanData as any).customerNumber || '-'}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Address Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Versichertennummer</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded-md ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-300 bg-gray-50'}`}
                            value={isEditing ? editFormData.land : (scanData.land || '')}
                            placeholder="Versichertennummer"
                            onChange={isEditing ? (e) => handleInputChange('land', e.target.value) : undefined}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kostenträger</label>
                        {isEditing ? (
                            <select
                                className="w-full p-2 border rounded-md border-gray-300 bg-white"
                                value={editFormData.billingType || ''}
                                onChange={(e) => handleInputChange('billingType', e.target.value)}
                            >
                                <option value="">Select...</option>
                                <option value="krankenkasse">Krankenkasse</option>
                                <option value="privat">Privat</option>
                            </select>
                        ) : (
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md border-gray-300 bg-gray-50"
                                value={
                                    scanData.billingType === 'privat' 
                                        ? 'Privat' 
                                        : scanData.billingType === 'krankenkasse' 
                                        ? 'Krankenkasse' 
                                        : (scanData.billingType || '')
                                }
                                placeholder="Kostenträger"
                                readOnly
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded-md ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-300 bg-gray-50'}`}
                            value={isEditing
                                ? (editFormData.telefonnummer || editFormData.telefon || '')
                                : (scanData.telefonnummer || scanData.telefon || '')}
                            placeholder="+0000000000000"
                            onChange={isEditing ? (e) => {
                                // Update both fields to ensure compatibility
                                handleInputChange('telefonnummer', e.target.value);
                                handleInputChange('telefon', e.target.value);
                            } : undefined}
                            readOnly={!isEditing}
                        />
                    </div>
                </div>
            </div>

            <div className="flex  items-center gap-10 my-10 flex-wrap">
                {/* Versorgung starten */}
                <div className="flex flex-col items-center">
                    <button
                        onClick={handleVersorgung}
                        className="p-2 flex items-center justify-center rounded-2xl border border-black bg-white hover:bg-gray-100 transition cursor-pointer"
                    >
                        <Image src={userload} alt="Versorgung starten" width={70} height={70} />
                    </button>
                    <span className="mt-2 text-center text-sm font-normal">Scan ansehen-</span>
                    <span className="text-center text-sm font-normal"> Versorgung starten</span>
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

        </div>
    )
}
