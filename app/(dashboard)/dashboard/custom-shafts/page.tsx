'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';

import { ChevronDown, Search } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useCustomShafts } from '@/hooks/customShafts/useCustomShafts';
import useDebounce from '@/hooks/useDebounce';
import { CustomShaft } from '@/hooks/customShafts/useCustomShafts';

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
    const itemsPerPage = 8;
    const router = useRouter();

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

    // handle click on the button
    const handleClick = (id: string) => {
        router.push(`/dashboard/custom-shafts/details/${id}`);
    }

    return (
        <div className="  py-6">
            {/* Header & Description */}
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold mb-1">Maßschaft - individuell für deinen Kunden.</h1>
                <div className="text-xs md:text-sm text-gray-700 leading-snug mb-1">
                    Basierend auf dem 3D-Modell des Kundenfußes stellen wir passgenaue Maßschäfte her. So sparst du dir unnötigen Versand, erhältst eine deutlich schnellere Lieferzeit und profitierst von besten Preisen.<br />

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
                                        className={`px-4 py-2 cursor-pointer text-sm transition-colors ${
                                            category === cat.value 
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
            {!error && displayedData.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedData.map((item) => (
                            <div key={item.id} className="border group border-gray-300 rounded-md bg-white flex flex-col h-full">
                                <Image src={item.image} alt={item.name} className="w-64 mx-auto h-full object-contain p-4" width={500} height={500} />
                                <div className="flex-1 flex flex-col justify-between p-4">
                                    <div>
                                        <div className="font-semibold text-base mb-1 text-left">{item.name}</div>
                                        <div className="text-xs text-gray-500 mb-2 text-left">#{item.ide}</div>
                                        <div className="font-bold text-lg mb-2 text-left">ab {item.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                    </div>
                                    <Button variant="outline" className="w-full cursor-pointer transition-all duration-300 mt-2 rounded-none border border-black bg-white text-black hover:bg-gray-100 text-sm font-medium" onClick={() => handleClick(item.id)}>Jetzt konfigurieren</Button>
                                </div>
                            </div>
                        ))}
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

            {/* No Products Found */}
            {!error && !loading && filteredData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-gray-500 text-lg font-medium mb-2">Keine Produkte gefunden</div>
                    <div className="text-gray-400 text-sm text-center">
                        Es wurden keine Produkte für die ausgewählten Filter gefunden.<br />
                        Versuchen Sie andere Kategorien oder Filter zu verwenden.
                    </div>
                </div>
            )}
        </div>
    );
}
