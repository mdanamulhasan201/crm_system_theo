
'use client'
import React, { useState, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import VersorgungModal, { VersorgungCard } from '@/components/VersorgungModal/VersorgungModal';
import { deleteVersorgung, getVersorgungenBySupplyStatusId } from '@/apis/versorgungApis';
import { getAllEinlagen } from '@/apis/einlagenApis';
import { getSingleStorage } from '@/apis/storeManagement';
import toast from 'react-hot-toast';

interface AlltagseinlagenCard extends VersorgungCard {
    type?: 'milling_block' | 'rady_insole'
}

// Single Versorgungencard Section Component
function VersorgungencardSection({ einlageName, einlageId }: { einlageName: string; einlageId: string }) {
    // Use einlageName to filter by supplyStatus.name
    const [emblaRef, emblaApi] = useEmblaCarousel({
        slidesToScroll: 1,
        align: 'start',
        containScroll: 'trimSnaps',
        breakpoints: {
            '(min-width: 640px)': { slidesToScroll: 1 },
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 4 }
        }
    })

    // Re-init carousel on resize so card width updates (tab/tablet/mobile)
    useEffect(() => {
        if (!emblaApi) return
        const handleResize = () => emblaApi.reInit()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [emblaApi])

    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(false)

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

    const [cards, setCards] = useState<AlltagseinlagenCard[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<AlltagseinlagenCard | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
    const [diagnosisModalList, setDiagnosisModalList] = useState<string[]>([]);

    const fetchVersorgungen = React.useCallback(async () => {
        try {
            const response = await getVersorgungenBySupplyStatusId(einlageName, 1, 1000);

            if (response.data && Array.isArray(response.data)) {
                // First, transform the basic data
                const transformedData = await Promise.all(
                    response.data.map(async (item: any) => {
                        const baseData = {
                            id: item._id || item.id,
                            name: item.name || 'Unnamed Versorgung',
                            rohlingHersteller: item.rohlingHersteller || 'N/A',
                            artikelHersteller: item.artikelHersteller || 'N/A',
                            artNr: item.artNr || 'N/A',
                            versorgung: item.versorgung || 'N/A',
                            materialien: item.material || 'N/A',
                            laenge: item.laenge || 'N/A',
                            diagnosis_status: Array.isArray(item.diagnosis_status) ? item.diagnosis_status : [],
                        };

                        // Fetch store data to get type if storeId exists
                        let type: 'milling_block' | 'rady_insole' | undefined = undefined;
                        if (item.storeId) {
                            try {
                                const storeResponse = await getSingleStorage(item.storeId);
                                if (storeResponse.success && storeResponse.data) {
                                    type = storeResponse.data.type;
                                }
                            } catch (storeErr) {
                                console.error('Error fetching store type:', storeErr);
                                // Continue without type if store fetch fails
                            }
                        }

                        return {
                            ...baseData,
                            type,
                        };
                    })
                );
                setCards(transformedData);
            } else {
                setCards([]);
            }
        } catch (err: any) {
            console.error('Error fetching versorgungen:', err);
            toast.error('Failed to fetch versorgungen data');
        }
    }, [einlageName]);

    useEffect(() => {
        fetchVersorgungen();
    }, [fetchVersorgungen]);

    const handleEditClick = (card: AlltagseinlagenCard) => {
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
                },
            ]);
        }
        setEditingCard(null);
        fetchVersorgungen();
    };

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

    return (
        <div className='flex flex-col gap-4'>
            <h1 className='text-2xl font-bold'>{einlageName}</h1>
            <div className='relative px-2 sm:px-4 w-full max-w-full overflow-hidden'>
                <div className="overflow-hidden w-full" ref={emblaRef}>
                    <div className="flex touch-pan-y">
                        {cards.map((card, index) => (
                            <div key={index} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] px-1.5 sm:p-2 flex flex-col items-stretch">
                                {/* Card: content + buttons inside so nothing overflows */}
                                <div className='border border-gray-900 rounded-xl flex flex-col overflow-hidden w-full min-h-[280px] flex-1'>
                                    {/* Scrollable content area - prevents data overflow */}
                                    <div className='p-4 sm:p-5 flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden'>
                                        <p className='font-bold text-base sm:text-lg shrink-0'>Versorgung: <span className='font-normal text-lg sm:text-xl wrap-break-word'>{card.versorgung}</span></p>

                                        {card.type && (
                                            <div className='flex items-center gap-2 shrink-0'>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    card.type === 'milling_block' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {card.type === 'milling_block' ? 'Fräsblock' : 'Einlagenrohlinge'}
                                                </span>
                                            </div>
                                        )}

                                        <div className='flex flex-col gap-1 min-w-0'>
                                            <p className='font-bold text-sm sm:text-base'>
                                                Materialien:
                                                <span className='font-normal ml-2 wrap-break-word'>
                                                    {Array.isArray(card.materialien)
                                                        ? card.materialien.join(', ')
                                                        : card.materialien}
                                                </span>
                                            </p>
                                            <p className='font-bold text-sm sm:text-base'>Einlage: <span className='font-normal wrap-break-word'>{card.name}</span></p>
                                        </div>

                                        {Array.isArray(card.diagnosis_status) && card.diagnosis_status.length > 0 && (
                                            <div className='flex flex-col gap-1.5 min-h-0 flex-1'>
                                                <p className='font-bold text-sm sm:text-base shrink-0'>Diagnose:</p>
                                                <div className='flex flex-wrap items-center gap-1.5'>
                                                    {/* Show only 1 on card; click opens modal with all */}
                                                    {card.diagnosis_status.slice(0, 1).map((status: string, idx: number) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => {
                                                                setDiagnosisModalList(Array.isArray(card.diagnosis_status) ? card.diagnosis_status : []);
                                                                setDiagnosisModalOpen(true);
                                                            }}
                                                            className='px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs sm:text-sm truncate max-w-full text-left hover:bg-gray-200 cursor-pointer'
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                    {card.diagnosis_status.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDiagnosisModalList(Array.isArray(card.diagnosis_status) ? card.diagnosis_status : []);
                                                                setDiagnosisModalOpen(true);
                                                            }}
                                                            className='px-2.5 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-300 cursor-pointer shrink-0'
                                                        >
                                                            +{card.diagnosis_status.length - 1} mehr
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Buttons inside card - always visible, no overflow */}
                                    <div className='flex flex-col gap-2 p-4 pt-2 sm:p-5 sm:pt-3 border-t border-gray-100 shrink-0'>
                                        <button className='bg-black text-white px-4 sm:px-6 py-2 rounded-full text-sm sm:text-lg w-full max-w-[85%] mx-auto cursor-pointer' onClick={() => handleEditClick(card)}>Bearbeiten</button>
                                        <button className='underline text-black text-sm sm:text-base w-full max-w-[85%] mx-auto cursor-pointer py-1' onClick={() => handleDeleteClick(card.id.toString())}>Entfernen</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Plus Card */}
                        <div className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] px-1.5 sm:p-2 flex items-center justify-center">
                            <button
                                onClick={handleAddNew}
                                className="w-full cursor-pointer border-2 border-dashed border-gray-500 flex flex-col items-center justify-center rounded-xl min-h-[280px] hover:bg-gray-50 transition"
                            >
                                <Plus className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 border border-gray-500 rounded-full p-1 shrink-0" />
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
                category="alltagseinlagen"
                editingCard={editingCard}
                onSubmit={handleModalSubmit}
                supplyStatusId={einlageId}
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

            {/* Diagnose list modal */}
            <Dialog open={diagnosisModalOpen} onOpenChange={setDiagnosisModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Diagnose</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {diagnosisModalList.map((status: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {status}
                            </span>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function Versorgungencard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [einlagenData, setEinlagenData] = useState<Array<{ id: string; name: string }>>([]);

    // Fetch data from getAllEinlagen API (cursor-based pagination, fetches all pages)
    const fetchEinlagen = async () => {
        try {
            setError(null);
            const allItems: Array<{ id: string; name: string }> = [];
            let cursor: string | undefined = undefined;

            while (true) {
                const response = await getAllEinlagen(1000, cursor);

                if (response.data && Array.isArray(response.data)) {
                    const pageItems = response.data.map((item: any) => ({
                        id: item.id,
                        name: item.name || 'Unnamed',
                    }));
                    allItems.push(...pageItems);
                }

                const pagination = response.pagination;
                if (!pagination?.hasMore || !pagination?.nextCursor) {
                    break;
                }
                cursor = pagination.nextCursor;
            }

            setEinlagenData(allItems);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch data');
            toast.error('Failed to fetch einlagen data');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await fetchEinlagen();
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Shimmer loading component
    const ShimmerCard = () => (
        <div className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] px-1.5 sm:p-2">
            <div className='border border-gray-200 p-4 sm:p-5 flex flex-col gap-1 rounded-xl min-h-[280px] w-full'>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
        </div>
    );

    const ShimmerSection = () => (
        <div className='flex flex-col gap-4'>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
            <div className='relative px-4'>
                <div className="flex">
                    <ShimmerCard />
                    <ShimmerCard />
                    <ShimmerCard />
                    <ShimmerCard />
                </div>
            </div>
        </div>
    );

    return (
        <div className='flex flex-col gap-8 mt-10'>
            {loading ? (
                <>
                    <ShimmerSection />
                    <ShimmerSection />
                </>
            ) : error ? (
                <div className='flex items-center justify-center min-h-[300px]'>
                    <div className="text-red-500">
                        <p>Error: {error}</p>
                        <button
                            onClick={fetchEinlagen}
                            className="mt-2 bg-black text-white px-4 py-2 rounded-full"
                        >
                            Erneut versuchen
                        </button>
                    </div>
                </div>
            ) : einlagenData.length > 0 ? (
                einlagenData.map((item) => (
                    <VersorgungencardSection
                        key={item.id}
                        einlageName={item.name}
                        einlageId={item.id}
                    />
                ))
            ) : (
                <div className='flex flex-col gap-4'>
                    <h1 className='text-2xl font-bold'>Versorgungen</h1>
                    <div className='flex items-center justify-center min-h-[300px]'>
                        <p className='text-gray-500'>Keine Versorgungen gefunden</p>
                    </div>
                </div>
            )}
        </div>
    )
}
