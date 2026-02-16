import React from 'react';

interface CustomField {
    name: string;
    left: number;
    right: number;
}

interface ZusatzeSectionProps {
    customFields: CustomField[];
    showCustomFields: boolean;
    onToggleCustomFields: () => void;
    onAddField: () => void;
    onDeleteField: (name: string) => void;
    onFieldChange: (name: string, side: 'left' | 'right', value: number) => void;
}

// Default fields that are always shown
const DEFAULT_FIELDS = [
    { name: 'Verkürzungsausgleich', left: 0, right: 0 },
    { name: 'Supination', left: 0, right: 0 },
    { name: 'Pronation', left: 0, right: 0 },
];

export default function ZusatzeSection({
    customFields,
    showCustomFields,
    onToggleCustomFields,
    onAddField,
    onDeleteField,
    onFieldChange,
}: ZusatzeSectionProps) {
    // Get or create default field values from customFields
    const getFieldValue = (fieldName: string) => {
        return customFields.find(f => f.name === fieldName) || { name: fieldName, left: 0, right: 0 };
    };

    // Get additional custom fields (not default ones)
    const additionalFields = customFields.filter(
        field => !DEFAULT_FIELDS.some(df => df.name === field.name)
    );

    const activeCount = customFields.filter(f => f.left !== 0 || f.right !== 0).length;

    return (
        <div className="border-t pt-6 mt-6">
            <div className="border-b">
                <div className="flex items-center justify-between pb-3  border-gray-200">
                    <h3 className="text-base font-bold text-gray-700">Zusätze
                        <span className="text-xs text-gray-500 ms-5">
                            {activeCount > 0 ? `${activeCount} aktiv` : 'Keine aktiv'}
                        </span>
                    </h3>
                </div>

                {/* Bezeichnung Label */}
                <div className="mb-3">
                    <h4 className="text-sm text-gray-600">Bezeichnung</h4>
                </div>
            </div>

            {/* Zusätze List */}
            <div className="mb-4">
                {/* Header Row - Links/Rechts Labels */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 shrink-0"></div> {/* Spacer for star button */}
                    <div className="w-48"></div> {/* Spacer for name */}
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        <div className="text-xs text-gray-600 text-center font-medium">Links</div>
                        <div className="text-xs text-gray-600 text-center font-medium">Rechts</div>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Default Fields */}
                    {DEFAULT_FIELDS.map((defaultField) => {
                        const fieldValue = getFieldValue(defaultField.name);
                        return (
                            <div key={defaultField.name} className="flex items-center gap-3">
                                <button
                                    type="button"
                                    className="text-orange-500 hover:text-orange-600 cursor-pointer text-lg shrink-0 w-8"
                                >
                                    ★
                                </button>
                                <div className="flex items-center gap-2 w-48">
                                    <span className="text-sm font-medium text-gray-700">{defaultField.name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={fieldValue.left}
                                        onChange={(e) => onFieldChange(defaultField.name, 'left', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={fieldValue.right}
                                        onChange={(e) => onFieldChange(defaultField.name, 'right', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-start gap-4">
                <button
                    type="button"
                    onClick={onToggleCustomFields}
                    className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer flex items-center gap-1"
                >
                    <span className={`transition-transform ${showCustomFields ? 'rotate-180' : ''}`}>▼</span>
                    <span>Weitere Zusätze anzeigen {additionalFields.length > 0 && `(${additionalFields.length})`}</span>
                </button>

                {/* Custom Fields - Accordion Content */}
                {showCustomFields && (
                    <div className="w-full space-y-3 pl-0">
                        {additionalFields.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">Keine weiteren Zusätze vorhanden</p>
                        ) : (
                            additionalFields.map((field) => (
                                <div key={field.name} className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => onDeleteField(field.name)}
                                        className="text-red-500 hover:text-red-600 cursor-pointer text-lg shrink-0 w-8"
                                        title="Remove field"
                                    >
                                        ×
                                    </button>
                                    <div className="flex items-center gap-2 w-48">
                                        <span className="text-sm font-medium text-gray-700">{field.name}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 flex-1">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={field.left}
                                            onChange={(e) => onFieldChange(field.name, 'left', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                        />
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={field.right}
                                            onChange={(e) => onFieldChange(field.name, 'right', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <button
                    type="button"
                    onClick={onAddField}
                    className="text-[#61A178] hover:text-[#4A8A5F] text-sm cursor-pointer flex items-center gap-1"
                >
                    <span>+</span>
                    <span>Zusatz hinzufügen</span>
                </button>
            </div>
        </div>
    );
}

