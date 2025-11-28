'use client'
import React, { useState, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import VersorgungModal, { VersorgungCard } from '@/components/VersorgungModal/VersorgungModal';
import { getAllVersorgungen, deleteVersorgung } from '@/apis/versorgungApis';
import toast from 'react-hot-toast';

interface BusinesseinlagenCard extends VersorgungCard { }

export default function Businesseinlagen() {
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

    // State for tracking carousel scroll positions
    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(false)

    // Update scroll states for main carousel
    const onSelect = React.useCallback(() => {
        if (!emblaApi) return
        setCanScrollPrev(emblaApi.canScrollPrev())
        setCanScrollNext(emblaApi.canScrollNext())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on('select', onSelect)
        emblaApi.on('reInit', onSelect)
        return () => {
            emblaApi.off('select', onSelect)
            emblaApi.off('reInit', onSelect)
        }
    }, [emblaApi, onSelect])

    const [cards, setCards] = useState<BusinesseinlagenCard[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<BusinesseinlagenCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data from API
    const fetchVersorgungen = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllVersorgungen('Businesseinlagen', 1, 1000, ''); 

            if (response.data && Array.isArray(response.data)) {
                const transformedData = response.data.map((item: any) => ({
                    id: item._id || item.id,
                    name: item.name || 'Unnamed Versorgung',
                    rohlingHersteller: item.rohlingHersteller || 'N/A',
                    artikelHersteller: item.artikelHersteller || 'N/A',
                    artNr: item.artNr || 'N/A',
                    versorgung: item.versorgung || 'N/A',
                    materialien: item.material || 'N/A',
                    laenge: item.laenge || 'N/A',
                    diagnosis_status: item.diagnosis_status || '',
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
    };

    useEffect(() => {
        fetchVersorgungen();
    }, []);

    const handleEditClick = (card: BusinesseinlagenCard) => {
        setEditingCard(card);
        setModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingCard(null);
        setModalOpen(true);
    };

    const handleModalSubmit = (formData: Omit<VersorgungCard, 'id'>) => {
        if (editingCard) {
            // Update existing card
            setCards(cards.map(card =>
                card.id === editingCard.id
                    ? { ...card, ...formData }
                    : card
            ));
        } else {
            // Add new card
            setCards([
                ...cards,
                {
                    id: Date.now(),
                    ...formData,
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
                <h1 className='text-2xl font-bold'>Businesseinlagen</h1>
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
                <h1 className='text-2xl font-bold'>Businesseinlagen</h1>
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
            <h1 className='text-2xl font-bold'>Businesseinlagen</h1>
            <div className='relative px-4'>
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                        {cards.map((card, index) => (
                            <div key={index} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] p-2 flex flex-col items-center">
                                <div className='border border-gray-900 p-5 flex flex-col gap-1 rounded-xl min-h-[260px] w-full'>
                                    <h2 className='text-xl xl:text-2xl font-bold mb-2'>{card.name}</h2>
                                    <div className='flex flex-col gap-3'>
                                        <p className='font-bold'>Hersteller: <span className='font-normal'>{card.rohlingHersteller}</span></p>

                                        <p className='font-bold'>Versorgung: <span className='font-normal'>{card.versorgung}</span></p>
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
                {canScrollPrev && (
                    <button
                        onClick={scrollPrev}
                        className="absolute cursor-pointer left-2 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white p-2 transition-all duration-300 rounded-full shadow-lg hover:bg-gray-100 z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                )}
                {canScrollNext && (
                    <button
                        onClick={scrollNext}
                        className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white transition-all duration-300 p-2 rounded-full shadow-lg hover:bg-gray-100 z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Reusable VersorgungModal */}
            <VersorgungModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                category="businesseinlagen"
                editingCard={editingCard}
                onSubmit={handleModalSubmit}
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
