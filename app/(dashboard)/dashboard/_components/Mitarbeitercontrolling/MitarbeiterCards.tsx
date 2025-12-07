'use client';

import React from 'react';
import {
    TbClock,
    TbCalendar,
    TbUsers,
    TbFileText
} from 'react-icons/tb';

// Card data - declare in children component
const cardsData = [
    {
        id: 'hours-week',
        title: 'Stunden diese Woche',
        value: '162 h',
        trend: {
            percentage: '8%',
            label: 'vs. letzte Woche',
            isPositive: true
        },
        icon: TbClock,
        iconBgColor: 'bg-emerald-50'
    },
    {
        id: 'hours-month',
        title: 'Stunden diesen Monat',
        value: '684 h',
        icon: TbCalendar,
        iconBgColor: 'bg-emerald-50'
    },
    {
        id: 'active-employees',
        title: 'Aktive Mitarbeiter',
        value: '3 / 5',
        icon: TbUsers,
        iconBgColor: 'bg-emerald-50'
    },
    {
        id: 'leave-requests',
        title: 'Offene Urlaubsanträge',
        value: '2',
        icon: TbFileText,
        iconBgColor: 'bg-amber-50'
    }
];

export default function MitarbeiterCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {cardsData.map((card) => {
                const IconComponent = card.icon;
                return (
                    <div
                        key={card.id}
                        className="relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 md:p-6 shadow-sm overflow-hidden"
                    >
                        {/* Icon in top-right corner */}
                        <div className={`absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg ${card.iconBgColor}`}>
                            <IconComponent className="text-emerald-500 text-lg sm:text-xl md:text-2xl" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xs sm:text-sm md:text-base font-medium text-slate-600 mb-3 sm:mb-4 pr-12 sm:pr-14 md:pr-16">
                            {card.title}
                        </h3>

                        {/* Value and Trend */}
                        <div className="flex flex-col">
                            {/* Main Value */}
                            <p className="text-2xl sm:text-3xl md:text-4xl  font-bold text-slate-900 mb-2 sm:mb-3">
                                {card.value}
                            </p>

                            {/* Trend/Comparison */}
                            {card.trend && (
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className={`text-xs sm:text-sm font-medium ${card.trend.isPositive !== false ? 'text-emerald-500' : 'text-red-500'
                                        }`}>
                                        {card.trend.isPositive !== false ? '↑' : '↓'} {card.trend.percentage}
                                    </span>
                                    <span className="text-xs sm:text-sm text-slate-400">
                                        {card.trend.label}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
