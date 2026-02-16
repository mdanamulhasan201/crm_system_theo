import React from 'react';

interface VersorgungsnotizCardProps {
    versorgung_note: string;
    onVersorgungNoteChange: (value: string) => void;
}

export default function VersorgungsnotizCard({
    versorgung_note,
    onVersorgungNoteChange,
}: VersorgungsnotizCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Versorgungsnotiz</h2>
            
            <textarea
                value={versorgung_note}
                onChange={(e) => onVersorgungNoteChange(e.target.value)}
                placeholder="Anmerkungen zur Versorgung..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
            />
        </div>
    );
}

