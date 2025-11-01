'use client';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';

import { ChevronDown, Search } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useCustomShafts } from '@/hooks/customShafts/useCustomShafts';
import Loading from '@/components/Shared/Loading';
import useDebounce from '@/hooks/useDebounce';

const categories = [
    { label: 'Alle Kategorien', value: 'alle' },
    { label: 'Formal Shoes', value: 'Formal Shoes' },
    { label: 'Running Shoes', value: 'Running Shoes' },
    { label: 'Casual Shoes', value: 'Casual Shoes' },
    { label: 'Sports Shoes', value: 'Sportschuhe' },
];

export default function CustomShafts() {
    const [gender, setGender] = useState<'Herren' | 'Damen'>('Herren');
    const [category, setCategory] = useState('alle');
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 10;
    const router = useRouter();

    // Debounce search query to reduce API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Fetch data from API
    const { data: apiData, loading, error } = useCustomShafts(currentPage, itemsPerPage, debouncedSearchQuery);

    // Get unique categories from API data
    const availableCategories = useMemo(() => {
        if (!apiData?.data) return categories;

        const uniqueCategories = Array.from(new Set(apiData.data.map(item => item.catagoary)));
        return [
            { label: 'Alle Kategorien', value: 'alle' },
            ...uniqueCategories.map(cat => ({ label: cat, value: cat }))
        ];
    }, [apiData?.data]);

    // Filter data based on gender and category
    const filteredData = useMemo(() => {
        if (!apiData?.data) return [];

        return apiData.data.filter(item => {
            const genderMatch = item.gender === gender;
            const categoryMatch = category === 'alle' || item.catagoary === category;
            return genderMatch && categoryMatch;
        });
    }, [apiData?.data, gender, category]);

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [gender, category, debouncedSearchQuery]);

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
                    <div className="relative mt-1">
                        <button
                            className="flex cursor-pointer items-center text-base md:text-sm font-normal text-black bg-transparent px-0 py-1 focus:outline-none"
                            onClick={() => setCategoryOpen((v) => !v)}
                            type="button"
                        >
                            {availableCategories.find((c) => c.value === category)?.label || 'Alle Kategorien'}
                            <ChevronDown className="ml-1 w-5 h-5" />
                        </button>
                        {categoryOpen && (
                            <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg">
                                {availableCategories.map((cat) => (
                                    <div
                                        key={cat.value}
                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm ${category === cat.value ? 'font-semibold' : ''}`}
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

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <Loading />
                </div>
            )}

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
            {!loading && !error && filteredData.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredData.map((item) => (
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
            )}

            {/* No Products Found */}
            {!loading && !error && filteredData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-gray-500 text-lg font-medium mb-2">Keine Produkte gefunden</div>
                    <div className="text-gray-400 text-sm text-center">
                        Es wurden keine Produkte für die ausgewählten Filter gefunden.<br />
                        Versuchen Sie andere Kategorien oder Filter zu verwenden.
                    </div>
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && apiData?.pagination && apiData.pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            {Array.from({ length: apiData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => setCurrentPage(page)}
                                        className={`cursor-pointer ${currentPage === page ? 'bg-black text-white' : ''}`}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage(prev => Math.min(apiData.pagination.totalPages, prev + 1))}
                                    className={currentPage === apiData.pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
