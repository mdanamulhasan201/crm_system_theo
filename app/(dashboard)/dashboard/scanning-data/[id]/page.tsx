'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

import MassschuheForm from '@/app/(dashboard)/dashboard/_components/Scanning/MassschuheForm';
import ScannningDataPage from '@/app/(dashboard)/dashboard/_components/ScannningData/ScannningDataPage';

import { useSingleCustomer } from '@/hooks/customer/useSingleCustomer'
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Einlagen from '@/app/(dashboard)/dashboard/_components/Scanning/Einlagen';
import { getSingleOrder } from '@/apis/productsOrder';



export default function ScanningData() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { customer: scanData, loading, error, updateCustomer, refreshCustomer } = useSingleCustomer(String(params.id));
    const [selectedForm, setSelectedForm] = useState<'einlagen' | 'massschuhe'>('einlagen');
    const [prefillOrderData, setPrefillOrderData] = useState<any | null>(null);
    const [orderPrefillError, setOrderPrefillError] = useState<string | null>(null);
    const [orderPrefillLoading, setOrderPrefillLoading] = useState(false);
    const [selectedScreenerId, setSelectedScreenerId] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        if (!orderId) {
            setPrefillOrderData(null);
            setOrderPrefillError(null);
            setOrderPrefillLoading(false);
            return () => {
                isMounted = false;
            };
        }

        const fetchOrder = async () => {
            setOrderPrefillLoading(true);
            setOrderPrefillError(null);
            try {
                const response = await getSingleOrder(orderId);
                if (!isMounted) return;
                const payload = (response as any)?.data ?? response;
                setPrefillOrderData(payload);
            } catch (err) {
                if (!isMounted) return;
                setOrderPrefillError('Fehler beim Laden des Auftrags.');
                setPrefillOrderData(null);
            } finally {
                if (isMounted) {
                    setOrderPrefillLoading(false);
                }
            }
        };

        void fetchOrder();

        return () => {
            isMounted = false;
        };
    }, [orderId]);


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!scanData) return <div>Scan not found</div>;

    return (
        <div className="p-4">
            {/* backbutton */}
            <div className='mb-6'>
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>
            <ScannningDataPage 
                scanData={scanData} 
                selectedForm={selectedForm}
                onScreenerIdChange={setSelectedScreenerId}
            />
            <hr className='my-10 border-gray-500' />
            {orderId && orderPrefillLoading && (
                <div className="text-sm text-gray-500 mb-4">Auftrag wird geladen...</div>
            )}
            {orderId && orderPrefillError && (
                <div className="text-sm text-red-500 mb-4">{orderPrefillError}</div>
            )}

            {/* Form Type Selection Buttons */}
            <div className="flex gap-4 mb-10">
                <Button
                    onClick={() => setSelectedForm('einlagen')}
                    className={`px-8 py-5 cursor-pointer rounded-lg font-semibold transition-colors ${selectedForm === 'einlagen'
                        ? 'bg-[#62A17C] text-white hover:bg-[#4A8A5F]'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    Einlagen
                </Button>
                <Button
                    onClick={() => setSelectedForm('massschuhe')}
                    className={`px-8 py-5 cursor-pointer rounded-lg font-semibold transition-colors ${selectedForm === 'massschuhe'
                        ? 'bg-[#62A17C] text-white hover:bg-[#4A8A5F]'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    Massschuhe
                </Button>
            </div>

            {/* Form section */}
            {selectedForm === 'einlagen' ? (
                <Einlagen
                    customer={scanData}
                    prefillOrderData={prefillOrderData}
                    screenerId={selectedScreenerId}
                    onCustomerUpdate={(updatedCustomer) => {
                        updateCustomer(updatedCustomer);
                    }}
                    onDataRefresh={() => {
                        refreshCustomer();
                    }}
                />
            ) : (
                <MassschuheForm
                    customer={scanData}
                    onCustomerUpdate={(updatedCustomer) => {
                        updateCustomer(updatedCustomer);
                    }}
                    onDataRefresh={() => {
                        refreshCustomer();
                    }}
                />
            )}
            {/* Bottom Action Links */}
        </div>
    );
}