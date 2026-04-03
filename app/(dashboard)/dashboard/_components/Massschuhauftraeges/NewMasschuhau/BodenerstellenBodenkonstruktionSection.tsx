'use client';

import React from 'react';
import BodenkonstruktionFiledText from './BodenkonstruktionFiledText';

/** Matches URL `status` for Schritt „Bodenerstellen“ (SHOE_STEPS index 6). */
export const BODENERSTELLEN_STEP_STATUS = 'Bodenerstellen';

export interface BodenerstellenBodenkonstruktionSectionProps {
    orderId: string;
    redirectOrderId?: string;
    redirectCustomerId?: string;
    redirectCustomerName?: string;
    bodenkonstruktionInternNote?: string;
    bodenkonstruktionExternNote?: string;
    onBodenkonstruktionInternNoteChange?: (value: string) => void;
    onBodenkonstruktionExternNoteChange?: (value: string) => void;
}

/**
 * Bodenkonstruktion block for the „Bodenerstellen“ step: same UX as step 5 (Intern/Extern, erweitert, GET track, modal).
 */
export default function BodenerstellenBodenkonstruktionSection({
    orderId,
    redirectOrderId,
    redirectCustomerId,
    redirectCustomerName,
    bodenkonstruktionInternNote,
    bodenkonstruktionExternNote,
    onBodenkonstruktionInternNoteChange,
    onBodenkonstruktionExternNoteChange,
}: BodenerstellenBodenkonstruktionSectionProps) {
    return (
        <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bodenerstellen</h3>
            <BodenkonstruktionFiledText
                bodenkonstruktionInternNote={bodenkonstruktionInternNote}
                bodenkonstruktionExternNote={bodenkonstruktionExternNote}
                orderId={orderId}
                redirectOrderId={redirectOrderId}
                redirectCustomerId={redirectCustomerId}
                redirectCustomerName={redirectCustomerName}
                stepStatus={BODENERSTELLEN_STEP_STATUS}
                onBodenkonstruktionInternNoteChange={onBodenkonstruktionInternNoteChange}
                onBodenkonstruktionExternNoteChange={onBodenkonstruktionExternNoteChange}
            />
        </div>
    );
}
