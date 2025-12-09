'use client';

import React from 'react';
import { FaArrowUp } from 'react-icons/fa';

import BottomCard from './BottomCard';
import BottomChartData from './BottomChartData';





export default function CardDetailsPage() {


    return (
        <div className="w-full mt-8">
            {/* Top Row: 2 cards */}
            <div className="flex flex-row gap-6 mb-6">
                {/* Card 1: Aktuelle Dauer */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm w-full md:w-4/12">
                    <div className="mb-4 text-lg font-medium text-slate-700 text-center">
                        Aktuelle Dauer
                    </div>
                    <div className="mb-3 text-center">
                        <div className="text-4xl font-semibold text-slate-900">15,0</div>
                        <h2 className="text-xl text-black font-bold">Tage</h2>
                    </div>
                    <div className="flex flex-col  items-center gap-2 text-xl">
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-500">
                            <FaArrowUp className="h-3 w-3" />
                            1,2 Tage
                        </span>
                        <span className="text-slate-400 text-lg">vs. Vormonat</span>
                    </div>
                </div>

                {/* Card 2: Linienverlauf - Letzte Monate */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm w-full md:w-8/12">
                    <div className="mb-4 text-base font-medium text-slate-600">
                        Linienverlauf - Letzte Monate
                    </div>
                    <div className="h-48 w-full">
                        <BottomChartData />
                    </div>
                </div>
            </div>

            <BottomCard />
        </div>
    );
}
