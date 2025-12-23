"use client";

import React from 'react';
import { filterCustomers, FilterCustomersParams, deleteCustomer } from '@/apis/customerApis';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { LastScanToolbar } from './Tables/LastScanToolbar';
import { LastScanFilters } from '@/components/LastScans/Tables/LastScanFilters';
import { LastScanTableRow } from '@/components/LastScans/Tables/LastScanTableRow';
import { DeleteCustomerDialog } from '@/components/LastScans/Tables/DeleteCustomerDialog';
import { LastScanPagination } from '@/components/LastScans/Tables/LastScanPagination';
import { formatDate, getOrderStatusLabel } from '@/components/LastScans/Tables/utils';
import { DateRangeFilter, LastScanRow, OrderStatusFilter, LatestScreener } from '@/components/LastScans/Tables/types';
import LastScanTableShimmer from '@/components/ShimmerEffect/Customer/LastScanTableShimmer';

interface LastScanTableProps {
    onCustomerDeleted?: () => void;
}

export default function LastScanTable({ onCustomerDeleted }: LastScanTableProps) {
    const router = useRouter();

    const [rows, setRows] = React.useState<LastScanRow[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [page, setPage] = React.useState<number>(1);
    const [limit] = React.useState<number>(10);
    const [totalPages, setTotalPages] = React.useState<number>(1);
    const [totalItems, setTotalItems] = React.useState<number>(0);

    const [dateRange, setDateRange] = React.useState<DateRangeFilter>('all');
    const [orderFilter, setOrderFilter] = React.useState<OrderStatusFilter>('all');
    const [yearFilter, setYearFilter] = React.useState<string>('all');
    const [monthFilter, setMonthFilter] = React.useState<string>('all');
    const [locationFilter, setLocationFilter] = React.useState<string>('all');
    const [insuranceFilter, setInsuranceFilter] = React.useState<string>('all');
    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
    const [deleteModalOpen, setDeleteModalOpen] = React.useState<boolean>(false);
    const [customerToDelete, setCustomerToDelete] = React.useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

    const load = React.useCallback(async () => {
        try {
            setIsLoading(true);

            const params: FilterCustomersParams = {
                page,
                limit,
            };

            if (yearFilter !== 'all') {
                params.year = yearFilter;
            }

            if (monthFilter !== 'all') {
                params.selectedMonth = monthFilter;
            }

            switch (dateRange) {
                case 'today':
                    params.today = true;
                    break;
                case 'yesterday':
                    params.yesterday = true;
                    break;
                case 'thisWeek':
                    params.thisWeek = true;
                    break;
                case 'lastWeek':
                    params.lastWeek = true;
                    break;
                case 'thisMonth':
                    params.thisMonth = true;
                    break;
                case 'thisYear':
                    params.thisYear = true;
                    break;
                default:
                    break;
            }

            if (orderFilter === 'completed') {
                params.completedOrders = true;
            } else if (orderFilter === 'no-order') {
                params.noOrder = true;
            }

            const res = await filterCustomers(params);

            if (res && res.success === false && res.message) {
                toast.error(res.message);
                setRows([]);
                setTotalPages(1);
                setTotalItems(0);
                return;
            }

            const data = Array.isArray(res?.data) ? res.data : [];

            // Process data - use latestScreener from API if available, otherwise extract from screenerFile array
            const processedData = data.map((item: any) => {
                let latestScreener: LatestScreener | null = null;

                // Use latestScreener from API if it exists
                if (item.latestScreener && item.latestScreener.createdAt) {
                    latestScreener = {
                        id: item.latestScreener.id,
                        createdAt: item.latestScreener.createdAt,
                        picture_10: item.latestScreener.picture_10,
                        picture_23: item.latestScreener.picture_23,
                    };
                } else if (Array.isArray(item.screenerFile) && item.screenerFile.length > 0) {
                    // Fallback: Find the latest screener file by comparing dates
                    const latest = item.screenerFile.reduce((latest: any, current: any) => {
                        const latestDate = new Date(latest.updatedAt || latest.createdAt || 0);
                        const currentDate = new Date(current.updatedAt || current.createdAt || 0);
                        return currentDate > latestDate ? current : latest;
                    });

                    latestScreener = {
                        id: latest.id,
                        createdAt: latest.createdAt,
                        picture_10: latest.picture_10,
                        picture_23: latest.picture_23,
                    };
                }

                return {
                    ...item,
                    latestScreener,

                    kostenträger: item.kostenträger || item.Kostenträger || null,
                };
            });

            setRows(processedData as LastScanRow[]);

            const meta = res?.pagination;
            if (meta) {
                if (typeof meta.totalPages === 'number') {
                    setTotalPages(Math.max(1, meta.totalPages));
                }
                if (typeof meta.totalItems === 'number') {
                    setTotalItems(meta.totalItems);
                } else {
                    setTotalItems(processedData.length);
                }
            } else {
                setTotalPages(processedData.length < limit && page === 1 ? 1 : Math.max(1, page + (processedData.length === limit ? 1 : 0)));
                setTotalItems(processedData.length);
            }
        } catch (error: any) {
            // console.error('Failed to load customers', error);

            // Extract error message from axios error response
            // When axios gets 400, the response data is in error.response.data
            if (error?.response?.data) {
                const errorData = error.response.data;
                // Check if it has the structure { success: false, message: "..." }
                if (errorData.success === false && errorData.message) {
                    toast.error(errorData.message);
                } else if (errorData.message) {
                    toast.error(errorData.message);
                } else {
                    toast.error(error.response.statusText || 'Fehler beim Laden der Kundendaten');
                }
            } else if (error?.message) {
                toast.error(error.message);
            } else {
                toast.error('Fehler beim Laden der Kundendaten');
            }

            setRows([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, dateRange, orderFilter, yearFilter, monthFilter]);

    React.useEffect(() => {
        load();
    }, [load]);

    const handleNeuerAuftrag = (id: string) => {
        router.push(`/dashboard/scanning-data/${id}`);
    };

    const handleScanDurchführen = (id: string) => {
        router.push(`/dashboard/scanning-data/${id}?manageCustomer=true`);
    };

    const handleDeleteClick = (row: LastScanRow) => {
        const customerName = `${row.vorname ?? ''} ${row.nachname ?? ''}`.trim() || 'Kunde';
        setCustomerToDelete({ id: row.id, name: customerName });
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!customerToDelete) return;

        try {
            setIsDeleting(true);
            const res = await deleteCustomer(customerToDelete.id);

            if (res && res.success === false && res.message) {
                toast.error(res.message);
            } else {
                toast.success('Kunde erfolgreich gelöscht');
                setDeleteModalOpen(false);
                setCustomerToDelete(null);
                // Reload the data
                load();

                // Notify parent so other views (e.g. LastScans carousel) can update
                if (onCustomerDeleted) {
                    onCustomerDeleted();
                }
            }
        } catch (error: any) {
            if (error?.response?.data) {
                const errorData = error.response.data;
                if (errorData.success === false && errorData.message) {
                    toast.error(errorData.message);
                } else if (errorData.message) {
                    toast.error(errorData.message);
                } else {
                    toast.error(error.response.statusText || 'Fehler beim Löschen des Kunden');
                }
            } else if (error?.message) {
                toast.error(error.message);
            } else {
                toast.error('Fehler beim Löschen des Kunden');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const uniqueYears = React.useMemo(() => {
        const set = new Set<string>();
        rows.forEach((row) => {
            if (row.createdAt) {
                const year = new Date(row.createdAt).getFullYear();
                if (!Number.isNaN(year)) {
                    set.add(String(year));
                }
            }
        });
        return Array.from(set).sort((a, b) => Number(b) - Number(a));
    }, [rows]);


    const uniqueInsurances = React.useMemo(() => {
        const set = new Set<string>();
        rows.forEach((row) => {
            const insurance = row.krankenkasse?.trim();
            if (insurance) {
                set.add(insurance);
            }
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [rows]);

    const uniqueLocations = React.useMemo(() => {
        const set = new Set<string>();
        rows.forEach((row) => {
            const location = row.wohnort?.trim();
            if (location) {
                set.add(location);
            }
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [rows]);

    const displayRows = React.useMemo(() => {
        return rows.filter((row) => {
            const createdDate = new Date(row.createdAt);
            const rowMonth = Number.isNaN(createdDate.getTime()) ? null : createdDate.getMonth() + 1;
            const matchesLocation = locationFilter === 'all' || (row.wohnort?.trim() ?? '—') === locationFilter;
            const matchesInsurance = insuranceFilter === 'all' || (row.krankenkasse?.trim() ?? '—') === insuranceFilter;
            const matchesYear = yearFilter === 'all' || (!Number.isNaN(createdDate.getTime()) && createdDate.getFullYear().toString() === yearFilter);
            const matchesMonth = monthFilter === 'all' || (rowMonth !== null && rowMonth.toString() === monthFilter);
            return matchesLocation && matchesInsurance && matchesYear && matchesMonth;
        });
    }, [rows, locationFilter, insuranceFilter, yearFilter, monthFilter]);

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
    };

    const handleFilterChange = <T extends string>(setter: React.Dispatch<React.SetStateAction<T>>, value: T, resetPage: boolean = true) => {
        setter(value);
        if (resetPage) {
            setPage(1);
        }
    };

    const handleFilterReset = () => {
        setDateRange('all');
        setYearFilter('all');
        setMonthFilter('all');
        setLocationFilter('all');
        setInsuranceFilter('all');
        setOrderFilter('all');
        setPage(1);
    };

    const handleDateRangeChange = (value: DateRangeFilter) => handleFilterChange(setDateRange, value);
    const handleYearChange = (value: string) => handleFilterChange(setYearFilter, value);
    const handleMonthChange = (value: string) => handleFilterChange(setMonthFilter, value);
    const handleLocationChange = (value: string) => handleFilterChange(setLocationFilter, value, false);
    const handleInsuranceChange = (value: string) => handleFilterChange(setInsuranceFilter, value, false);
    const handleOrderChange = (value: OrderStatusFilter) => handleFilterChange(setOrderFilter, value);

    const handleRowSelect = (rowId: string) => {
        setSelectedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(rowId)) {
                newSet.delete(rowId);
            } else {
                newSet.add(rowId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedRows.size === displayRows.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(displayRows.map(row => row.id)));
        }
    };

    const handleExport = () => {
        try {
            // Get selected rows or all rows if none selected
            const rowsToExport = selectedRows.size > 0
                ? displayRows.filter(row => selectedRows.has(row.id))
                : displayRows;

            if (rowsToExport.length === 0) {
                toast.error('Bitte wählen Sie mindestens eine Zeile zum Exportieren aus');
                return;
            }

            // Prepare data for Excel
            const excelData = rowsToExport.map((row) => {
                const latestScreenerDate = row.latestScreener?.createdAt ?? null;
                const customerFullName = `${row.vorname ?? ''} ${row.nachname ?? ''}`.trim();
                
                // Determine Krankenkasse: if no orders, show billingType; otherwise show krankenkasse
                const hasOrders = row.latestOrder || row.latestMassschuheOrder;
                let krankenkasseValue = '—';
                if (!hasOrders && row.billingType?.trim()) {
                    krankenkasseValue = row.billingType === 'krankenkasse' ? 'Krankenkasse' : 
                                      row.billingType === 'privat' ? 'Privat' : 
                                      row.billingType;
                } else if (row.krankenkasse?.trim()) {
                    krankenkasseValue = row.krankenkasse.trim();
                }
                
                // Determine Kundentyp: show order types (Einlagen/Massschuhe) when orders exist
                const customerTypes: string[] = [];
                if (row.latestMassschuheOrder) customerTypes.push('Massschuhe');
                if (row.latestOrder) customerTypes.push('Einlagen');
                const kundentyp = customerTypes.length > 0 ? customerTypes.join(', ') : '—';

                const orderEntries: string[] = [];
                const orderDates: (string | null)[] = [];

                if (row.latestOrder) {
                    orderEntries.push(getOrderStatusLabel(row.latestOrder.orderStatus));
                    orderDates.push(row.latestOrder.createdAt ?? null);
                }

                if (row.latestMassschuheOrder) {
                    orderEntries.push('Massschuhe');
                    orderDates.push(row.latestMassschuheOrder.createdAt ?? null);
                }

                const newestOrderLabel = orderEntries.length > 0 ? orderEntries.join(' | ') : 'Kein Auftrag';
                const newestOrderDate = orderDates[0];

                return {
                    'Kunde': customerFullName || '—',
                    'Kundennummer': row.customerNumber ?? '—',
                    'Krankenkasse': krankenkasseValue,
                    'Kostenträger': row.kostenträger?.trim() || '—',
                    'Kundentyp': kundentyp,
                    'Neuester Scan': latestScreenerDate ? formatDate(latestScreenerDate) : 'Kein Scan',
                    'Neuester Auftrag': newestOrderLabel,
                    'Auftragsdatum': newestOrderDate ? formatDate(newestOrderDate) : '—',
                    'Erstellt am': formatDate(row.createdAt),
                    'Wohnort': row.wohnort?.trim() || '—',
                    'Gesamt Aufträge': row.totalOrders ?? 0,
                    'Abgeschlossene Aufträge': row.completedOrders ?? 0,
                };
            });

            // Create workbook and worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Kunden');

            // Generate Excel file and download
            const fileName = `Kunden_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            toast.success(`${rowsToExport.length} ${rowsToExport.length === 1 ? 'Zeile' : 'Zeilen'} erfolgreich exportiert`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Fehler beim Exportieren der Daten');
        }
    };

    const periodOptions: { label: string; value: DateRangeFilter }[] = [
        { label: 'Alle Kunden', value: 'all' },
        { label: 'Heute', value: 'today' },
        { label: 'Gestern', value: 'yesterday' },
        { label: 'Diese Woche', value: 'thisWeek' },
        { label: 'Letzte Woche', value: 'lastWeek' },
        { label: 'Dieser Monat', value: 'thisMonth' },
        { label: 'Dieses Jahr', value: 'thisYear' },
    ];

    const orderOptions: { label: string; value: OrderStatusFilter }[] = [
        { label: 'Alle Aufträge', value: 'all' },
        { label: 'Abgeschlossen', value: 'completed' },
        { label: 'Kein Auftrag', value: 'no-order' },
    ];

    const yearOptions = [{ label: 'Alle Jahre', value: 'all' as const }, ...uniqueYears.map((year) => ({ label: year, value: year }))];
    const monthOptions = [
        { label: 'Alle Monate', value: 'all' as const },
        { label: 'Januar', value: '1' as const },
        { label: 'Februar', value: '2' as const },
        { label: 'März', value: '3' as const },
        { label: 'April', value: '4' as const },
        { label: 'Mai', value: '5' as const },
        { label: 'Juni', value: '6' as const },
        { label: 'Juli', value: '7' as const },
        { label: 'August', value: '8' as const },
        { label: 'September', value: '9' as const },
        { label: 'Oktober', value: '10' as const },
        { label: 'November', value: '11' as const },
        { label: 'Dezember', value: '12' as const },
    ];

    const locationOptions = [
        { label: 'Alle Städte', value: 'all' as const },
        ...uniqueLocations.map((location) => ({ label: location, value: location })),
    ];
    const insuranceOptions = [
        { label: 'Alle Krankenkassen', value: 'all' as const },
        ...uniqueInsurances.map((ins) => ({ label: ins, value: ins })),
    ];

    return (
        <div className="mt-10 space-y-6">
            <LastScanToolbar onExport={handleExport} />

            <LastScanFilters
                dateRange={dateRange}
                yearFilter={yearFilter}
                monthFilter={monthFilter}
                locationFilter={locationFilter}
                insuranceFilter={insuranceFilter}
                orderFilter={orderFilter}
                periodOptions={periodOptions}
                yearOptions={yearOptions}
                monthOptions={monthOptions}
                locationOptions={locationOptions}
                insuranceOptions={insuranceOptions}
                orderOptions={orderOptions}
                onDateRangeChange={handleDateRangeChange}
                onYearChange={handleYearChange}
                onMonthChange={handleMonthChange}
                onLocationChange={handleLocationChange}
                onInsuranceChange={handleInsuranceChange}
                onOrderChange={handleOrderChange}
                onReset={handleFilterReset}
            />

            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={displayRows.length > 0 && selectedRows.size === displayRows.length}
                                    onChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="font-semibold text-gray-600">Kunde</TableHead>
                            <TableHead className="font-semibold text-gray-600">Kundennummer</TableHead>
                            <TableHead className="font-semibold text-gray-600">Krankenkasse</TableHead>
                            <TableHead className="font-semibold text-gray-600">Kundentyp</TableHead>
                            <TableHead className="font-semibold text-gray-600">Neuester Scan</TableHead>
                            <TableHead className="font-semibold text-gray-600">Neuester Auftrag</TableHead>
                            <TableHead className="text-right font-semibold text-gray-600">Aktionen</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <LastScanTableShimmer rows={6} />
                        ) : displayRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <div className="py-10 text-center text-gray-500">No customers match the current filters.</div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayRows.map((row) => (
                                <LastScanTableRow
                                    key={row.id}
                                    row={row}
                                    isSelected={selectedRows.has(row.id)}
                                    onSelect={handleRowSelect}
                                    onNeuerAuftrag={handleNeuerAuftrag}
                                    onScanDurchführen={handleScanDurchführen}
                                    onDelete={handleDeleteClick}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <LastScanPagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                displayRowsCount={displayRows.length}
                limit={limit}
                onPageChange={handlePageChange}
            />

            <DeleteCustomerDialog
                open={deleteModalOpen}
                customer={customerToDelete}
                isDeleting={isDeleting}
                onOpenChange={(open) => {
                    setDeleteModalOpen(open);
                    if (!open) {
                        setCustomerToDelete(null);
                    }
                }}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}
