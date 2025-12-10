'use client'

import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiDownload, FiCopy } from 'react-icons/fi'

// Column definition
export interface BalanceTableColumn<T> {
    key: keyof T | string;
    header: string;
    width?: string;
    render?: (value: any, row: T, rowIndex: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

// Action button types
export type ActionType = 'view' | 'edit' | 'delete' | 'download' | 'copy' | 'custom';

export interface TableAction<T> {
    type: ActionType;
    label?: string;
    icon?: React.ReactNode;
    onClick: (row: T, rowIndex: number) => void;
    className?: string;
    show?: (row: T) => boolean; // Optional: conditionally show action
    disabled?: (row: T) => boolean; // Optional: conditionally disable action
}

// Props interface
interface ReusableBalanceTableProps<T> {
    // Required
    columns: BalanceTableColumn<T>[];
    data: T[];
    
    // Optional - Loading & Empty states
    isLoading?: boolean;
    loadingRows?: number;
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
    
    // Optional - Actions column
    actions?: TableAction<T>[];
    actionsHeader?: string;
    actionsColumnWidth?: string;
    renderActions?: (row: T, rowIndex: number) => React.ReactNode; // Custom actions render
    
    // Optional - Show more / Pagination
    showMoreButton?: boolean;
    onShowMore?: () => void;
    showMoreLabel?: string;
    showMoreLoading?: boolean;
    
    // Optional - Row configuration
    rowKeyField?: keyof T;
    onRowClick?: (row: T, rowIndex: number) => void;
    rowClassName?: string | ((row: T, rowIndex: number) => string);
    
    // Optional - Table styling
    tableClassName?: string;
    headerClassName?: string;
    containerClassName?: string;
}

// Default action icons
const defaultActionIcons: Record<ActionType, React.ReactNode> = {
    view: <FiEye className="w-4 h-4" />,
    edit: <FiEdit2 className="w-4 h-4" />,
    delete: <FiTrash2 className="w-4 h-4" />,
    download: <FiDownload className="w-4 h-4" />,
    copy: <FiCopy className="w-4 h-4" />,
    custom: <FiMoreVertical className="w-4 h-4" />,
};

// Default action styles
const defaultActionStyles: Record<ActionType, string> = {
    view: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
    edit: 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50',
    delete: 'text-red-500 hover:text-red-700 hover:bg-red-50',
    download: 'text-purple-600 hover:text-purple-800 hover:bg-purple-50',
    copy: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
    custom: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
};

export default function ReusableBalanceTable<T extends Record<string, any>>({
    // Required
    columns,
    data,
    
    // Loading & Empty states
    isLoading = false,
    loadingRows = 5,
    emptyMessage = 'Keine Daten verfügbar',
    emptyIcon,
    
    // Actions
    actions,
    actionsHeader = 'Aktionen',
    actionsColumnWidth = '120px',
    renderActions,
    
    // Show more
    showMoreButton = false,
    onShowMore,
    showMoreLabel = 'Mehr anzeigen',
    showMoreLoading = false,
    
    // Row config
    rowKeyField,
    onRowClick,
    rowClassName,
    
    // Table styling
    tableClassName,
    headerClassName,
    containerClassName,
}: ReusableBalanceTableProps<T>) {
    
    // Get cell value with optional render function
    const getCellValue = (row: T, column: BalanceTableColumn<T>, rowIndex: number) => {
        if (column.render) {
            const value = typeof column.key === 'string' && column.key in row 
                ? row[column.key as keyof T] 
                : undefined;
            return column.render(value, row, rowIndex);
        }
        
        const value = row?.[column.key as keyof T];
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        return String(value);
    };

    // Get row key
    const getRowKey = (row: T, rowIndex: number): string | number => {
        if (rowKeyField && row?.[rowKeyField] !== undefined) {
            return String(row[rowKeyField]);
        }
        return rowIndex;
    };

    // Get row class name
    const getRowClassName = (row: T, rowIndex: number): string => {
        const baseClass = 'border-b border-gray-100 hover:bg-gray-50/50 transition-colors';
        const clickableClass = onRowClick ? 'cursor-pointer' : '';
        
        if (typeof rowClassName === 'function') {
            return `${baseClass} ${clickableClass} ${rowClassName(row, rowIndex)}`;
        }
        return `${baseClass} ${clickableClass} ${rowClassName || ''}`;
    };

    // Check if actions column should be shown
    const hasActions = (actions && actions.length > 0) || renderActions;

    // Render action buttons
    const renderActionButtons = (row: T, rowIndex: number) => {
        // Custom render takes priority
        if (renderActions) {
            return renderActions(row, rowIndex);
        }

        if (!actions?.length) return null;

        return (
            <div className="flex items-center gap-1 justify-end">
                {actions.map((action, actionIndex) => {
                    // Check if action should be shown
                    const shouldShow = action.show ? action.show(row) : true;
                    if (!shouldShow) return null;

                    // Check if action is disabled
                    const isDisabled = action.disabled ? action.disabled(row) : false;

                    const icon = action.icon || defaultActionIcons[action.type];
                    const style = action.className || defaultActionStyles[action.type];

                    return (
                        <button
                            key={actionIndex}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isDisabled) {
                                    action.onClick(row, rowIndex);
                                }
                            }}
                            disabled={isDisabled}
                            className={`p-2 rounded-lg transition-colors ${style} ${
                                isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title={action.label}
                        >
                            {icon}
                        </button>
                    );
                })}
            </div>
        );
    };

    // Total columns count (including actions if present)
    const totalColumns = columns.length + (hasActions ? 1 : 0);

    // Loading shimmer
    if (isLoading) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${containerClassName || ''}`}>
                <Table className={tableClassName}>
                    <TableHeader>
                        <TableRow className={`bg-gray-50 border-b border-gray-200 ${headerClassName || ''}`}>
                            {columns.map((column, idx) => (
                                <TableHead 
                                    key={idx}
                                    className={`font-semibold text-gray-600 text-sm py-4 ${column.headerClassName || ''}`}
                                    style={{ width: column.width }}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                            {hasActions && (
                                <TableHead 
                                    className="font-semibold text-gray-600 text-sm py-4 text-right"
                                    style={{ width: actionsColumnWidth }}
                                >
                                    {actionsHeader}
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(loadingRows)].map((_, rowIdx) => (
                            <TableRow key={rowIdx} className="border-b border-gray-100">
                                {columns.map((_, colIdx) => (
                                    <TableCell key={colIdx} className="py-6">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                                    </TableCell>
                                ))}
                                {hasActions && (
                                    <TableCell className="py-6">
                                        <div className="flex gap-2 justify-end">
                                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${containerClassName || ''}`}>
            <Table className={tableClassName}>
                <TableHeader>
                    <TableRow className={`bg-gray-50 border-b border-gray-200 ${headerClassName || ''}`}>
                        {columns.map((column, idx) => (
                            <TableHead 
                                key={idx}
                                className={`font-semibold text-gray-600 text-sm py-4 ${column.headerClassName || ''}`}
                                style={{ width: column.width }}
                            >
                                {column.header}
                            </TableHead>
                        ))}
                        {hasActions && (
                            <TableHead 
                                className="font-semibold text-gray-600 text-sm py-4 text-right"
                                style={{ width: actionsColumnWidth }}
                            >
                                {actionsHeader}
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={totalColumns}>
                                <div className="py-10 text-center text-gray-500 flex flex-col items-center gap-2">
                                    {emptyIcon}
                                    <span>{emptyMessage}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data?.map((row, rowIdx) => (
                            <TableRow 
                                key={getRowKey(row, rowIdx)} 
                                className={getRowClassName(row, rowIdx)}
                                onClick={() => onRowClick?.(row, rowIdx)}
                            >
                                {columns.map((column, colIdx) => (
                                    <TableCell 
                                        key={colIdx}
                                        className={`py-6 text-gray-700 ${column.className || ''}`}
                                    >
                                        {getCellValue(row, column, rowIdx)}
                                    </TableCell>
                                ))}
                                {hasActions && (
                                    <TableCell className="py-6 text-right">
                                        {renderActionButtons(row, rowIdx)}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {showMoreButton && data?.length > 0 && (
                <div className="flex justify-center py-6 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={onShowMore}
                        disabled={showMoreLoading}
                        className="px-8 py-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400 rounded-full font-medium"
                    >
                        {showMoreLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Laden...
                            </span>
                        ) : (
                            showMoreLabel
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
