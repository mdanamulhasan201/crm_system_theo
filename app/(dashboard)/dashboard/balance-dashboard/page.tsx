'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AktuelleBalance from "../_components/FeetF1rstBalance/AktuelleBalance";
import BalanceCard from "../_components/FeetF1rstBalance/BalanceCard";
import BalanceVerlaufChart from "../_components/FeetF1rstBalance/BalanceVerlaufChart";
import DataTables from "../_components/FeetF1rstBalance/DataTables";
import Ausgaben from "../_components/FeetF1rstBalance/Ausgaben";
import { useFeatureAccess } from "@/contexts/FeatureAccessContext";

export default function BalanceDashboard() {
    const [activeTab, setActiveTab] = useState<'einnahmen' | 'ausgaben'>('einnahmen');
    const { isPathAllowed, loading: featureLoading } = useFeatureAccess();
    
    // Check if "/dashboard/kasse" has action: true
    const showEinnahmenButton = isPathAllowed('/dashboard/kasse');

    // If einnahmen button is hidden but activeTab is einnahmen, switch to ausgaben
    useEffect(() => {
        if (!featureLoading && !showEinnahmenButton && activeTab === 'einnahmen') {
            setActiveTab('ausgaben');
        }
    }, [showEinnahmenButton, activeTab, featureLoading]);

    return (
        <div className="">
            <h1 className="text-2xl font-bold text-gray-800">FeetF1rst Balance</h1>
            <p className="text-gray-500 mt-2 max-w-6xl mb-6">
                Hier sehen Sie alle über FeetF1rst entstandenen Einnahmen und Ausgaben.
                Am Monatsende erfolgt eine automatische Abrechnung – je nach Saldo erhalten Sie eine Auszahlung oder der Betrag wird eingezogen.

            </p>

            {/* Top Row: Aktuelle Balance + Balance Verlauf Chart */}
            <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="w-full lg:w-4/12">
                    <AktuelleBalance />
                </div>
                <div className="w-full lg:w-8/12">
                    <BalanceVerlaufChart />
                </div>
            </div>

            {/* Bottom Row: Four Stat Cards */}
            <BalanceCard />

            <div className="mt-10">
                {/* Header */}
                <h2 className="text-xl font-bold text-gray-800 ">Transaktionen</h2>
                {/* Ausgaben and  Einnahmen  button*/}

                <div className="flex flex-row gap-4 mt-5">
                    <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('ausgaben')}
                        className={`cursor-pointer border rounded-md px-4 py-2 font-semibold transition-all duration-200 ${
                            activeTab === 'ausgaben' 
                                ? 'bg-[#61A175] text-white border-[#61A175] hover:bg-[#61A175] hover:text-white' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200'
                        }`}
                    >
                        Ausgaben
                    </Button>
                    {showEinnahmenButton && (
                        <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('einnahmen')}
                            className={`cursor-pointer border rounded-md px-4 py-2 font-semibold transition-all duration-200 ${
                                activeTab === 'einnahmen' 
                                    ? 'bg-[#61A175] text-white border-[#61A175] hover:bg-[#61A175] hover:text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200'
                            }`}
                        >
                            Einnahmen
                        </Button>
                    )}
                </div>

                {activeTab === 'einnahmen' && showEinnahmenButton && <DataTables />}
                {activeTab === 'ausgaben' && <Ausgaben />}
            </div>
        </div>
    );
}
