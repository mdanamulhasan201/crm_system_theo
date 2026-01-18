import Link from 'next/link';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LastScanRow } from '@/components/LastScans/Tables/types';
import { formatDate, getKundentypBadges, getOrderEntries } from '@/components/LastScans/Tables/utils';

interface LastScanTableRowProps {
    row: LastScanRow;
    isSelected: boolean;
    onSelect: (rowId: string) => void;
    onNeuerAuftrag: (id: string) => void;
    onScanDurchführen: (id: string) => void;
    onDelete: (row: LastScanRow) => void;
}

export function LastScanTableRow({
    row,
    isSelected,
    onSelect,
    onNeuerAuftrag,
    onScanDurchführen,
    onDelete,
}: LastScanTableRowProps) {
    const latestScreenerDate = row.latestScreener?.createdAt ?? null;
    const customerFullName = `${row.vorname ?? ''} ${row.nachname ?? ''}`.trim();
    const krankenkasse = row.krankenkasse?.trim() || '—';
    const kostenträger = row.kostenträger?.trim() || '—';
    const kundentypBadges = getKundentypBadges(row);
    const orderEntries = getOrderEntries(row);

    return (
        <TableRow className="hover:bg-gray-50 transition-colors">
            <TableCell>
                <Checkbox
                    checked={isSelected}
                    onChange={() => onSelect(row.id)}
                    onClick={(e) => e.stopPropagation()}
                />
            </TableCell>
            <TableCell className="font-medium capitalize">
                {customerFullName ? (
                    <Link href={`/dashboard/customer-history/${row.id}`} className="text-[#2F7D5C] hover:underline">
                        {customerFullName}
                    </Link>
                ) : (
                    '—'
                )}
            </TableCell>
            <TableCell>{row.customerNumber ?? '—'}</TableCell>
            <TableCell>
                <div className="flex flex-col gap-1">
                    {(() => {
                        // Priority: billingType > krankenkasse > kostenträger
                        if (row.billingType?.trim()) {
                            const billingTypeLabel = row.billingType === 'krankenkasse' ? 'Krankenkasse' : 
                                                   row.billingType === 'privat' ? 'Privat' : 
                                                   row.billingType;
                            return (
                                <span className="text-xs font-medium text-gray-700">
                                    {billingTypeLabel}
                                </span>
                            );
                        }
                        
                        if (krankenkasse !== '—') {
                            return (
                                <span className="text-xs font-medium text-gray-700">
                                    {krankenkasse}
                                </span>
                            );
                        }
                        
                        if (kostenträger !== '—') {
                            return (
                                <span className="text-xs font-medium text-gray-700">
                                    {kostenträger}
                                </span>
                            );
                        }
                        
                        return <span className="text-gray-400">—</span>;
                    })()}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-1">
                    {kundentypBadges.map((badge) => (
                        <span
                            key={badge.label}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                        >
                            {badge.label}
                        </span>
                    ))}
                </div>
            </TableCell>
            <TableCell className={cn('font-medium', latestScreenerDate ? 'text-gray-700' : 'text-orange-500')}>
                {latestScreenerDate ? formatDate(latestScreenerDate) : 'No scan'}
            </TableCell>
            <TableCell className="font-medium">
                {orderEntries.length === 0 ? (
                    <span className="text-orange-500">No order</span>
                ) : (
                    <div className="flex flex-col gap-1">
                        {orderEntries.map((entry, index) => {
                            // Determine which order ID to use and which page to navigate to
                            let orderId: string | null = null;
                            let targetUrl: string | null = null;
                            
                            if (entry.label === 'Massschuhe' && row.latestMassschuheOrder?.id) {
                                orderId = row.latestMassschuheOrder.id;
                                targetUrl = `/dashboard/massschuhauftraege?orderId=${orderId}`;
                            } else if (row.latestOrder?.id) {
                                orderId = row.latestOrder.id;
                                targetUrl = `/dashboard/orders?orderId=${orderId}`;
                            }
                            
                            if (targetUrl && orderId) {
                                return (
                                    <Link
                                        key={`${entry.label}-${index}`}
                                        href={targetUrl}
                                        className={cn('flex flex-col hover:underline cursor-pointer', entry.className)}
                                    >
                                        <span>{entry.label}</span>
                                        {entry.date && (
                                            <span className="text-xs text-gray-400">{formatDate(entry.date)}</span>
                                        )}
                                    </Link>
                                );
                            }
                            
                            return (
                                <div key={`${entry.label}-${index}`} className={cn('flex flex-col', entry.className)}>
                                    <span>{entry.label}</span>
                                    {entry.date && (
                                        <span className="text-xs text-gray-400">{formatDate(entry.date)}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                    {latestScreenerDate ? (
                        <Button
                            className="cursor-pointer bg-[#2F7D5C] hover:bg-[#2f7d5cce] text-white px-3.5 py-1.5 text-sm rounded-lg"
                            onClick={() => onNeuerAuftrag(row.id)}
                        >
                            Neuer Auftrag
                        </Button>
                    ) : (
                        <Button
                            className="cursor-pointer bg-[#2F7D5C] hover:bg-[#2f7d5cce] text-white px-3.5 py-1.5 text-sm rounded-lg"
                            onClick={() => onScanDurchführen(row.id)}
                        >
                            Scan durchführen
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="cursor-pointer border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 px-3 py-1.5 text-sm rounded-lg"
                        onClick={() => onDelete(row)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

