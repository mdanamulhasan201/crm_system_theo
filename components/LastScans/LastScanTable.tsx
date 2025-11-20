"use client";

import React from 'react';
import { filterCustomers, FilterCustomersParams, deleteCustomer } from '@/apis/customerApis';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LatestOrder {
    id: string;
    orderStatus: string;
    createdAt: string | null;
    totalPrice?: number | null;
}

interface LatestScreener {
    id: string;
    createdAt: string | null;
    picture_10?: string | null;
    picture_23?: string | null;
}

interface LastScanRow {
    id: string;
    vorname: string;
    nachname: string;
    createdAt: string;
    wohnort?: string | null;
    customerNumber: number | string;
    krankenkasse?: string | null;
    kundentyp?: string | null;
    totalOrders?: number;
    completedOrders?: number;
    latestOrder?: LatestOrder | null;
    latestScreener?: LatestScreener | null;
    screenerFile?: Array<{ id: string; createdAt: string | null; updatedAt?: string | null }> | null;
}

type DateRangeFilter = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'thisYear';
type OrderStatusFilter = 'all' | 'completed' | 'no-order';

export default function LastScanTable() {
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
        router.push(`/dashboard/customer-info/${id}?manageCustomer=true`);
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

    const formatDate = (date?: string | null, options?: Intl.DateTimeFormatOptions) => {
        if (!date) return '—';
        try {
            return new Date(date).toLocaleString('en-GB', options ?? {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch (error) {
            return '—';
        }
    };

    const getOrderStatusLabel = (status?: string | null) => {
        if (!status) return 'No order';
        const normalized = status.toLowerCase();
        if (['completed', 'abgeschlossen', 'done', 'finished'].includes(normalized)) return 'Completed';
        if (['started', 'sarted', 'in_progress', 'processing'].includes(normalized)) return 'In progress';
        if (['cancelled', 'canceled'].includes(normalized)) return 'Cancelled';
        return status;
    };

    const getOrderStatusClass = (status?: string | null) => {
        if (!status) return 'text-orange-500';
        const normalized = status.toLowerCase();
        if (['completed', 'abgeschlossen', 'done', 'finished'].includes(normalized)) return 'text-green-600';
        if (['cancelled', 'canceled'].includes(normalized)) return 'text-red-500';
        return 'text-sky-600';
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
                const latestOrderStatus = row.latestOrder?.orderStatus ?? null;
                const latestOrderDate = row.latestOrder?.createdAt ?? null;
                const latestScreenerDate = row.latestScreener?.createdAt ?? null;
                const customerFullName = `${row.vorname ?? ''} ${row.nachname ?? ''}`.trim();

                return {
                    'Kunde': customerFullName || '—',
                    'Kundennummer': row.customerNumber ?? '—',
                    'Krankenkasse': row.krankenkasse?.trim() || '—',
                    'Kundentyp': row.kundentyp?.trim() || '—',
                    'Neuester Scan': latestScreenerDate ? formatDate(latestScreenerDate) : 'Kein Scan',
                    'Neuester Auftrag': latestOrderStatus ? getOrderStatusLabel(latestOrderStatus) : 'Kein Auftrag',
                    'Auftragsdatum': latestOrderDate ? formatDate(latestOrderDate) : '—',
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
    ];
    const insuranceOptions = [{ label: 'Alle Krankenkassen', value: 'all' as const }, ...uniqueInsurances.map((ins) => ({ label: ins, value: ins }))];

    const currentRangeStart = displayRows.length === 0 ? 0 : (page - 1) * limit + 1;
    const currentRangeEnd = displayRows.length === 0 ? 0 : Math.min(currentRangeStart + displayRows.length - 1, totalItems || displayRows.length);

    return (
        <div className="mt-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Kundenaufträge Übersicht</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Überwachen Sie die Kundenaktivität, neueste Scans und den Auftragspipeline auf einen Blick.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="rounded-full border-gray-300 text-sm px-4 py-2 cursor-pointer"
                        onClick={handleExport}
                    >
                        Exportieren
                    </Button>
                    <Button variant="outline" className="rounded-full border-gray-300 text-sm px-4 py-2 cursor-pointer">
                        Import
                    </Button>
                </div>
            </div>

            <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Zeitraum</span>
                    <Select value={dateRange} onValueChange={(val) => handleFilterChange(setDateRange, val as DateRangeFilter)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="Zeitraum" />
                        </SelectTrigger>
                        <SelectContent>
                            {periodOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Jahr</span>
                    <Select value={yearFilter} onValueChange={(val: string) => handleFilterChange(setYearFilter, val as string)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="Jahr" />
                        </SelectTrigger>
                        <SelectContent>
                            {yearOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Monat</span>
                    <Select value={monthFilter} onValueChange={(val) => handleFilterChange(setMonthFilter, val)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="Monat" />
                        </SelectTrigger>
                        <SelectContent>
                            {monthOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Standort</span>
                    <Select value={locationFilter} onValueChange={(val: string) => handleFilterChange(setLocationFilter, val as string, false)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="Stadt" />
                        </SelectTrigger>
                        <SelectContent>
                            {locationOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Krankenkasse</span>
                    <Select value={insuranceFilter} onValueChange={(val: string) => handleFilterChange(setInsuranceFilter, val as string, false)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="Krankenkasse" />
                        </SelectTrigger>
                        <SelectContent>
                            {insuranceOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Auftragsstatus</span>
                    <Select value={orderFilter} onValueChange={(val) => handleFilterChange(setOrderFilter, val as OrderStatusFilter)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="Auftragsstatus" />
                        </SelectTrigger>
                        <SelectContent>
                            {orderOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex md:col-span-2 xl:col-span-3 2xl:col-span-6 justify-start">
                    <Button
                        variant="ghost"
                        className="mt-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-11 px-4 cursor-pointer"
                        onClick={() => {
                            setDateRange('all');
                            setYearFilter('all');
                            setMonthFilter('all');
                            setLocationFilter('all');
                            setInsuranceFilter('all');
                            setOrderFilter('all');
                        }}
                    >
                        Filter zurücksetzen
                    </Button>
                </div>
            </div>

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
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <div className="py-10 flex items-center justify-center gap-2 text-gray-500">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        Loading customer data...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : displayRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <div className="py-10 text-center text-gray-500">No customers match the current filters.</div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayRows.map((row) => {
                                const latestOrderStatus = row.latestOrder?.orderStatus ?? null;
                                const latestOrderDate = row.latestOrder?.createdAt ?? null;
                                const latestScreenerDate = row.latestScreener?.createdAt ?? null;
                                const customerFullName = `${row.vorname ?? ''} ${row.nachname ?? ''}`.trim();
                                const krankenkasse = row.krankenkasse?.trim() || '—';
                                const kundentyp = row.kundentyp?.trim() || '—';

                                return (
                                    <TableRow key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedRows.has(row.id)}
                                                onChange={() => handleRowSelect(row.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium capitalize">
                                            {customerFullName ? (
                                                <Link
                                                    href={`/dashboard/scanning-data/${row.id}?manageCustomer=true`}
                                                    className="text-[#2F7D5C] hover:underline"
                                                >
                                                    {customerFullName}
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell>{row.customerNumber ?? '—'}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                {krankenkasse}
                                            </span>
                                        </TableCell>
                                        <TableCell>{kundentyp}</TableCell>
                                        <TableCell className={cn('font-medium', latestScreenerDate ? 'text-gray-700' : 'text-orange-500')}>
                                            {latestScreenerDate ? formatDate(latestScreenerDate) : 'No scan'}
                                        </TableCell>
                                        <TableCell className={cn('font-medium', getOrderStatusClass(latestOrderStatus))}>
                                            {latestOrderStatus ? (
                                                <div className="flex flex-col">
                                                    <span>{getOrderStatusLabel(latestOrderStatus)}</span>
                                                    {latestOrderDate && (
                                                        <span className="text-xs text-gray-400">{formatDate(latestOrderDate)}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                'No order'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                {latestScreenerDate ? (
                                                    <Button
                                                        className="cursor-pointer bg-[#2F7D5C] hover:bg-[#2f7d5cce] text-white px-3.5 py-1.5 text-sm rounded-lg"
                                                        onClick={() => handleNeuerAuftrag(row.id)}
                                                    >
                                                        Neuer Auftrag
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="cursor-pointer bg-[#2F7D5C] hover:bg-[#2f7d5cce] text-white px-3.5 py-1.5 text-sm rounded-lg"
                                                        onClick={() => handleScanDurchführen(row.id)}
                                                    >
                                                        Scan durchführen
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    className="cursor-pointer border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 px-3 py-1.5 text-sm rounded-lg"
                                                    onClick={() => handleDeleteClick(row)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                <div>
                    Zeige {currentRangeStart}-{currentRangeEnd} von {totalItems || displayRows.length || 0}
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationLink
                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                href="#"
                                size="default"
                                className="gap-1 px-2.5 sm:pl-2.5 cursor-pointer"
                                aria-label="Zur vorherigen Seite"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:block">Zurück</span>
                            </PaginationLink>
                        </PaginationItem>

                        {Array.from({ length: totalPages }).map((_, idx) => {
                            const pageNum = idx + 1;
                            return (
                                <PaginationItem key={pageNum}>
                                    <PaginationLink
                                        href="#"
                                        isActive={pageNum === page}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}

                        <PaginationItem>
                            <PaginationLink
                                onClick={() => handlePageChange(totalPages ? Math.min(totalPages, page + 1) : page + 1)}
                                href="#"
                                size="default"
                                className="gap-1 px-2.5 sm:pr-2.5 cursor-pointer"
                                aria-label="Zur nächsten Seite"
                            >
                                <span className="hidden sm:block">Weiter</span>
                                <ChevronRight className="h-4 w-4" />
                            </PaginationLink>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Kunde löschen bestätigen</DialogTitle>
                        <DialogDescription>
                            Sind Sie sicher, dass Sie den Kunden <strong>{customerToDelete?.name}</strong> löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setCustomerToDelete(null);
                            }}
                            disabled={isDeleting}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 cursor-pointer hover:bg-red-700 text-white"
                        >
                            {isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Löschen...</span>
                                </div>
                            ) : (
                                'Ja, löschen'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
