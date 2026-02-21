import React from 'react';
import { X } from 'lucide-react';

interface VersorgungsnotizCardProps {
    versorgungNote: string;
    onVersorgungNoteChange: (value: string) => void;
}

export default function VersorgungsnotizCard({
    versorgungNote,
    onVersorgungNoteChange,
}: VersorgungsnotizCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Versorgungsnotiz</h2>
            <div className="relative">
                <textarea
                    value={versorgungNote}
                    onChange={(e) => onVersorgungNoteChange(e.target.value)}
                    placeholder="Anmerkungen zur Versorgung..."
                    rows={4}
                    className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                />
                {versorgungNote && (
                    <span
                        role="button"
                        tabIndex={-1}
                        onClick={() => onVersorgungNoteChange('')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onVersorgungNoteChange(''); } }}
                        className="absolute right-2 top-3 rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        aria-label="Auswahl löschen"
                    >
                        <X className="h-4 w-4" />
                    </span>
                )}
            </div>
        </div>
    );
}


