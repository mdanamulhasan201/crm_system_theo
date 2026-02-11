import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import AddNoteModal from '@/app/(dashboard)/dashboard/_components/Customers/AddNoteModal';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSingleCustomer } from '@/hooks/customer/useSingleCustomer';
import { useCustomerNote } from '@/hooks/customer/useCustomerNote';

// Extend the Note interface to match the hook
interface Note {
    id: number;
    text: string;
    category: string;
    timestamp: string;
    hasLink?: boolean;
    url?: string | null;
    apiId?: string;
}

const CATEGORIES = [
    'Diagramm',
    'Notizen',
    'Bestellungen',
    'Leistungen',
    'Termin',
    'Zahlungen',
    'E-mails'
];

type CategoryType = 'Notizen' | 'Bestellungen' | 'Leistungen' | 'Termin' | 'Zahlungen' | 'E-mails';

const CATEGORY_COLORS: Record<CategoryType, string> = {
    'Notizen': 'bg-blue-500',
    'Bestellungen': 'bg-red-500',
    'Leistungen': 'bg-yellow-500',
    'Termin': 'bg-purple-500',
    'Zahlungen': 'bg-teal-500',
    'E-mails': 'bg-orange-500'
};




export default function NoteCalendar() {
    const params = useParams();
    const { customer: scanData, loading, error } = useSingleCustomer(String(params.id));
    const {
        localNotes,
        getNotes,
        isLoadingNotes,
        error: notesError,
        getNotesForCategory,
        getFilteredDates,
        formatDisplayDate,
        isToday,
        handleDeleteNote,
        updateLocalNotes,
        loadMoreNotes,
        pagination
    } = useCustomerNote();

    const [activeTab, setActiveTab] = useState<string>('Diagramm');
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [editNote, setEditNote] = useState<{ apiId: string; text: string; dateISO: string | null; category: CategoryType } | null>(null);
    const [hoveredNote, setHoveredNote] = useState<number | null>(null);
    const [isRefreshingTab, setIsRefreshingTab] = useState<boolean>(false);
    const [firstLoaded, setFirstLoaded] = useState<boolean>(false);

    // Fetch notes when component mounts or customer changes
    useEffect(() => {
        if (scanData?.id) {
            getNotes(scanData.id, 1, 5, '').then((result) => {
                updateLocalNotes(result.notes);
                setFirstLoaded(true);
            }).catch((err) => {
                console.error('Error loading notes:', err);
                setFirstLoaded(true);
            });
        }
    }, [scanData?.id, getNotes, updateLocalNotes]);

    // Background refresh on tab change: keep table visible from cache, show small spinner on tab
    useEffect(() => {
        if (!scanData?.id || !firstLoaded) return; // Wait for initial load
        
        setIsRefreshingTab(true);
        // For Diagramm tab, fetch all notes (empty category). For other tabs, fetch filtered by category
        const category = activeTab === 'Diagramm' ? '' : activeTab;
        getNotes(scanData.id, 1, 5, category)
            .then((result) => {
                updateLocalNotes(result.notes, false); // Replace data when switching tabs
            })
            .finally(() => setIsRefreshingTab(false));
    }, [activeTab, scanData?.id, getNotes, updateLocalNotes, firstLoaded]);


    return (
        <div className=" ">
            <div className="flex flex-col xl:flex-row gap-5 items-center justify-between mb-6 w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-1 bg-gray-100 p-1 rounded-lg w-full xl:w-9/12">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveTab(category)}
                            className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors relative ${activeTab === category
                                ? 'bg-white text-[#62A17B] shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className='xl:w-3/12 flex justify-end items-center w-full'>
                    <button
                        onClick={() => {
                            setEditNote(null);
                            setShowAddForm(true);
                        }}
                        disabled={loading || !scanData}
                        className={`border bg-[#62A17B] gap-2 text-white hover:bg-white hover:text-[#62A17B] cursor-pointer px-4 py-2 rounded-lg flex items-center  transform duration-300 ${(loading || !scanData) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <div className='border border-white rounded-full p-1 '>
                            <Plus size={20} />
                        </div>
                        {loading ? 'Loading...' : 'Notiz hinzufügen'}
                    </button>
                </div>
            </div>


            {/* table */}
            <ScrollArea className="w-full">
                <Table className="border border-gray-500 table-fixed w-full min-w-[1100px]">
                    <TableHeader>
                        <TableRow className="border border-gray-500">
                            <TableHead className="border border-gray-500">Datum</TableHead>
                            <TableHead className="border border-gray-600">Notizen</TableHead>
                            <TableHead className="border border-gray-500">Bestellungen</TableHead>
                            <TableHead className="border border-gray-500">Leistungen</TableHead>
                            <TableHead className="border border-gray-500">Termin</TableHead>
                            <TableHead className="border border-gray-500">Zahlungen</TableHead>
                            <TableHead className="border border-gray-500">E-mails</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {error && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="text-red-700 font-semibold mb-1">Customer Error:</div>
                                        <div className="text-red-600 text-sm">{error}</div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {isLoadingNotes && !firstLoaded && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                                        <div className="text-black font-semibold">Loading notes...</div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Removed refresh spinner - show cached data while refreshing */}

                        {notesError && !isLoadingNotes && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="text-red-700 font-semibold mb-1">Notes Error:</div>
                                        <div className="text-red-600 text-sm">{notesError}</div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoadingNotes && !notesError && (() => {
                            const todayDate = new Date().toISOString().split('T')[0];
                            const todayNotes = localNotes[todayDate] || [];
                            const hasTodayNotes = activeTab === 'Diagramm' 
                                ? todayNotes.length > 0 
                                : todayNotes.some((note: any) => note.category === activeTab);
                            
                            return hasTodayNotes && (
                            <TableRow className="bg-blue-50">
                                <TableCell className="border border-gray-500">
                                    <div className="text-black px-2 py-1 rounded text-sm font-medium">
                                        Heute
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {formatDisplayDate(todayDate)}
                                    </div>
                                </TableCell>
                                {['Notizen', 'Bestellungen', 'Leistungen', 'Termin', 'Zahlungen', 'E-mails'].map((category) => {
                                    const notesForCategory = getNotesForCategory(todayDate, category);
                                    return (
                                    <TableCell key={category} className="border min-h-[80px] border-gray-500 align-top overflow-hidden">
                                        {(activeTab === 'Diagramm' || activeTab === category) &&
                                            notesForCategory.map((note: Note) => (
                                                <div
                                                    key={note.id}
                                                    className="relative group mb-2"
                                                    onMouseEnter={() => setHoveredNote(note.id)}
                                                    onMouseLeave={() => setHoveredNote(null)}
                                                >
                                                    <button
                                                        className={`text-left w-auto text-xs p-2 rounded text-white ${CATEGORY_COLORS[note.category as CategoryType]} cursor-pointer whitespace-pre-wrap break-all inline-block max-w-full md:max-w-[260px]`}
                                                        onClick={() => {
                                                            if (note.category === 'Notizen' && note.apiId) {
                                                                setEditNote({
                                                                    apiId: note.apiId,
                                                                    text: note.text,
                                                                    dateISO: new Date().toISOString().split('T')[0],
                                                                    category: 'Notizen'
                                                                });
                                                                setShowAddForm(true);
                                                            }
                                                        }}
                                                    >
                                                        {note.hasLink ? 'Link' : note.text}
                                                    </button>
                                                    {hoveredNote === note.id && note.category === 'Notizen' && (
                                                        <button
                                                            onClick={() => handleDeleteNote(new Date().toISOString().split('T')[0], note.id)}
                                                            className="absolute  -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </TableCell>
                                )})}
                            </TableRow>
                            );
                        })()}

                        {!isLoadingNotes && !notesError && firstLoaded && (() => {
                            // Get all dates that have notes (for the active tab)
                            const allDatesForTab = getFilteredDates(activeTab);
                            const todayDate = new Date().toISOString().split('T')[0];
                            const todayNotes = localNotes[todayDate] || [];
                            
                            // Check if there are any notes at all for the active tab
                            const hasTodayNotes = activeTab === 'Diagramm' 
                                ? todayNotes.length > 0 
                                : todayNotes.some((note: any) => note.category === activeTab);
                            
                            // Check if there are other dates (excluding today)
                            const otherDates = allDatesForTab.filter(date => !isToday(date));
                            const hasOtherDates = otherDates.length > 0;
                            
                            const hasAnyNotes = hasTodayNotes || hasOtherDates;
                            
                            // Show "Data not found" if:
                            // 1. Data has been loaded (firstLoaded is true)
                            // 2. No notes exist for the active tab (empty API response or no matching notes)
                            if (!hasAnyNotes) {
                                return (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500 font-semibold">
                                            Data not found
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                            
                            return null; // Data exists, let other render blocks handle it
                        })()}


                        {!isLoadingNotes && !notesError && (() => {
                            const allDates = getFilteredDates(activeTab);
                            const filteredDates = allDates.filter(date => !isToday(date));

                            // Render date rows if we have dates
                            if (filteredDates.length === 0) {
                                return null;
                            }

                            return filteredDates.map((date) => (
                                <TableRow key={date}>
                                    <TableCell className="border border-gray-500">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatDisplayDate(date)}
                                        </div>
                                    </TableCell>
                                    {['Notizen', 'Bestellungen', 'Leistungen', 'Termin', 'Zahlungen', 'E-mails'].map((category) => {
                                        const notesForCategory = getNotesForCategory(date, category);

                                        return (
                                            <TableCell key={category} className="border min-h-[80px] border-gray-500 align-top overflow-hidden">
                                                {(activeTab === 'Diagramm' || activeTab === category) &&
                                                    notesForCategory.map((note: Note) => (
                                                        <div
                                                            key={note.id}
                                                            className="relative group mb-2"
                                                            onMouseEnter={() => setHoveredNote(note.id)}
                                                            onMouseLeave={() => setHoveredNote(null)}
                                                        >
                                                            <button
                                                                className={`text-left w-auto text-xs p-2 rounded text-white ${CATEGORY_COLORS[note.category as CategoryType]} cursor-pointer whitespace-pre-wrap break-all inline-block max-w-full md:max-w-[260px]`}
                                                                onClick={() => {
                                                                    if (note.category === 'Notizen' && note.apiId) {
                                                                        setEditNote({
                                                                            apiId: note.apiId,
                                                                            text: note.text,
                                                                            dateISO: date,
                                                                            category: 'Notizen'
                                                                        });
                                                                        setShowAddForm(true);
                                                                    }
                                                                }}
                                                            >
                                                                {note.hasLink ? 'Link' : note.text}
                                                            </button>
                                                            {hoveredNote === note.id && note.category === 'Notizen' && (
                                                                <button
                                                                    onClick={() => handleDeleteNote(date, note.id)}
                                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))
                                                }
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ));
                        })()}

                    </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Load More Button */}
            {!isLoadingNotes && !notesError && firstLoaded && pagination.hasNextPage && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => {
                            if (scanData?.id) {
                                const category = activeTab === 'Diagramm' ? '' : activeTab;
                                loadMoreNotes(scanData.id, category);
                            }
                        }}
                        disabled={pagination.isLoadingMore}
                        className="px-6 py-2 bg-[#62A17B] text-white rounded-lg hover:bg-[#528c68] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {pagination.isLoadingMore ? 'Loading...' : 'See More'}
                    </button>
                </div>
            )}

            {scanData && (
                <AddNoteModal
                    isOpen={showAddForm}
                    onClose={() => { setShowAddForm(false); setEditNote(null); }}
                    customerId={scanData.id}
                    editNote={editNote}
                    onSuccess={() => {
                        if (scanData?.id) {
                            // Single refresh for all tabs to keep cache warm
                            getNotes(scanData.id, 1, 5, '').then((result) => {
                                updateLocalNotes(result.notes);
                            });
                        }
                    }}
                />
            )}
        </div>
    );
}