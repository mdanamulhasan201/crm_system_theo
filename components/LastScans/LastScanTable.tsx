"use client";

import React from 'react';
import { filterCustomers, FilterCustomersParams } from '@/apis/customerApis';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
            const data = Array.isArray(res?.data) ? res.data : [];

            setRows(data as LastScanRow[]);

            const meta = res?.pagination;
            if (meta) {
                if (typeof meta.totalPages === 'number') {
                    setTotalPages(Math.max(1, meta.totalPages));
                }
                if (typeof meta.totalItems === 'number') {
                    setTotalItems(meta.totalItems);
                } else {
                    setTotalItems(data.length);
                }
            } else {
                setTotalPages(data.length < limit && page === 1 ? 1 : Math.max(1, page + (data.length === limit ? 1 : 0)));
                setTotalItems(data.length);
            }
        } catch (error) {
            console.error('Failed to load customers', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, dateRange, orderFilter, yearFilter, monthFilter]);

    React.useEffect(() => {
        load();
    }, [load]);

    const handleKundeninfoView = (id: string) => {
        router.push(`/dashboard/scanning-data/${id}?manageCustomer=true`);
    };

    const handleNeuerAuftrag = (id: string) => {
        router.push(`/dashboard/scanning-data/${id}`);
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

    const uniqueLocations = React.useMemo(() => {
        const set = new Set<string>();
        rows.forEach((row) => {
            const location = row.wohnort?.trim();
            if (location) set.add(location);
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
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

    const periodOptions: { label: string; value: DateRangeFilter }[] = [
        { label: 'All customers', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'This week', value: 'thisWeek' },
        { label: 'Last week', value: 'lastWeek' },
        { label: 'This month', value: 'thisMonth' },
        { label: 'This year', value: 'thisYear' },
    ];

    const orderOptions: { label: string; value: OrderStatusFilter }[] = [
        { label: 'All orders', value: 'all' },
        { label: 'Completed', value: 'completed' },
        { label: 'No order', value: 'no-order' },
    ];

    const yearOptions = [{ label: 'All years', value: 'all' as const }, ...uniqueYears.map((year) => ({ label: year, value: year }))];
    const monthOptions = [
        { label: 'All months', value: 'all' as const },
        { label: 'January', value: '1' as const },
        { label: 'February', value: '2' as const },
        { label: 'March', value: '3' as const },
        { label: 'April', value: '4' as const },
        { label: 'May', value: '5' as const },
        { label: 'June', value: '6' as const },
        { label: 'July', value: '7' as const },
        { label: 'August', value: '8' as const },
        { label: 'September', value: '9' as const },
        { label: 'October', value: '10' as const },
        { label: 'November', value: '11' as const },
        { label: 'December', value: '12' as const },
    ];

    const locationOptions = [{ label: 'All cities', value: 'all' as const }, ...uniqueLocations.map((loc) => ({ label: loc, value: loc }))];
    const insuranceOptions = [{ label: 'All insurances', value: 'all' as const }, ...uniqueInsurances.map((ins) => ({ label: ins, value: ins }))];

    const currentRangeStart = displayRows.length === 0 ? 0 : (page - 1) * limit + 1;
    const currentRangeEnd = displayRows.length === 0 ? 0 : Math.min(currentRangeStart + displayRows.length - 1, totalItems || displayRows.length);

    return (
        <div className="mt-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Customer Orders Overview</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor customer activity, latest scans, and order pipeline at a glance.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full border-gray-300 text-sm px-4 py-2 cursor-pointer">
                        Export
                    </Button>
                    <Button variant="outline" className="rounded-full border-gray-300 text-sm px-4 py-2 cursor-pointer">
                        Import
                    </Button>
                </div>
            </div>

            <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Date range</span>
                    <Select value={dateRange} onValueChange={(val) => handleFilterChange(setDateRange, val as DateRangeFilter)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="Date range" />
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
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Year</span>
                    <Select value={yearFilter} onValueChange={(val: string) => handleFilterChange(setYearFilter, val as string)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="Year" />
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
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Month</span>
                    <Select value={monthFilter} onValueChange={(val) => handleFilterChange(setMonthFilter, val)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="Month" />
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
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">City</span>
                    <Select value={locationFilter} onValueChange={(val: string) => handleFilterChange(setLocationFilter, val as string, false)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="City" />
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
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Insurance</span>
                    <Select value={insuranceFilter} onValueChange={(val: string) => handleFilterChange(setInsuranceFilter, val as string, false)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="Insurance" />
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
                    <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">Order status</span>
                    <Select value={orderFilter} onValueChange={(val) => handleFilterChange(setOrderFilter, val as OrderStatusFilter)}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                            <SelectValue placeholder="Order status" />
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
                        Reset filters
                    </Button>
                </div>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold text-gray-600">Customer</TableHead>
                            <TableHead className="font-semibold text-gray-600">Customer No.</TableHead>
                            <TableHead className="font-semibold text-gray-600">Insurance</TableHead>
                            <TableHead className="font-semibold text-gray-600">Customer Type</TableHead>
                            <TableHead className="font-semibold text-gray-600">Latest Scan</TableHead>
                            <TableHead className="font-semibold text-gray-600">Latest Order</TableHead>
                            <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7}>
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
                                <TableCell colSpan={7}>
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
                                        <TableCell className="font-medium capitalize">{customerFullName || '—'}</TableCell>
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
                                                <Button
                                                    variant="outline"
                                                    className="cursor-pointer border-gray-300 px-3 py-1.5 text-sm rounded-lg"
                                                    onClick={() => handleKundeninfoView(row.id)}
                                                >
                                                    Customer profile
                                                </Button>
                                                <Button
                                                    className="cursor-pointer bg-[#2F7D5C] hover:bg-[#2f7d5cce] text-white px-3.5 py-1.5 text-sm rounded-lg"
                                                    onClick={() => handleNeuerAuftrag(row.id)}
                                                >
                                                    New order
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
                    Showing {currentRangeStart}-{currentRangeEnd} of {totalItems || displayRows.length || 0}
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                href="#"
                            />
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
                            <PaginationNext
                                onClick={() => handlePageChange(totalPages ? Math.min(totalPages, page + 1) : page + 1)}
                                href="#"
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}
