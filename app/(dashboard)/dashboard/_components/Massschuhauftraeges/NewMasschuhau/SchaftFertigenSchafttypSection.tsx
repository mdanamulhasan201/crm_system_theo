'use client';

import React from 'react';
import SchafttypFieldText, { type SchafttypValue } from './SchafttypFieldText';

/** Matches URL `status` for Schritt „Schaft fertigen“ (SHOE_STEPS index 5). */
export const SCHAFT_FERTIGEN_STEP_STATUS = 'Schaft_fertigen';

export interface SchaftFertigenSchafttypSectionProps {
    orderId: string;
    redirectOrderId?: string;
    redirectCustomerId?: string;
    redirectCustomerName?: string;
    schafttyp: SchafttypValue;
    schafttypInternNote: string;
    schafttypExternNote: string;
    onSchafttypChange: (value: SchafttypValue) => void;
    onSchafttypInternNoteChange: (value: string) => void;
    onSchafttypExternNoteChange: (value: string) => void;
}

/** Schafttyp block for step „Schaft fertigen“, same behavior as step 5. */
export default function SchaftFertigenSchafttypSection({
    orderId,
    redirectOrderId,
    redirectCustomerId,
    redirectCustomerName,
    schafttyp,
    schafttypInternNote,
    schafttypExternNote,
    onSchafttypChange,
    onSchafttypInternNoteChange,
    onSchafttypExternNoteChange,
}: SchaftFertigenSchafttypSectionProps) {
    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schaft fertigen</h3>
            <SchafttypFieldText
                orderId={orderId}
                redirectOrderId={redirectOrderId}
                redirectCustomerId={redirectCustomerId}
                redirectCustomerName={redirectCustomerName}
                stepStatus={SCHAFT_FERTIGEN_STEP_STATUS}
                schafttyp={schafttyp}
                schafttypInternNote={schafttypInternNote}
                schafttypExternNote={schafttypExternNote}
                onSchafttypChange={onSchafttypChange}
                onSchafttypInternNoteChange={onSchafttypInternNoteChange}
                onSchafttypExternNoteChange={onSchafttypExternNoteChange}
            />
        </div>
    );
}
