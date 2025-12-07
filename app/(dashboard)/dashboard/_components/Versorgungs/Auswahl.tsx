
'use client'
import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { IoIosArrowDown } from 'react-icons/io';
import VersorgungModal, { VersorgungCard } from '@/components/VersorgungModal/VersorgungModal';
import { getAllVersorgungen, deleteVersorgung } from '@/apis/versorgungApis';
import toast from 'react-hot-toast';

interface AuswahlCard extends VersorgungCard {
    kategorie: string;
    status?: string;
}



const filterCategories = [
    "Plantarfasziitis",
    "Fersensporn",
    "Spreizfuß",
    "Senkfuß",
    "Plattfuß",
    "Hohlfuß",
    "Knickfuß",
    "Knick-Senkfuß",
    "Hallux valgus",
    "Hallux rigidus",
    "Hammerzehen / Krallenzehen",
    "Morton-Neurom",
    "Fußarthrose",
    "Stressfrakturen im Fußbereich",
    "Diabetisches Fußsyndrom"
];


const diagnosisMapping: { [key: string]: string } = {
    "Plantarfasziitis": "PLANTARFASZIITIS",
    "Fersensporn": "FERSENSPORN",
    "Spreizfuß": "SPREIZFUSS",
    "Senkfuß": "SENKFUSS",
    "Plattfuß": "PLATTFUSS",
    "Hohlfuß": "HOHLFUSS",
    "Knickfuß": "KNICKFUSS",
    "Knick-Senkfuß": "KNICK_SENKFUSS",
    "Hallux valgus": "HALLUX_VALGUS",
    "Hallux rigidus": "HALLUX_RIGIDUS",
    "Hammerzehen / Krallenzehen": "HAMMERZEHEN_KRALLENZEHEN",
    "Morton-Neurom": "MORTON_NEUROM",
    "Fußarthrose": "FUSSARTHROSE",
    "Stressfrakturen im Fußbereich": "STRESSFRAKTUREN_IM_FUSS",
    "Diabetisches Fußsyndrom": "DIABETISCHES_FUSSSYNDROM"
};

export default function Auswahl() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        slidesToScroll: 1,
        align: 'start',
        breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 4 }
        }
    })

    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])



    const [cards, setCards] = useState<AuswahlCard[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<AuswahlCard | null>(null);
    const [modalCategory, setModalCategory] = useState<'alltagseinlagen' | 'sporteinlagen' | 'businesseinlagen'>('alltagseinlagen');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState(filterCategories[0]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Fetch data from API based on selected diagnosis
    const fetchVersorgungen = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const diagnosisStatus = diagnosisMapping[selectedCategory];
            const response = await getAllVersorgungen('', 1, 1000);

            if (response.data && Array.isArray(response.data)) {
                // Filter by diagnosis_status on client side
                let filteredData = response.data;
                if (diagnosisStatus) {
                    filteredData = filteredData.filter((item: any) => item.diagnosis_status === diagnosisStatus);
                }

                const transformedData = filteredData.map((item: any) => ({
                    id: item.id || item._id,
                    name: item.name || 'Unnamed Versorgung',
                    rohlingHersteller: item.rohlingHersteller || 'N/A',
                    artikelHersteller: item.artikelHersteller || 'N/A',
                    status: item.status || 'N/A',
                    versorgung: item.versorgung || 'N/A',
                    materialien: item.material || 'N/A',
                    laenge: item.laenge || 'N/A',
                    kategorie: selectedCategory,
                }));
                setCards(transformedData);
            } else {
                setCards([]);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch data');
            toast.error('Failed to fetch versorgungen data');
        } finally {
            setLoading(false);
        }
    }, [selectedCategory]);

    // Fetch data when selected category changes
    useEffect(() => {
        fetchVersorgungen();
    }, [fetchVersorgungen]);



    const handleEditClick = (card: AuswahlCard) => {
        setEditingCard(card);
        setModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingCard(null);
        setModalOpen(true);
    };

    const handleModalSubmit = (formData: Omit<VersorgungCard, 'id'>) => {
        if (editingCard) {
            setCards(cards.map(card =>
                card.id === editingCard.id
                    ? { ...card, ...formData }
                    : card
            ));
        } else {
            setCards([
                ...cards,
                {
                    id: Date.now(),
                    ...formData,
                    kategorie: selectedCategory,
                },
            ]);
        }
        setEditingCard(null);
        // Refresh data after adding/editing
        fetchVersorgungen();
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteClick = (id: string) => {
        setCardToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (cardToDelete !== null) {
            try {
                setDeleting(true);
                await deleteVersorgung(cardToDelete);
                setCards(cards.filter(card => card.id.toString() !== cardToDelete));
                toast.success('Versorgung successfully deleted');
            } catch (err: any) {
                console.error('Error deleting versorgung:', err);
                toast.error('Failed to delete versorgung');
            } finally {
                setDeleting(false);
            }
        }
        setDeleteDialogOpen(false);
        setCardToDelete(null);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setCardToDelete(null);
    };

    if (loading) {
        return (
            <div className='flex flex-col gap-4 mt-10'>
                <h1 className='text-2xl font-bold'>Auswahl - {selectedCategory}</h1>
                <div className='flex items-center justify-center min-h-[300px]'>
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex flex-col gap-4 mt-10'>
                <h1 className='text-2xl font-bold'>Auswahl - {selectedCategory}</h1>
                <div className='flex items-center justify-center min-h-[300px]'>
                    <div className="text-red-500">
                        <p>Error: {error}</p>
                        <button
                            onClick={fetchVersorgungen}
                            className="mt-2 bg-black text-white px-4 py-2 rounded-full"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-4 mt-10'>
            {/* Title with Down Arrow Dropdown */}
            <div className="relative flex items-center gap-2 mb-4 cursor-pointer select-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span className="text-2xl font-semibold">{selectedCategory}</span>
                <IoIosArrowDown className='text-2xl' />
                {/* Dropdown */}
                {dropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 bg-white border rounded shadow-lg z-20 min-w-[300px] max-w-[400px] max-h-[300px] overflow-y-auto">
                        {filterCategories.map(category => (
                            <div
                                key={category}
                                className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${category === selectedCategory ? 'font-semibold bg-gray-50' : ''}`}
                                onClick={e => {
                                    e.stopPropagation();
                                    setSelectedCategory(category);
                                    setDropdownOpen(false);
                                }}
                            >
                                {category}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className='relative px-4'>
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                        {cards.map((card, index) => (
                            <div key={index} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] p-2 flex flex-col items-center">
                                <div className='border border-gray-900 p-5 flex flex-col gap-1 rounded-xl min-h-[260px] w-full'>
                                    <h2 className='text-2xl font-bold mb-2'>{card.name}</h2>
                                    <div className='flex flex-col gap-3'>
                                        <p className='font-bold'>Hersteller: <span className='font-normal'>{card?.rohlingHersteller}</span></p>

                                        <p className='font-bold'>Versorgung: <span className='font-normal'>{card?.versorgung}</span></p>
                                        <p className='font-bold'>Status: <span className='font-normal'>{card?.status}</span></p>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-2 mt-3 w-full items-center'>
                                    <button className='bg-black text-white px-6 py-2 rounded-full text-lg w-3/4 cursor-pointer' onClick={() => handleEditClick(card)}>Bearbeiten</button>
                                    <button className='underline text-black w-3/4 cursor-pointer' onClick={() => handleDeleteClick(card.id.toString())}>Entfernen</button>
                                </div>
                            </div>
                        ))}
                        {/* Plus Card */}
                        <div className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] p-2 flex items-center justify-center">
                            <button
                                onClick={handleAddNew}
                                className="w-full cursor-pointer  h-full border-2 border-dashed border-gray-500 flex flex-col items-center justify-center rounded-lg min-h-[300px] hover:bg-gray-50 transition"
                                style={{ minHeight: '300px' }}
                            >
                                <Plus className="w-16 h-16 text-gray-500 border border-gray-500 rounded-full p-1" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={scrollPrev}
                    className="absolute cursor-pointer left-2 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white p-2 transition-all duration-300 rounded-full shadow-lg hover:bg-gray-100 z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <button
                    onClick={scrollNext}
                    className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white transition-all duration-300 p-2 rounded-full shadow-lg hover:bg-gray-100 z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

            {/* Reusable VersorgungModal with Auswahl functionality */}
            <VersorgungModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                category={modalCategory}
                editingCard={editingCard}
                onSubmit={handleModalSubmit}
                selectedDiagnosis={diagnosisMapping[selectedCategory]}
            />

            {/* Confirmation Dialog for deletion */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Willst du wirklich diese Versorgung aus deinem Sortiment löschen?</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-4 justify-end mt-6">
                        <button
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                            className={`px-6 py-2 rounded-full cursor-pointer ${deleting
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-black text-white'
                                }`}
                        >
                            {deleting ? 'Deleting...' : 'Ja'}
                        </button>
                        <button onClick={handleCancelDelete} className="bg-gray-200 text-black px-6 py-2 rounded-full cursor-pointer">Nein</button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

