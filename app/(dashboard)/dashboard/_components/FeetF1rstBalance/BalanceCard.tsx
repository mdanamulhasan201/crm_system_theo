'use client'
import React, { useEffect, useState } from 'react'
import { HiOutlineCurrencyEuro } from 'react-icons/hi'
import { BsCalendarCheck } from 'react-icons/bs'
import { TbArrowsExchange } from 'react-icons/tb'
import { MdOutlineSavings } from 'react-icons/md'
import { getLeastOneMonthPaymentData } from '@/apis/MassschuheManagemantApis'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import PayoutHistory from './PayoutHistory'

interface BalanceCardData {
    gesamteinnahmen?: number | null;
    gesamteinnahmenChange?: string;
    naechsteAuszahlung?: number | null;
    naechsteAuszahlungDatum?: string;
    kuerzlicheAuszahlungen?: { amount: number | null; date: string }[];
    ruecklagebetrag?: number | null;
    ruecklagebetragDatum?: string;
}

interface BalanceCardProps {
    data?: BalanceCardData;
    /** Pass from page to refresh payout history in modal (e.g. after new payout request) */
    payoutHistoryRefreshKey?: number;
}

const defaultData: BalanceCardData = {
    gesamteinnahmen: null,
    gesamteinnahmenChange: '---',
    naechsteAuszahlung: null,
    naechsteAuszahlungDatum: '---',
    kuerzlicheAuszahlungen: [
        { amount: null, date: '---' },
        { amount: null, date: '---' },
    ],
    ruecklagebetrag: null,
    ruecklagebetragDatum: '--',
};

export default function BalanceCard({ data = defaultData, payoutHistoryRefreshKey }: BalanceCardProps) {
    const [payoutModalOpen, setPayoutModalOpen] = useState(false)
    const [lastMonthData, setLastMonthData] = useState<{
        totalPrice: number | null;
        period: string;
        dateRange?: { from: string; to: string };
        status?: string | null;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch last month payment data
    useEffect(() => {
        const fetchLastMonthData = async () => {
            try {
                setLoading(true);
                const response = await getLeastOneMonthPaymentData();
                if (response.success && response.data?.lastMonth) {
                    const lm = response.data.lastMonth as {
                        totalPrice: number;
                        period: string;
                        dateRange?: { from: string; to: string };
                        status?: string | null;
                    };
                    setLastMonthData({
                        totalPrice: lm.totalPrice,
                        period: lm.period,
                        dateRange: lm.dateRange,
                        status: lm.status ?? null,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch last month payment data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLastMonthData();
    }, []);

    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) {
            return '_ _ _';
        }
        return value.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDateRangeDe = (from: string, to: string) => {
        const opts: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        };
        const d1 = new Date(from);
        const d2 = new Date(to);
        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
        return `${d1.toLocaleDateString('de-DE', opts)} – ${d2.toLocaleDateString('de-DE', opts)}`;
    };

    const formatLastMonthStatusLabel = (raw: string | null | undefined) => {
        if (!raw) return null;
        const lower = raw.toLowerCase();
        if (lower === 'panding') return 'Pending';
        return raw;
    };

    const lastMonthStatusBadgeClass = (raw: string | null | undefined) => {
        if (!raw) return 'bg-gray-100 text-gray-700 border border-gray-200';
        const lower = raw.toLowerCase();
        if (lower === 'panding' || lower === 'pending') {
            return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        }
        if (lower === 'completed' || lower === 'complated' || lower === 'abgeschlossen') {
            return 'bg-green-100 text-green-800 border border-green-200';
        }
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            {/* Gesamteinnahmen Konto */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <HiOutlineCurrencyEuro className="w-5 h-5 text-emerald-500" />
                    </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Gesamteinnahmen Konto</h3>
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-gray-800">
                        {formatCurrency(data.gesamteinnahmen)}
                    </span>
                    <span className="text-emerald-500 text-xl font-bold">€</span>
                </div>
                <p className="text-xs text-emerald-500">{data.gesamteinnahmenChange}</p>
            </div>

            {/* Nächste Auszahlung (Geplant) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <BsCalendarCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Nächste Auszahlung<br />
                    <span className="text-gray-500">(Gesamtausgaben Konto)</span>
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-gray-800">
                        {formatCurrency(data.naechsteAuszahlung)}
                    </span>
                    <span className="text-emerald-500 text-xl font-bold">€</span>
                </div>
                <p className="text-xs text-gray-500">{data.naechsteAuszahlungDatum}</p>
            </div>

            {/* Kürzliche Auszahlungen – clickable, opens payout history modal */}
            <button
                type="button"
                onClick={() => setPayoutModalOpen(true)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-left w-full cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2"
            >
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <TbArrowsExchange className="w-5 h-5 text-emerald-500" />
                    </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Kürzliche Zahlungen</h3>
                <div className="space-y-2">
                    {loading ? (
                        <div className="flex flex-col gap-2">
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                        </div>
                    ) : lastMonthData ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg sm:text-xl font-bold text-gray-800">
                                    {formatCurrency(lastMonthData.totalPrice)}
                                </span>
                                <span className="text-emerald-500 text-base sm:text-lg font-bold">€</span>
                            </div>
                            {lastMonthData.dateRange?.from && lastMonthData.dateRange?.to ? (
                                <span className="text-xs text-gray-600 break-words">
                                    {formatDateRangeDe(
                                        lastMonthData.dateRange.from,
                                        lastMonthData.dateRange.to,
                                    ) ?? lastMonthData.period}
                                </span>
                            ) : (
                                <span className="text-xs text-gray-500 break-words">{lastMonthData.period}</span>
                            )}
                            {/* {formatLastMonthStatusLabel(lastMonthData.status) && (
                                <span
                                    className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${lastMonthStatusBadgeClass(lastMonthData.status)}`}
                                >
                                    {formatLastMonthStatusLabel(lastMonthData.status)}
                                </span>
                            )} */}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg sm:text-xl font-bold text-gray-800">_ _ _</span>
                                <span className="text-emerald-500 text-base sm:text-lg font-bold">€</span>
                            </div>
                            <span className="text-xs text-gray-500">--</span>
                        </div>
                    )}
                </div>
                <p className="text-xs text-emerald-600 mt-2">Klicken für Auszahlungsverlauf</p>
            </button>

            <Dialog open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Zahlungsverlauf</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2">
                        <PayoutHistory refreshKey={payoutHistoryRefreshKey} hideTitle />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rücklagebetrag */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                        <MdOutlineSavings className="w-5 h-5 text-red-400" />
                    </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Rücklagebetrag</h3>
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-gray-800">
                        {formatCurrency(data.ruecklagebetrag)}
                    </span>
                    <span className="text-red-400 text-xl font-bold">€</span>
                </div>
                <p className="text-xs text-gray-500">{data.ruecklagebetragDatum}</p>
            </div>
        </div>
    );
}
