'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useSingleCustomer } from '@/hooks/customer/useSingleCustomer';
import { useCustomerNote } from '@/hooks/customer/useCustomerNote';
import AddNoteModal from '@/app/(dashboard)/dashboard/_components/Customers/AddNoteModal';
import { cn } from '@/lib/utils';

interface Note {
  id: number;
  text: string;
  category: string;
  timestamp: string;
  hasLink?: boolean;
  url?: string | null;
  apiId?: string;
}

type CategoryType = 'Notizen' | 'Bestellungen' | 'Leistungen' | 'Termin' | 'Zahlungen' | 'E-mails';

const FILTER_TABS = [
  { key: 'Alle', label: 'Alle' },
  { key: 'Bestellungen', label: 'Bestellungen' },
  { key: 'Leistungen', label: 'Leistungen' },
  { key: 'Zahlungen', label: 'Zahlungen' },
  { key: 'Notizen', label: 'Notizen' },
] as const;

const TAG_CONFIG: Record<string, { label: string; className: string }> = {
  Bestellungen: { label: 'BESTELLUNG', className: 'bg-red-500 text-white' },
  Leistungen: { label: 'LEISTUNG', className: 'bg-amber-500 text-white' },
  Zahlungen: { label: 'ZAHLUNG', className: 'bg-teal-500 text-white' },
  Notizen: { label: 'NOTIZ', className: 'bg-blue-500 text-white' },
  Termin: { label: 'TERMIN', className: 'bg-purple-500 text-white' },
  'E-mails': { label: 'E-MAIL', className: 'bg-orange-500 text-white' },
};

function getTagConfig(category: string) {
  return TAG_CONFIG[category] ?? { label: category.toUpperCase(), className: 'bg-gray-500 text-white' };
}

export default function NoteProcess() {
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
    pagination,
  } = useCustomerNote();

  const [activeTab, setActiveTab] = useState<string>('Alle');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editNote, setEditNote] = useState<{
    apiId: string;
    text: string;
    dateISO: string | null;
    category: CategoryType;
  } | null>(null);
  const [hoveredNote, setHoveredNote] = useState<number | null>(null);
  const [firstLoaded, setFirstLoaded] = useState(false);

  useEffect(() => {
    if (scanData?.id) {
      getNotes(scanData.id, 1, 5, '')
        .then((result) => {
          updateLocalNotes(result.notes);
          setFirstLoaded(true);
        })
        .catch((err) => {
          console.error('Error loading notes:', err);
          setFirstLoaded(true);
        });
    }
  }, [scanData?.id, getNotes, updateLocalNotes]);

  useEffect(() => {
    if (!scanData?.id || !firstLoaded) return;
    const category = activeTab === 'Alle' ? '' : activeTab;
    getNotes(scanData.id, 1, 5, category)
      .then((result) => updateLocalNotes(result.notes, false))
      .catch(() => {});
  }, [activeTab, scanData?.id, getNotes, updateLocalNotes, firstLoaded]);

  const filteredDates = getFilteredDates(activeTab === 'Alle' ? 'Diagramm' : activeTab);
  const hasAnyNotes = filteredDates.length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Aktivitäten</h2>
          <button
            onClick={() => {
              setEditNote(null);
              setShowAddForm(true);
            }}
            disabled={loading || !scanData}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#62A17B] hover:bg-[#528c68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0'
            )}
          >
            <Plus className="w-4 h-4" />
            Notiz hinzufügen
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1 mt-4">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'text-[#62A17B] bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4 md:p-5 min-h-[200px]">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {notesError && !isLoadingNotes && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {notesError}
          </div>
        )}
        {isLoadingNotes && !firstLoaded && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#62A17B] border-t-transparent" />
          </div>
        )}

        {!isLoadingNotes && !notesError && firstLoaded && !hasAnyNotes && (
          <div className="py-12 text-center text-gray-500 font-medium">Keine Aktivitäten</div>
        )}

        {!isLoadingNotes && !notesError && firstLoaded && hasAnyNotes && (
          <div className="relative">
            {/* Vertical timeline line — left side, full height */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />

            <div className="space-y-8">
              {filteredDates.map((date) => {
                const notesForDate =
                  activeTab === 'Alle'
                    ? (localNotes[date] || []).sort(
                        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                      )
                    : getNotesForCategory(date, activeTab);

                if (notesForDate.length === 0) return null;

                return (
                  <div key={date} className="flex gap-4">
                    {/* Left: timeline column (circle + line runs through) */}
                    <div className="shrink-0 w-6 flex flex-col items-center pt-0.5">
                      <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-white relative z-1" />
                    </div>

                    {/* Right: date above cards */}
                    <div className="flex-1 min-w-0">
                      {/* Date row — above the cards */}
                      <div className="mb-3">
                        <span className="text-base font-semibold text-gray-900">
                          {formatDisplayDate(date)}
                        </span>
                      </div>
                      {/* Activity cards below the date */}
                      <div className="space-y-3">
                        {notesForDate.map((note: Note) => {
                          const tag = getTagConfig(note.category);
                          const lines = (note.hasLink ? 'Link' : note.text || '—').split('\n').filter(Boolean);
                          const mainText = lines[0] ?? '—';
                          const secondaryText = lines.length > 1 ? lines.slice(1).join(' ') : undefined;
                          return (
                            <div
                              key={note.id}
                              className="relative group rounded-xl border border-gray-200 bg-gray-100 py-5 px-5 hover:shadow transition-shadow w-full"
                              onMouseEnter={() => setHoveredNote(note.id)}
                              onMouseLeave={() => setHoveredNote(null)}
                            >
                              <div className="flex flex-wrap items-baseline gap-2">
                                <span
                                  className={cn(
                                    'inline-flex px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide shrink-0',
                                    tag.className
                                  )}
                                >
                                  {tag.label}
                                </span>
                                <span className="text-sm font-normal text-gray-900">
                                  {mainText}
                                </span>
                              </div>
                              {secondaryText && (
                                <p className="mt-1.5 text-xs text-gray-500 font-normal">
                                  {secondaryText}
                                </p>
                              )}
                              {hoveredNote === note.id && note.category === 'Notizen' && (
                                <button
                                  onClick={() => handleDeleteNote(date, note.id)}
                                  className="absolute cursor-pointer top-3 right-3 p-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Löschen"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {note.category === 'Notizen' && note.apiId && (
                                <button
                                  onClick={() => {
                                    setEditNote({
                                      apiId: note.apiId ?? '',
                                      text: note.text,
                                      dateISO: date,
                                      category: 'Notizen',
                                    });
                                    setShowAddForm(true);
                                  }}
                                  className="absolute cursor-pointer bottom-3 right-3 text-xs text-[#62A17B] hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Bearbeiten
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isLoadingNotes && !notesError && firstLoaded && hasAnyNotes && pagination.hasNextPage && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                if (scanData?.id) {
                  const category = activeTab === 'Alle' ? '' : activeTab;
                  loadMoreNotes(scanData.id, category);
                }
              }}
              disabled={pagination.isLoadingMore}
              className="px-5 py-2 text-sm font-medium text-[#62A17B] bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >
              {pagination.isLoadingMore ? 'Laden...' : 'Mehr laden'}
            </button>
          </div>
        )}
      </div>

      {scanData && (
        <AddNoteModal
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setEditNote(null);
          }}
          customerId={scanData.id}
          editNote={editNote}
          onSuccess={() => {
            if (scanData?.id) {
              getNotes(scanData.id, 1, 5, '').then((result) => updateLocalNotes(result.notes));
            }
          }}
        />
      )}
    </div>
  );
}
