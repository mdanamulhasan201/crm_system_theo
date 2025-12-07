'use client';

import React, { useState, useRef, useCallback } from 'react';
import CardStatistik from '../_components/Massschuhauftraeges/CardS'
import MassschuhaufträgeChart from '../_components/Massschuhauftraeges/MassschuhaufträgeChart'
import CustomerSearch from '../_components/Massschuhauftraeges/CustomerSearch'
import ChangesOrderProgress from '../_components/Massschuhauftraeges/ChangesOrderProgress';

import ProductionView from '../_components/Massschuhauftraeges/ProductionView';
import WelcomePopup from '../_components/Massschuhauftraeges/WelcomePopup';
import { useRouter } from 'next/navigation';
import CardDeatilsPage from '../_components/Massschuhauftraeges/CardDeatilsPage';

export default function MassschuhauftraegePage() {
    const [showPopup, setShowPopup] = useState(false);
    const [showPopup2, setShowPopup2] = useState(false);
    const [tabClicked, setTabClicked] = useState<number>(0);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const refetchProductionViewRef = useRef<(() => void) | null>(null);
    const router = useRouter()
    
    // Stable callback to set refetch function
    const handleRefetchReady = useCallback((refetch: () => void) => {
        refetchProductionViewRef.current = refetch;
    }, []);
    
    // Stable callback to call refetch
    const handleRefetchProductionView = useCallback(() => {
        refetchProductionViewRef.current?.();
    }, []);
    const handleStart = () => {
        router.push('/dashboard/massschuhauftraege-deatils/1');
    };
    const handleStart2 = () => {
        router.push('/dashboard/massschuhauftraege-deatils/2');
    };
    return (
        <div>
            {showPopup && (
                <WelcomePopup
                    onClose={() => setShowPopup(false)}
                    onStart={handleStart}
                    title="Willkommen zur"
                    details="Halbprobenerstellung mit FeetF1rst"
                    buttonText="JETZT STARTEN"
                    description="In den nächsten Schritten erfassen wir die wichtigsten informationen, um die Fußversorgung Ihres Kunden optimal auf ihre Anforderungen abzustimmen."
                    infoText="Alle Angaben können am Ende nochmals überprüft werden."
                />
            )}

            {showPopup2 && (
                <WelcomePopup
                    onClose={() => setShowPopup2(false)}
                    onStart={handleStart2}
                    title="Willkommen zur Bodenerstellung "
                    details="mit FeetF1rst"
                    buttonText="JETZT STARTEN"
                    description="In den nächsten Schritten erfassen wir die wichtigsten Informationen, damit die Bodenkonstruktion perfekt auf Ihre Anforderungen abgestimmt wird."
                    infoText="Alle Angaben können am Ende nochmals überprüft werden."
                />
            )}
            <CardStatistik />
            <MassschuhaufträgeChart />
            <CustomerSearch />

            <ChangesOrderProgress
                onClick2={() => {
                    setShowPopup2(true)
                }}
                onClick={() => {
                    setShowPopup(true)
                }}
                setTabClicked={setTabClicked} 
                tabClicked={tabClicked}
                selectedOrderId={selectedOrderId}
                onTabChange={setTabClicked}
                onRefetchProductionView={handleRefetchProductionView}
            />
            <ProductionView 
                tabClicked={tabClicked} 
                onOrderSelect={setSelectedOrderId}
                selectedOrderId={selectedOrderId}
                onTabChange={setTabClicked}
                onRefetchReady={handleRefetchReady}
            />

            <CardDeatilsPage />
        </div>
    );
}
