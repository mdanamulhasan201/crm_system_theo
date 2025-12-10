'use client'
import React from 'react'


export default function AktuelleBalance() {

    const data = {
        balance: -575.94,
    }
    const isNegative = data.balance < 0;

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
                <div className="md:text-xl lg:text-2xl xl:text-4xl font-bold text-emerald-500 mb-6">
                    {isNegative ? '-' : '+'}{formatCurrency(data.balance)}€
                </div>

                <div className="space-y-1 text-sm text-gray-500 italic">
                    <p>+ "Betrag wird Ende des Monats gutgeschrieben"</p>
                    <p>- "Betrag wird Ende des Monats abgezogen"</p>
                </div>
            </div>
        </div>
    );
}
