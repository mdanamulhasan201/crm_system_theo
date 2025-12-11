'use client'

import React, { useState } from 'react'
import ReusableBalanceTable, { BalanceTableColumn, TableAction } from '@/components/Shared/ReusableBalanceTable'

export interface TransactionData {
    id: string;
    datum: string;
    transaktionsnummer: string;
    beschreibung: string | null;
    einnahmesumme: number;
    feetfirstGebuehren: number | null;
    andere: number | null;
    entgueltigeEinnahmen: string;
    status: string | null;
}

export type TabType = 'einnahmen' | 'ausgaben';

// Sample data matching the design
const sampleEinnahmenData: TransactionData[] = [
    {
        id: '1',
        datum: '01.08.2025',
        transaktionsnummer: 'FE200500OP25',
        beschreibung: null,
        einnahmesumme: 150.00,
        feetfirstGebuehren: 10.00,
        andere: 10.00,
        entgueltigeEinnahmen: '15.08.2025',
        status: null,
    },
    {
        id: '2',
        datum: '01.08.2025',
        transaktionsnummer: 'FE200500OP25',
        beschreibung: null,
        einnahmesumme: 150.00,
        feetfirstGebuehren: 10.00,
        andere: 14.00,
        entgueltigeEinnahmen: '15.08.2025',
        status: null,
    },
    {
        id: '3',
        datum: '01.08.2025',
        transaktionsnummer: 'FE200500OP25',
        beschreibung: null,
        einnahmesumme: 300.00,
        feetfirstGebuehren: 10.00,
        andere: 13.00,
        entgueltigeEinnahmen: '15.08.2025',
        status: null,
    },
    {
        id: '4',
        datum: '01.08.2025',
        transaktionsnummer: 'FE200500OP25',
        beschreibung: null,
        einnahmesumme: 150.00,
        feetfirstGebuehren: 20.00,
        andere: 15.00,
        entgueltigeEinnahmen: '15.08.2025',
        status: null,
    },
    {
        id: '5',
        datum: '10.12.2025',
        transaktionsnummer: 'FE200500OP26',
        beschreibung: 'Halbprob...',
        einnahmesumme: 295.97,
        feetfirstGebuehren: null,
        andere: null,
        entgueltigeEinnahmen: '10.12.25',
        status: 'Abgeschl...',
    },
    {
        id: '6',
        datum: '10.12.2025',
        transaktionsnummer: 'FE200500OP27',
        beschreibung: 'Bodenko...',
        einnahmesumme: 279.97,
        feetfirstGebuehren: null,
        andere: null,
        entgueltigeEinnahmen: '10.12.25',
        status: 'Abgeschl...',
    },
];

const sampleAusgabenData: TransactionData[] = [];

interface DataTablesProps {
    einnahmenData?: TransactionData[];
    ausgabenData?: TransactionData[];
    isLoading?: boolean;
    onShowMore?: (tab: TabType) => void;

    // Optional action handlers - use optional chaining
    onView?: (row: TransactionData) => void;
    onEdit?: (row: TransactionData) => void;
    onDelete?: (row: TransactionData) => void;
    onDownload?: (row: TransactionData) => void;

    // Custom actions (for different pages)
    customActions?: TableAction<TransactionData>[];

    // Custom render for actions (full control)
    renderActions?: (row: TransactionData, rowIndex: number) => React.ReactNode;
}

export default function DataTables({
    einnahmenData = sampleEinnahmenData,
    ausgabenData = sampleAusgabenData,
    isLoading = false,
    onShowMore,
    onView,
    onEdit,
    onDelete,
    onDownload,
    customActions,
    renderActions,
}: DataTablesProps) {
    const [activeTab, setActiveTab] = useState<TabType>('einnahmen');

    const formatCurrency = (value: number | null | undefined): string => {
        if (value === null || value === undefined) {
            return '-';
        }
        return value.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // Build actions array based on provided handlers (optional chaining)
    const buildActions = (): TableAction<TransactionData>[] | undefined => {
        // If custom actions provided, use them
        if (customActions?.length) {
            return customActions;
        }

        // Build actions from individual handlers
        const actions: TableAction<TransactionData>[] = [];

        if (onView) {
            actions.push({
                type: 'view',
                label: 'Ansehen',
                onClick: (row) => onView(row),
            });
        }

        if (onEdit) {
            actions.push({
                type: 'edit',
                label: 'Bearbeiten',
                onClick: (row) => onEdit(row),
            });
        }

        if (onDelete) {
            actions.push({
                type: 'delete',
                label: 'Löschen',
                onClick: (row) => onDelete(row),
            });
        }

        if (onDownload) {
            actions.push({
                type: 'download',
                label: 'Herunterladen',
                onClick: (row) => onDownload(row),
            });
        }

        return actions.length > 0 ? actions : undefined;
    };

    const columns: BalanceTableColumn<TransactionData>[] = [
        {
            key: 'datum',
            header: 'Datum',
            className: 'text-gray-600',
        },
        {
            key: 'transaktionsnummer',
            header: 'Transaktionsnummer',
            className: 'text-blue-600 font-medium',
        },
        {
            key: 'beschreibung',
            header: 'Beschreib...',
            render: (value) => value || '-',
        },
        {
            key: 'einnahmesumme',
            header: 'Einnahmesumme',
            render: (value) => (
                <span className="text-emerald-600 font-medium">
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            key: 'feetfirstGebuehren',
            header: 'FeetF1rst-Gebühren',
            render: (value) => (
                <span className="text-emerald-600">
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            key: 'andere',
            header: 'Andere',
            render: (value) => (
                <span className="text-emerald-600">
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            key: 'entgueltigeEinnahmen',
            header: 'Entgültige Einnah...',
            render: (value) => value || '-',
        },
        {
            key: 'status',
            header: 'Status',
            render: (value) => (
                <span className="text-emerald-600">
                    {value || '-'}
                </span>
            ),
        },
    ];

    const currentData = activeTab === 'einnahmen' ? einnahmenData : ausgabenData;

    const handleShowMore = () => {
        if (onShowMore) {
            onShowMore(activeTab);
        }
    };

    return (
        <div className="mt-8">
            {/* Header */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Filter by Data</h2>

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setActiveTab('einnahmen')}
                    className={`px-6 py-2 rounded-lg font-medium text-sm transition-all border cursor-pointer ${activeTab === 'einnahmen'
                            ? 'bg-white text-emerald-600 border-emerald-500'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}
                >
                    Einnahmen
                </button>
                <button
                    onClick={() => setActiveTab('ausgaben')}
                    className={`px-6 py-2 rounded-lg font-medium text-sm transition-all border cursor-pointer ${activeTab === 'ausgaben'
                            ? 'bg-white text-emerald-600 border-emerald-500'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}
                >
                    Ausgaben
                </button>
            </div>

            {/* Table */}
            <ReusableBalanceTable
                columns={columns}
                data={currentData}
                isLoading={isLoading}
                emptyMessage={activeTab === 'einnahmen' ? 'Keine Einnahmen vorhanden' : 'Keine Ausgaben vorhanden'}
                showMoreButton={currentData?.length > 0}
                onShowMore={handleShowMore}
                showMoreLabel="Mehr anzeigen"
                rowKeyField="id"
                // Optional actions - only shown if handlers are provided
                actions={buildActions()}
                renderActions={renderActions}
            />
        </div>
    );
}
