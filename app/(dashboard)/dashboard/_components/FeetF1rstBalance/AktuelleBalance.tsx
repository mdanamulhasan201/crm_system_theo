'use client'
import React, { useEffect, useState } from 'react'
import { balanceMassschuheOrder } from '@/apis/MassschuheManagemantApis'

export default function AktuelleBalance() {
    const [balance, setBalance] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                setLoading(true)
                const response = await balanceMassschuheOrder()
                // New API returns { data: { totalPrice } }
                const value = (response as any)?.data?.totalPrice ?? (response as any)?.totalPrice ?? 0
                setBalance(typeof value === 'number' ? value : Number(value) || 0)
            } catch (error) {
                console.error('Failed to fetch balance:', error)
                setBalance(0)
            } finally {
                setLoading(false)
            }
        }
        fetchBalance()
    }, [])

    const formatCurrency = (value: number) => {
        const absValue = Math.abs(value);
        return absValue.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-between">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aktuelle Balance</h2>

            <div className="flex-1 flex flex-col justify-center">
                <div className="md:text-xl lg:text-2xl xl:text-4xl font-bold text-red-500 mb-6">
                    {loading
                        ? 'Lädt...'
                        : `-${formatCurrency(Math.abs(balance ?? 0))}€`}
                </div>

                <div className="space-y-1 text-sm text-gray-500 italic">
                    <p>+ "Betrag wird Ende des Monats gutgeschrieben"</p>
                    <p>- "Betrag wird Ende des Monats abgezogen"</p>
                </div>
            </div>
        </div>
    );
}
