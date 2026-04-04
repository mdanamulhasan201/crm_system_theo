'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import ImageWithShimmer from '@/components/CustomShafts/ImageWithShimmer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomShafts } from '@/hooks/customShafts/useCustomShafts';
import useDebounce from '@/hooks/useDebounce';
import { CustomShaft } from '@/hooks/customShafts/useCustomShafts';
import CustomShaftProductCardShimmer from '@/components/ShimmerEffect/Maßschäfte/CustomShaftProductCardShimmer';
import SchaftErstellungModal from '@/components/CustomShafts/SchaftErstellungModal';
import BottomFooter from '@/components/CustomShafts/BottomFooter';
import CustomShaftsHeader from '@/components/CustomShafts/CustomShaftsHeader';
import LeistenDigitalGenerieren from '@/components/CustomShafts/LeistenDigitalGenerieren';

export default function CustomShafts() {
    const [gender, setGender] = useState<'Herren' | 'Damen'>('Herren');
    const [category, setCategory] = useState('alle');
    const [sortOption, setSortOption] = useState('price_asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayedCount, setDisplayedCount] = useState(8);
    const [pendingDisplayedCount, setPendingDisplayedCount] = useState<number | null>(null);
    const [allFetchedItems, setAllFetchedItems] = useState<CustomShaft[]>([]);
    const [isFetchingNewPage, setIsFetchingNewPage] = useState(false);
    const [selectedShaftId, setSelectedShaftId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCustomOrderModalOpen, setIsCustomOrderModalOpen] = useState(false);
    const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);
    
    // Initialize showPrices from localStorage, default to true
    const [showPrices, setShowPrices] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('customShafts_showPrices');
            return saved !== null ? saved === 'true' : true;
        }
        return true;
    });
    
    const itemsPerPage = 8;
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const customerId = searchParams.get('customerId');
    const customerName = searchParams.get('customerName');
    const categoryFromQuery = searchParams.get('category');
    const isMassschuhauftraegeOrderCategory = categoryFromQuery === 'massschuhauftraege_order';

    // Save showPrices to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('customShafts_showPrices', showPrices.toString());
        }
    }, [showPrices]);

    // Debounce search query to reduce API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Convert 'alle' to empty string for API (all categories)
    const apiCategory = category === 'alle' ? '' : category;

    // Extract sort direction from sortOption (price_asc -> 'asc', price_desc -> 'desc')
    const getSortPrice = (sortOption: string): string => {
        if (sortOption === 'price_asc') return 'asc';
        if (sortOption === 'price_desc') return 'desc';
        return 'asc'; // default to ascending for other options like 'favorites'
    };
    const sortPrice = getSortPrice(sortOption);

    // Fetch data from API
    const { data: apiData, loading, error } = useCustomShafts(currentPage, itemsPerPage, debouncedSearchQuery, gender, apiCategory, sortPrice);

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
        setPendingDisplayedCount(null);
        setCurrentPage(1);
        setIsFetchingNewPage(false);
        prevFilteredLengthRef.current = 0;
    }, [gender, category, debouncedSearchQuery, sortOption]);

    const filteredData = useMemo(() => {
        if (allFetchedItems.length === 0) return [];

        let filtered = allFetchedItems.filter(item => {
            const normalizedItemGender = (item.gender || '').trim().toLowerCase();
            const normalizedSelectedGender = gender.toLowerCase();
            const genderMatch = normalizedItemGender === normalizedSelectedGender;

            const normalizedItemCategory = (item.catagoary || '').trim();
            const normalizedSelectedCategory = category;
            const categoryMatch = normalizedSelectedCategory === 'alle' || normalizedItemCategory === normalizedSelectedCategory;

            return genderMatch && categoryMatch;
        });

        // Apply client-side sorting (backup for cached items)
        if (sortOption === 'price_asc') {
            filtered = [...filtered].sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price_desc') {
            filtered = [...filtered].sort((a, b) => b.price - a.price);
        }

        return filtered;
    }, [allFetchedItems, gender, category, sortOption]);

    useEffect(() => {
        if (isFetchingNewPage && pendingDisplayedCount !== null) {
            const hasNextPage = apiData?.pagination?.hasNextPage ?? false;
            const hasEnoughItemsForStep = filteredData.length >= pendingDisplayedCount;
            const noMorePages = !hasNextPage;
            const didFilteredDataGrow = filteredData.length > prevFilteredLengthRef.current;

            if (hasEnoughItemsForStep || noMorePages) {
                setDisplayedCount(Math.min(pendingDisplayedCount, filteredData.length));
                setPendingDisplayedCount(null);
                setIsFetchingNewPage(false);
            } else if (didFilteredDataGrow && !loading && hasNextPage) {
                // Keep fetching until this click can reveal a full step (if available).
                setCurrentPage(prev => prev + 1);
            }
        }

        prevFilteredLengthRef.current = filteredData.length;
    }, [filteredData.length, isFetchingNewPage, pendingDisplayedCount, apiData?.pagination?.hasNextPage, loading]);

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

        const targetDisplayedCount = displayedCount + itemsPerPage;

        // If we already have enough cached items, show immediately.
        if (filteredData.length >= targetDisplayedCount) {
            setDisplayedCount(targetDisplayedCount);
            return;
        }

        // Not enough cached items: keep fetching next pages until this click can fill +8 (or no more pages).
        if (apiData?.pagination?.hasNextPage) {
            setPendingDisplayedCount(targetDisplayedCount);
            setIsFetchingNewPage(true);

            // Show any currently available cached items while we fetch remaining ones.
            if (filteredData.length > displayedCount) {
                setDisplayedCount(filteredData.length);
            }

            setCurrentPage(prev => prev + 1);
            return;
        }

        // No more API pages, show whatever is left.
        setDisplayedCount(Math.min(targetDisplayedCount, filteredData.length));
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
            const params = new URLSearchParams();
            params.set('source', '3dupload');
            if (orderId) params.set('orderId', orderId);
            if (customerId) params.set('customerId', customerId);
            if (customerName) params.set('customerName', customerName);
            const url = `/dashboard/custom-shafts/details/${selectedShaftId}?${params.toString()}`;
            router.push(url);
        }
    }

    // Handle Abholung (Pickup) selection
    const handleAbholung = () => {
        if (selectedShaftId) {
            // Navigate to details page for pickup option
            const params = new URLSearchParams();
            params.set('type', 'abholung');
            if (orderId) params.set('orderId', orderId);
            if (customerId) params.set('customerId', customerId);
            if (customerName) params.set('customerName', customerName);
            const url = `/dashboard/custom-shafts/details/${selectedShaftId}?${params.toString()}`;
            router.push(url);
        }
    }

    // Handle custom order 3D Upload - navigate to product-order page (same query params as details flow)
    const handleCustomOrder3DUpload = () => {
        const params = new URLSearchParams();
        if (orderId) params.set('orderId', orderId);
        if (customerId) params.set('customerId', customerId);
        if (customerName) params.set('customerName', customerName);
        const qs = params.toString();
        const url = qs
            ? `/dashboard/custom-shafts/product-order/new?${qs}`
            : `/dashboard/custom-shafts/product-order/new`;
        router.push(url);
    }

    // Handle custom order Abholung - navigate to product-order page
    const handleCustomOrderAbholung = () => {
        const params = new URLSearchParams();
        params.set('type', 'abholung');
        if (orderId) params.set('orderId', orderId);
        if (customerId) params.set('customerId', customerId);
        if (customerName) params.set('customerName', customerName);
        router.push(`/dashboard/custom-shafts/product-order/new?${params.toString()}`);
    }

    return (
        <div className="pt-6">
            {/* Header & Filter Section */}
            <CustomShaftsHeader
                gender={gender}
                category={category}
                searchQuery={searchQuery}
                sortOption={sortOption}
                onGenderChange={setGender}
                onCategoryChange={setCategory}
                onSearchChange={setSearchQuery}
                onSortChange={setSortOption}
                onCustomOrderClick={() => setIsCustomOrderModalOpen(true)}
            />

            {/* Price Visibility Toggle */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col">
                    <label htmlFor="price-toggle" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Preise anzeigen
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Schalten Sie die Preisanzeige ein oder aus, um interne Kosten während Beratungen zu verbergen
                    </p>
                </div>
                <Switch
                    id="price-toggle"
                    checked={showPrices}
                    onCheckedChange={setShowPrices}
                    className="cursor-pointer"
                />
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
                                        {showPrices && (
                                            <div className="font-bold text-lg mb-2 text-left">ab {item.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                        )}
                                    </div>
                                    <Button
                                        className="w-full cursor-pointer transition-all duration-300 mt-2 rounded-full bg-[#61A175] text-white hover:bg-[#61A175]/50 text-sm font-semibold py-6 disabled:opacity-50 disabled:cursor-not-allowed border-0"
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
                        <div className="flex justify-center mt-12">
                            <Button
                                type="button"
                                onClick={handleShowMore}
                                disabled={loading && !hasMoreItems}
                                className="rounded-full cursor-pointer bg-gray-800 text-white hover:bg-gray-700 px-12 py-6 text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                {loading && !hasMoreItems ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Laden...
                                    </span>
                                ) : (
                                    'Mehr anzeigen'
                                )}
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


            {!isMassschuhauftraegeOrderCategory && (
                <>
                    {/* footer  logo*/}
                    <LeistenDigitalGenerieren />
                    <BottomFooter />
                </>
            )}
        </div>
    );
}
