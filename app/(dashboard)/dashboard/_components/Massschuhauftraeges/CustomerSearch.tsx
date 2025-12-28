'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { searchCustomers, getSingleCustomer } from '@/apis/customerApis';
import useDebounce from '@/hooks/useDebounce';

interface CustomerData {
    id: string;
    customerNumber: number;
    name?: string; 
    vorname?: string;
    nachname?: string;
    email: string;
    geburtsdatum: string;
    wohnort?: string;
    location?: string;
    telefon?: string;
    phone?: string; 
    ausfuhrliche_diagnose?: string;
    createdAt?: string;
    profileImage?: string;
    image?: string;
}

interface SuggestionItem {
    id: string;
    name: string;
    email: string;
    geburtsdatum: string;
    customerNumber: number;
    location: string;
}

type SelectedOrderInfo = {
    arztliche_diagnose?: string;
    usführliche_diagnose?: string;
    note?: string;
    express?: boolean;
};

export default function CustomerSearch({ onCustomerSelect, onCustomerIdSelect, selectedOrder, onSetExpressStatus, initialCustomerId }: { onCustomerSelect?: (customer: CustomerData | null) => void; onCustomerIdSelect?: (customerId: string | null) => void; selectedOrder?: SelectedOrderInfo | null; onSetExpressStatus?: (express: boolean) => Promise<void>; initialCustomerId?: string | null }) {
    const [name, setName] = useState('');
    const [birth, setBirth] = useState('');
    const [customerNumber, setCustomerNumber] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [imageError, setImageError] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [expressLoading, setExpressLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    const debouncedName = useDebounce(name, 300);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const normalizeCustomer = (customer: any): CustomerData => ({
        ...customer,
        name: customer.name || `${customer.vorname || ''} ${customer.nachname || ''}`.trim(),
        wohnort: customer.location || customer.wohnort,
    });

    useEffect(() => {
        if (!debouncedName || debouncedName.length <= 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const fetchSuggestions = async () => {
            setSuggestionLoading(true);
            try {
                const response = await searchCustomers(debouncedName, 1, 10, debouncedName, '', '', '', '');
                const customers = response?.data?.customers || response?.data || [];
                if (customers.length > 0) {
                    const mappedSuggestions = customers.map((customer: any) => ({
                        id: customer.id,
                        name: customer.name || `${customer.vorname || ''} ${customer.nachname || ''}`.trim(),
                        email: customer.email || '',
                        geburtsdatum: customer.geburtsdatum || '',
                        customerNumber: customer.customerNumber || 0,
                        location: customer.location || customer.wohnort || '',
                    }));
                    setSuggestions(mappedSuggestions);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setSuggestionLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedName]);

    const handleSuggestionSelect = (suggestion: SuggestionItem) => {
        setName(suggestion.name);
        setBirth(suggestion.geburtsdatum ? new Date(suggestion.geburtsdatum).toLocaleDateString('de-DE') : '');
        setCustomerNumber(suggestion.customerNumber.toString());
        setSelectedCustomerId(suggestion.id);
        setShowSuggestions(false);
        setSuggestions([]);
        setNotFound(false);
    };

    const handleSearchClick = async () => {
        if (!name && !birth && !customerNumber) return;
        setNotFound(false);
        selectedCustomerId ? await handleSearchById(selectedCustomerId) : await performSearch();
    };

    const performSearch = async () => {
        setSearchLoading(true);
        setNotFound(false);
        try {
            const response = await searchCustomers(name || birth || customerNumber, 1, 10, name, '', '', birth, customerNumber);
            const customers = response?.data?.customers || response?.data || [];
            if (customers.length > 0) {
                const customer = customers[0];
                const fullCustomer = customer.id ? await fetchCustomerById(customer.id) : null;
                const finalCustomer = fullCustomer || normalizeCustomer(customer);
                setSelectedCustomer(finalCustomer);
                setNotes(finalCustomer.ausfuhrliche_diagnose || '');
                setNotFound(false);
            } else {
                setSelectedCustomer(null);
                setNotFound(true);
            }
        } catch (error) {
            console.error('Error searching customers:', error);
            setSelectedCustomer(null);
            setNotFound(true);
        } finally {
            setSearchLoading(false);
        }
    };

    const fetchCustomerById = async (customerId: string): Promise<CustomerData | null> => {
        try {
            const response = await getSingleCustomer(customerId);
            const customer = Array.isArray((response as any)?.data)
                ? (response as any).data[0]
                : Array.isArray(response)
                    ? (response as any)[0]
                    : (response as any)?.data ?? response;
            return customer ? normalizeCustomer(customer) : null;
        } catch (error) {
            console.error('Error fetching customer:', error);
            return null;
        }
    };

    const handleSearchById = async (customerId: string) => {
        setSearchLoading(true);
        setNotFound(false);
        try {
            const customer = await fetchCustomerById(customerId);
            if (customer) {
                setSelectedCustomer(customer);
                setNotes(customer.ausfuhrliche_diagnose || '');
                setNotFound(false);
            } else {
                setSelectedCustomer(null);
                setNotFound(true);
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
            setSelectedCustomer(null);
            setNotFound(true);
        } finally {
            setSearchLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('de-DE');
        } catch {
            return dateString;
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                nameInputRef.current &&
                !nameInputRef.current.contains(event.target as Node) &&
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!selectedCustomer) {
            setNotes('');
            setImageError(false);
        } else {
            setImageError(false);
        }
    }, [selectedCustomer]);

    useEffect(() => {
        if (!name && !birth && !customerNumber) {
            setSelectedCustomerId(null);
        }
    }, [name, birth, customerNumber]);

    useEffect(() => {
        onCustomerSelect?.(selectedCustomer);
        onCustomerIdSelect?.(selectedCustomer?.id || null);
    }, [selectedCustomer, onCustomerSelect, onCustomerIdSelect]);

    useEffect(() => {
        if (initialCustomerId && initialCustomerId !== selectedCustomerId && !selectedCustomer) {
            const fetchAndPopulateCustomer = async () => {
                setInitialLoading(true);
                try {
                    const customer = await fetchCustomerById(initialCustomerId);
                    if (customer) {
                        setName(customer.name || `${customer.vorname || ''} ${customer.nachname || ''}`.trim());
                        setBirth(customer.geburtsdatum ? new Date(customer.geburtsdatum).toLocaleDateString('de-DE') : '');
                        setCustomerNumber(customer.customerNumber?.toString() || '');
                        setSelectedCustomerId(customer.id);
                        setSelectedCustomer(customer);
                        setNotes(customer.ausfuhrliche_diagnose || '');
                        setNotFound(false);
                    }
                } catch (error) {
                    console.error('Failed to fetch customer by ID:', error);
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchAndPopulateCustomer();
        }
    }, [initialCustomerId, selectedCustomerId, selectedCustomer]);

    useEffect(() => {
        setNotes(selectedOrder?.note || '');
    }, [selectedOrder]);

    const handleClear = () => {
        setName('');
        setBirth('');
        setCustomerNumber('');
        setSelectedCustomer(null);
        setSuggestions([]);
        setShowSuggestions(false);
        setNotes('');
        setNotFound(false);
        setSelectedCustomerId(null);
        setImageError(false);
        onCustomerSelect?.(null);
        onCustomerIdSelect?.(null);
    };

    return (
        <section className="space-y-6 mt-10 h-full">
            <h1 className="text-center text-3xl font-semibold text-slate-900">
                Auftragssuche
            </h1>


            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 rounded-lg bg-white md:items-center md:gap-4">
                <div className="flex-1 relative" ref={nameInputRef}>
                    <label>
                        <span className="sr-only">Name</span>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => {
                                if (suggestions.length > 0) {
                                    setShowSuggestions(true);
                                }
                            }}
                            className="w-full rounded-2xl border border-[#d7e4ef] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61A175] focus:ring-2 focus:ring-[#61A175]/30"
                        />
                    </label>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (suggestions.length > 0 || suggestionLoading) && (
                        <div
                            ref={suggestionsRef}
                            className="absolute z-50 w-full mt-1 bg-white border border-[#d7e4ef] rounded-2xl shadow-lg max-h-60 overflow-y-auto"
                        >
                            {suggestionLoading ? (
                                <div className="px-4 py-3 flex items-center justify-center">
                                    <svg className="animate-spin h-4 w-4 text-[#61A175]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    <span className="ml-2 text-sm text-slate-500">Suche...</span>
                                </div>
                            ) : (
                                suggestions.map((suggestion) => (
                                    <div
                                        key={suggestion.id}
                                        className="px-4 py-3 hover:bg-[#61A175]/10 cursor-pointer border-b border-[#e2eef2] last:border-b-0 transition"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleSuggestionSelect(suggestion);
                                        }}
                                    >
                                        <div className="font-semibold text-sm text-slate-900">
                                            {suggestion.name}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {suggestion.email && <span>Email: {suggestion.email}</span>}
                                            {suggestion.geburtsdatum && (
                                                <span className="ml-2">
                                                    Geburtsdatum: {new Date(suggestion.geburtsdatum).toLocaleDateString('de-DE')}
                                                </span>
                                            )}
                                            {suggestion.customerNumber && (
                                                <span className="ml-2">
                                                    Kundennummer: {suggestion.customerNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <label className="flex-1">
                    <span className="sr-only">Geburtsdatum</span>
                    <input
                        type="text"
                        placeholder="Geburtsdatum"
                        value={birth}
                        onChange={(e) => setBirth(e.target.value)}
                        className="w-full rounded-2xl border border-[#d7e4ef] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61A175] focus:ring-2 focus:ring-[#61A175]/30"
                    />
                </label>

                <label className="flex-1">
                    <span className="sr-only">Kundennummer</span>
                    <input
                        type="text"
                        placeholder="Kundennummer"
                        value={customerNumber}
                        onChange={(e) => setCustomerNumber(e.target.value)}
                        className="w-full rounded-2xl border border-[#d7e4ef] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61A175] focus:ring-2 focus:ring-[#61A175]/30"
                    />
                </label>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleSearchClick}
                        disabled={searchLoading}
                        className="rounded-lg bg-[#61A175] px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#61A175]/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {searchLoading ? 'Suche...' : 'Suchen'}
                    </button>
                    {(name || birth || customerNumber || selectedCustomer) && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="rounded-lg border border-[#d7e4ef] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-[#61A175] cursor-pointer flex items-center justify-center"
                            title="Suche zurücksetzen"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </form>

            {(searchLoading || initialLoading) ? (
                <div className="flex flex-col lg:flex-row gap-6 bg-white w-full mt-10">
                    <div className="rounded-3xl border border-[#e2eef2] p-6 w-full lg:w-4/12">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mb-4"></div>
                            <div className="h-6 bg-gray-200 animate-pulse rounded w-32 mb-2"></div>
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-24 mb-2"></div>
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-28"></div>
                            <div className="mt-6 w-full space-y-3">
                                <div className="h-10 bg-gray-200 animate-pulse rounded-xl"></div>
                                <div className="h-10 bg-gray-200 animate-pulse rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full lg:w-8/12">
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-32 mb-4"></div>
                        <div className="h-40 bg-gray-200 animate-pulse rounded-2xl"></div>
                        <div className="flex justify-between items-center mt-4">
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-48"></div>
                            <div className="flex gap-4">
                                <div className="h-10 bg-gray-200 animate-pulse rounded-xl w-32"></div>
                                <div className="h-10 bg-gray-200 animate-pulse rounded-xl w-32"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (selectedCustomer || notFound) && (
                <div className="flex flex-col lg:flex-row gap-6 bg-white w-full mt-10">
                    {notFound ? (
                        <div className="rounded-3xl border border-[#e2eef2] p-6 text-center w-full lg:w-4/12">
                            <div className="flex flex-col items-center justify-center h-full">
                                <p className="text-lg font-semibold text-slate-700 mb-2">Kein Kunde gefunden</p>
                                <p className="text-sm text-slate-500">Bitte versuchen Sie es mit anderen Suchkriterien</p>
                            </div>
                        </div>
                    ) : selectedCustomer ? (
                        <>
                            <div className="rounded-3xl border border-[#e2eef2] p-6 text-center w-full lg:w-4/12">
                                <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-emerald-100 bg-emerald-50 flex items-center justify-center">
                                    {(selectedCustomer.profileImage || selectedCustomer.image) && !imageError ? (
                                        <Image
                                            src={selectedCustomer.profileImage || selectedCustomer.image || ''}
                                            width={80}
                                            height={80}
                                            alt={selectedCustomer.name || 'Customer'}
                                            className="h-full w-full object-cover"
                                            onError={() => {
                                                setImageError(true);
                                            }}
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-[#61A175]">
                                            {(selectedCustomer.name || selectedCustomer.vorname || 'C')[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                                    {selectedCustomer.name || `${selectedCustomer.vorname || ''} ${selectedCustomer.nachname || ''}`.trim()}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Beauftragt am{' '}
                                    <span className="font-semibold text-slate-700">
                                        {formatDate(selectedCustomer.createdAt)}
                                    </span>
                                </p>
                                <p className="text-sm text-slate-500">
                                    Ort:{' '}
                                    <span className="font-semibold text-slate-700">
                                        {selectedCustomer.location || selectedCustomer.wohnort || 'N/A'}
                                    </span>
                                </p>

                                <div className="mt-6 space-y-3">
                                    <button className="w-full rounded-xl bg-[#61A175] py-3 text-sm font-semibold text-white transition hover:bg-[#61A175]/80 cursor-pointer">
                                        Scan ansehen
                                    </button>
                                    <button className="w-full rounded-xl border border-[#61A175] py-3 text-sm font-semibold text-[#61A175] transition hover:bg-[#61A175]/10 cursor-pointer">
                                        Kundendaten ansehen
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 w-full lg:w-8/12">
                                <div className="flex flex-col gap-2 text-sm text-slate-800 sm:flex-row sm:gap-4">
                                    <button
                                        className="text-left underline underline-offset-4 hover:text-[#61A175] cursor-pointer"
                                        onClick={() => {
                                            setModalTitle('Ärztliche Diagnose');
                                            setModalContent(selectedOrder?.arztliche_diagnose || 'Keine Daten verfügbar');
                                            setShowModal(true);
                                        }}
                                    >
                                        Ärztliche Diagnose öffnen
                                    </button>
                                    <button
                                        className="text-left underline underline-offset-4 hover:text-[#61A175] cursor-pointer"
                                        onClick={() => {
                                            setModalTitle('Diagnose');
                                            setModalContent(selectedOrder?.usführliche_diagnose || 'Keine Daten verfügbar');
                                            setShowModal(true);
                                        }}
                                    >
                                        Diagnose
                                    </button>
                                </div>

                                <div>
                                    <p className="text-base font-semibold text-slate-700">
                                        Notizen:
                                    </p>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Notizen"
                                        className="mt-2 h-40 w-full resize-none rounded-2xl border border-[#d7e4ef] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61A175] focus:ring-2 focus:ring-[#61A175]/30"
                                    />
                                </div>

                                <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Wenn eine Korrektur nötig ist: In welchem Bereich?
                                        </p>
                                        <button
                                            className="mt-2 text-sm underline underline-offset-4 hover:text-[#61A175] cursor-pointer"
                                            onClick={() => {
                                                setModalTitle('Ärztliche Diagnose');
                                                setModalContent(selectedOrder?.arztliche_diagnose || 'Keine Daten verfügbar');
                                                setShowModal(true);
                                            }}
                                        >
                                            Ärztliche Diagnose öffnen
                                        </button>
                                    </div>

                                    <div className="flex sm:flex-col md:flex-row gap-4">
                                        <button
                                            disabled={expressLoading}
                                            onClick={async () => {
                                                if (selectedOrder?.express === false) return;
                                                if (!onSetExpressStatus) return;
                                                try {
                                                    setExpressLoading(true);
                                                    await onSetExpressStatus(false);
                                                } finally {
                                                    setExpressLoading(false);
                                                }
                                            }}
                                            className={`rounded-xl px-10 py-3 text-sm font-semibold uppercase transition cursor-pointer ${selectedOrder?.express
                                                    ? 'border border-[#61A175] text-[#61A175] hover:bg-[#61A175]/10 bg-white'
                                                    : 'bg-[#61A175] text-white hover:bg-[#61A175]/80'
                                                } ${expressLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            Standard
                                        </button>
                                        <button
                                            disabled={expressLoading}
                                            onClick={async () => {
                                                if (selectedOrder?.express === true) return;
                                                if (!onSetExpressStatus) return;
                                                try {
                                                    setExpressLoading(true);
                                                    await onSetExpressStatus(true);
                                                } finally {
                                                    setExpressLoading(false);
                                                }
                                            }}
                                            className={`rounded-xl px-10 py-3 text-sm font-semibold uppercase transition cursor-pointer ${selectedOrder?.express
                                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                                    : 'border border-red-500 text-red-500 hover:bg-red-50'
                                                } ${expressLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            Expressauftrag
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">{modalTitle}</h3>
                            </div>
                            <button
                                type="button"
                                className="text-slate-500 hover:text-slate-700 cursor-pointer"
                                onClick={() => setShowModal(false)}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="mt-4 max-h-72 overflow-y-auto text-sm text-slate-700 whitespace-pre-wrap">
                            {modalContent || 'Keine Daten verfügbar'}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="rounded-lg bg-[#61A175] px-4 py-2 text-sm font-semibold text-white hover:bg-[#61A175]/80 cursor-pointer"
                            >
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
