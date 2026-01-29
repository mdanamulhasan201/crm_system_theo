'use client'
import React, { useEffect, useState } from 'react'
import { HiOutlineCurrencyEuro } from 'react-icons/hi'
import { BsCalendarCheck } from 'react-icons/bs'
import { TbArrowsExchange } from 'react-icons/tb'
import { MdOutlineSavings } from 'react-icons/md'
import { getLeastOneMonthPaymentData } from '@/apis/MassschuheManagemantApis'

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
}

const defaultData: BalanceCardData = {
    gesamteinnahmen: null,
    gesamteinnahmenChange: '---',
    naechsteAuszahlung: null,
    naechsteAuszahlungDatum: '01.05.2025',
    kuerzlicheAuszahlungen: [
        { amount: null, date: '01.05.2025' },
        { amount: null, date: '01.05.2025' },
    ],
    ruecklagebetrag: null,
    ruecklagebetragDatum: '--',
};

export default function BalanceCard({ data = defaultData }: BalanceCardProps) {
    const [lastMonthData, setLastMonthData] = useState<{
        totalPrice: number | null;
        period: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch last month payment data
    useEffect(() => {
        const fetchLastMonthData = async () => {
            try {
                setLoading(true);
                const response = await getLeastOneMonthPaymentData();
                if (response.success && response.data?.lastMonth) {
                    setLastMonthData({
                        totalPrice: response.data.lastMonth.totalPrice,
                        period: response.data.lastMonth.period,
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

            {/* Kürzliche Auszahlungen */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <TbArrowsExchange className="w-5 h-5 text-emerald-500" />
                    </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Kürzliche Auszahlungen</h3>
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
                            <span className="text-xs text-gray-500 break-words">{lastMonthData.period}</span>
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
            </div>

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
