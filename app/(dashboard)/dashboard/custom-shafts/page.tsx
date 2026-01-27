'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';

import { ChevronDown, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ImageWithShimmer from '@/components/CustomShafts/ImageWithShimmer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomShafts } from '@/hooks/customShafts/useCustomShafts';
import useDebounce from '@/hooks/useDebounce';
import { CustomShaft } from '@/hooks/customShafts/useCustomShafts';
import CustomShaftProductCardShimmer from '@/components/ShimmerEffect/Maßschäfte/CustomShaftProductCardShimmer';
import SchaftErstellungModal from '@/components/CustomShafts/SchaftErstellungModal';

const categories = [
    { label: 'Alle Kategorien', value: 'alle' },
    { label: 'Halbschuhe', value: 'Halbschuhe' },
    { label: 'Stiefel', value: 'Stiefel' },
    { label: 'Knöchelhoch', value: 'Knöchelhoch' },
    { label: 'Sandalen', value: 'Sandalen' },
    { label: 'Bergschuhe', value: 'Bergschuhe' },
    { label: 'Business-Schuhe', value: 'Business-Schuhe' },
];

export default function CustomShafts() {
    const [gender, setGender] = useState<'Herren' | 'Damen'>('Herren');
    const [category, setCategory] = useState('alle');
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayedCount, setDisplayedCount] = useState(8);
    const [allFetchedItems, setAllFetchedItems] = useState<CustomShaft[]>([]);
    const [isFetchingNewPage, setIsFetchingNewPage] = useState(false);
    const [selectedShaftId, setSelectedShaftId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCustomOrderModalOpen, setIsCustomOrderModalOpen] = useState(false);
    const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);
    const itemsPerPage = 8;
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    // Debounce search query to reduce API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Convert 'alle' to empty string for API (all categories)
    const apiCategory = category === 'alle' ? '' : category;

    // Fetch data from API
    const { data: apiData, loading, error } = useCustomShafts(currentPage, itemsPerPage, debouncedSearchQuery, gender, apiCategory);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (categoryOpen && !target.closest('.category-dropdown')) {
                setCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [categoryOpen]);

    const prevFilteredLengthRef = React.useRef(0);

    useEffect(() => {
        if (apiData?.data && apiData.data.length > 0) {
            setAllFetchedItems(prev => {
                if (currentPage === 1) {
                    return apiData.data;
                }

                const existingIds = new Set(prev.map(item => item.id));
                const newItems = apiData.data.filter(item => !existingIds.has(item.id));
                return [...prev, ...newItems];
            });
        }
    }, [apiData?.data, currentPage]);
    useEffect(() => {
        setAllFetchedItems([]);
        setDisplayedCount(8);
        setCurrentPage(1);
        setIsFetchingNewPage(false);
        prevFilteredLengthRef.current = 0;
    }, [gender, category, debouncedSearchQuery]);

    const availableCategories = useMemo(() => {
        return categories;
    }, []);

    const filteredData = useMemo(() => {
        if (allFetchedItems.length === 0) return [];

        return allFetchedItems.filter(item => {
            const normalizedItemGender = (item.gender || '').trim().toLowerCase();
            const normalizedSelectedGender = gender.toLowerCase();
            const genderMatch = normalizedItemGender === normalizedSelectedGender;

            const normalizedItemCategory = (item.catagoary || '').trim();
            const normalizedSelectedCategory = category;
            const categoryMatch = normalizedSelectedCategory === 'alle' || normalizedItemCategory === normalizedSelectedCategory;

            return genderMatch && categoryMatch;
        });
    }, [allFetchedItems, gender, category]);

    useEffect(() => {
        if (isFetchingNewPage && filteredData.length > prevFilteredLengthRef.current && currentPage > 1) {
            // New items were added to filteredData from API, automatically show 8 more
            setDisplayedCount(prevCount => Math.min(prevCount + 8, filteredData.length));
            setIsFetchingNewPage(false);
        }
        prevFilteredLengthRef.current = filteredData.length;
    }, [filteredData.length, currentPage, isFetchingNewPage]);

    // Display only the first `displayedCount` items
    const displayedData = useMemo(() => {
        return filteredData.slice(0, displayedCount);
    }, [filteredData, displayedCount]);

    // Check if there are more items to show from already fetched data
    const hasMoreItems = displayedCount < filteredData.length;

    // Check if we need to fetch more data from API
    // We need more data if we've displayed all filtered items and there's a next page
    const needsMoreData = filteredData.length > 0 && displayedCount >= filteredData.length && apiData?.pagination?.hasNextPage;

    // Check if there's more data available (either in cache or from API)
    const hasMoreDataAvailable = hasMoreItems || (apiData?.pagination?.hasNextPage ?? false);

    // Handle "Mehr anzeigen" button click
    const handleShowMore = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // Don't do anything if already loading
        if (loading) return;

        // First, check if we have more items in already fetched data
        if (hasMoreItems) {
            // Show next 8 items from already fetched data (instant, no loading needed)
            setDisplayedCount(prev => Math.min(prev + 8, filteredData.length));
        } else if (apiData?.pagination?.hasNextPage) {
            // No more items in fetched data, fetch next page
            setIsFetchingNewPage(true);
            setCurrentPage(prev => prev + 1);
        }
    };

    // handle click on the button - open modal instead of direct navigation
    const handleClick = (id: string) => {
        setLoadingButtonId(id);
        setSelectedShaftId(id);
        // Small delay to show loading state
        setTimeout(() => {
            setIsModalOpen(true);
            setLoadingButtonId(null);
        }, 200);
    }

    // Handle 3D Upload selection - navigate to details page
    const handle3DUpload = () => {
        if (selectedShaftId) {
            const url = orderId
                ? `/dashboard/custom-shafts/details/${selectedShaftId}?orderId=${orderId}`
                : `/dashboard/custom-shafts/details/${selectedShaftId}`;
            router.push(url);
        }
    }

    // Handle Abholung (Pickup) selection
    const handleAbholung = () => {
        if (selectedShaftId) {
            // Navigate to details page for pickup option
            const url = orderId
                ? `/dashboard/custom-shafts/details/${selectedShaftId}?orderId=${orderId}&type=abholung`
                : `/dashboard/custom-shafts/details/${selectedShaftId}?type=abholung`;
            router.push(url);
        }
    }

    // Handle custom order 3D Upload - navigate to product-order page
    const handleCustomOrder3DUpload = () => {
        const url = orderId
            ? `/dashboard/custom-shafts/product-order/new?orderId=${orderId}`
            : `/dashboard/custom-shafts/product-order/new`;
        router.push(url);
    }

    // Handle custom order Abholung - navigate to product-order page
    const handleCustomOrderAbholung = () => {
        const url = orderId
            ? `/dashboard/custom-shafts/product-order/new?orderId=${orderId}&type=abholung`
            : `/dashboard/custom-shafts/product-order/new?type=abholung`;
        router.push(url);
    }

    return (
        <div className="  py-6">
            {/* Header & Description */}
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold mb-1"> Individuelle Maßschäfte</h1>
                <div className="text-xs md:text-sm text-gray-700 leading-snug mb-1">
                3D-basiert oder physisch umgesetzt. Schnell gefertigt. Klar kalkulierbar.<br />
                    <span 
                        className="font-bold cursor-pointer underline hover:text-green-600 transition-colors"
                        onClick={() => setIsCustomOrderModalOpen(true)}
                    >
                        Jetzt neu: Eigenes Modell konfigurieren
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className={`rounded-none cursor-pointer border border-black px-6 py-1.5 text-base font-normal h-10 ${gender === 'Herren' ? 'bg-black text-white' : 'bg-white text-black'}`}
                            onClick={() => setGender('Herren')}
                        >
                            Herren
                        </Button>
                        <Button
                            variant="outline"
                            className={`rounded-none cursor-pointer border border-black px-6 py-1.5 text-base font-normal h-10 ${gender === 'Damen' ? 'bg-black text-white' : 'bg-white text-black'}`}
                            onClick={() => setGender('Damen')}
                        >
                            Damen
                        </Button>
                    </div>
                    {/* Category Dropdown as text with chevron */}
                    <div className="relative mt-1 category-dropdown">
                        <button
                            className="flex cursor-pointer items-center text-base md:text-sm font-normal text-black bg-transparent px-0 py-1 focus:outline-none"
                            onClick={() => setCategoryOpen((v) => !v)}
                            type="button"
                        >
                            {availableCategories.find((c) => c.value === category)?.label || 'Alle Kategorien'}
                            <ChevronDown className={`ml-1 w-5 h-5 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {categoryOpen && (
                            <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                                {availableCategories.map((cat) => (
                                    <div
                                        key={cat.value}
                                        className={`px-4 py-2 cursor-pointer text-sm transition-colors ${category === cat.value
                                                ? 'bg-black text-white font-semibold hover:bg-gray-800'
                                                : 'text-black hover:bg-gray-100'
                                            }`}
                                        onClick={() => {
                                            setCategory(cat.value);
                                            setCategoryOpen(false);
                                        }}
                                    >
                                        {cat.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* Search Field */}
                <div className="flex items-center justify-end w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-10 pr-4 h-10 rounded-full border border-gray-300 focus:border-black focus:ring-0"
                        />
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-red-500 text-lg font-medium mb-2">Fehler beim Laden der Daten</div>
                    <div className="text-gray-400 text-sm text-center">
                        {error}
                    </div>
                </div>
            )}

            {/* Product Grid */}
            {!error && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Show loaded items */}
                        {displayedData.map((item, index) => (
                            <div key={item.id} className="border group border-gray-300 rounded-md bg-white flex flex-col h-full">
                                <ImageWithShimmer
                                    src={item.image}
                                    alt={item.name}
                                    width={500}
                                    height={500}
                                    priority={index < 4}
                                    index={index}
                                />
                                <div className="flex-1 flex flex-col justify-between p-4">
                                    <div>
                                        <div className="font-semibold text-base mb-1 text-left">{item.name}</div>
                                        <div className="text-xs text-gray-500 mb-2 text-left">#{item.ide}</div>
                                        <div className="font-bold text-lg mb-2 text-left">ab {item.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full cursor-pointer transition-all duration-300 mt-2 rounded-none border border-black bg-white text-black hover:bg-gray-100 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handleClick(item.id)}
                                        disabled={loadingButtonId === item.id}
                                    >
                                        {loadingButtonId === item.id ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Lade...
                                            </span>
                                        ) : (
                                            'Jetzt konfigurieren'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* Show shimmer dynamically only for items that are still loading */}
                        {loading && (displayedData.length === 0 || isFetchingNewPage) && (
                            <CustomShaftProductCardShimmer count={itemsPerPage} />
                        )}
                    </div>

                    {/* Show More Button */}
                    {hasMoreDataAvailable && (
                        <div className="flex justify-center mt-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleShowMore}
                                disabled={loading && !hasMoreItems}
                                className="rounded-none border border-black px-8 py-2 text-base font-normal bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && !hasMoreItems ? 'Laden...' : 'Mehr anzeigen'}
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* No Products Found - only show when not loading and no data */}
            {!error && !loading && displayedData.length === 0 && filteredData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-gray-500 text-lg font-medium mb-2">Keine Produkte gefunden</div>
                    <div className="text-gray-400 text-sm text-center">
                        Es wurden keine Produkte für die ausgewählten Filter gefunden.<br />
                        Versuchen Sie andere Kategorien oder Filter zu verwenden.
                    </div>
                </div>
            )}

            {/* Schaft Erstellung Modal */}
            <SchaftErstellungModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setLoadingButtonId(null);
                }}
                onSelect3DUpload={handle3DUpload}
                onSelectAbholung={handleAbholung}
            />

            {/* Custom Order Modal - for "Eigenen Schuh konfigurieren" */}
            <SchaftErstellungModal
                isOpen={isCustomOrderModalOpen}
                onClose={() => {
                    setIsCustomOrderModalOpen(false);
                }}
                onSelect3DUpload={handleCustomOrder3DUpload}
                onSelectAbholung={handleCustomOrderAbholung}
            />


            {/* footer  logo*/}

            <div className='flex justify-between items-start gap-8 mt-16 pt-8 border-t border-gray-200'>

                {/* adresse */}
                <div className='flex-1'>
                    {/* Logo */}
                    <div className='mb-4'>
                        <img 
                            src="/images/logo.png" 
                            alt="Logo" 
                            className='h-12 w-auto object-contain'
                        />
                    </div>
                    
                    {/* Address */}
                    <div className='text-sm text-gray-600'>
                        <p>THEO GmbH, Musterstraße 123, 10115 Berlin, Deutschland | Tel: +49 (0) 30 1234567 | E-Mail: info@theo-custom.de</p>
                    </div>
                </div>

                {/* right side */}
                <div className='flex-1 max-w-2xl'>
                    <h3 className='text-lg font-bold mb-3'>Bodenkonstruktion & Leistenversand</h3>
                    <p className='text-sm text-gray-600 mb-4 leading-relaxed'>
                        Für die Bodenkonstruktion benötigen wir – je nach Auftrag – den passenden Leisten. 
                        Bitte sende physische Leisten gut verpackt an die angeführte Adresse und lege die Bestellnummer bei.
                    </p>
                    <button className='text-sm font-medium text-black hover:text-gray-600 transition-colors flex items-center gap-2 group cursor-pointer'>
                        Zur Bodenkonstruktion 
                        <span className='transform transition-transform group-hover:translate-x-1'>→</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
