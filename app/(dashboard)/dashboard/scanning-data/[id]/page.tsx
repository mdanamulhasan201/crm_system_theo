'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

import MassschuheForm from '@/app/(dashboard)/dashboard/_components/Scanning/MassschuheForm';
import ScanningDataPage from '@/app/(dashboard)/dashboard/_components/ScanningData/ScanningDataPage';

import { useSingleCustomer } from '@/hooks/customer/useSingleCustomer'
import { Button } from '@/components/ui/button';
// import { ArrowLeft } from 'lucide-react';
import Einlagen from '@/app/(dashboard)/dashboard/_components/Scanning/Einlagen';
import SonstigesForm from '@/app/(dashboard)/dashboard/_components/Scanning/SonstigesForm';
import { getPreviousOrders, getSingleOrder } from '@/apis/productsOrder';
// import userload from '@/public/images/scanning/userload.png'
import userImg from '@/public/images/scanning/user.png'
import Image from 'next/image'
import CustomerModal from '@/components/CustomerModal/CustomerModal'
import Loading from '@/components/Shared/Loading'
import PreviousOrdersModal from '@/components/PreviousOrdersModal/PreviousOrdersModal'


export default function ScanningData() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { customer: scanData, loading, error, updateCustomer, refreshCustomer } = useSingleCustomer(String(params.id));
    const [selectedForm, setSelectedForm] = useState<'einlagen' | 'massschuhe' | 'sonstiges'>('einlagen');
    const [prefillOrderData, setPrefillOrderData] = useState<any | null>(null);
    const [orderPrefillError, setOrderPrefillError] = useState<string | null>(null);
    const [orderPrefillLoading, setOrderPrefillLoading] = useState(false);
    const [selectedScreenerId, setSelectedScreenerId] = useState<string | null>(null);
    const [isVersorgungLoading, setIsVersorgungLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [addScanningModalOpen, setAddScanningModalOpen] = useState(false);
    const [previousOrdersModalOpen, setPreviousOrdersModalOpen] = useState(false);
    const [previousOrdersFetchType, setPreviousOrdersFetchType] = useState<'all' | 'customer'>('all');
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

    // Check for query parameter to open manage customer modal automatically
    useEffect(() => {
        const manageCustomer = searchParams.get('manageCustomer');
        if (manageCustomer === 'true') {
            setAddScanningModalOpen(true);
        }
    }, [searchParams]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!scanData) return <div>Scan not found</div>;


    // handle versorgungs page
    // const handleVersorgungsPage = (e: React.MouseEvent) => {
    //     e.preventDefault();
    //     setIsVersorgungLoading(true);
    //     router.push(`/dashboard/scanning-data/${scanData?.id}`);
    // };

    // handle customer history page
    const handleHistoryPage = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsHistoryLoading(true);
        router.push(`/dashboard/customer-history/${scanData?.id}`);
    };

    return (
        <div className="p-4">
            {/* Full Page Loading Overlay */}
            {(isVersorgungLoading || isHistoryLoading) && (
                <Loading
                    isFullPage={true}
                    message={isVersorgungLoading ? "Starting Versorgung..." : "Loading Customer History..."}
                />
            )}

            {/* Add New Scanning Modal */}
            <CustomerModal
                isOpen={addScanningModalOpen}
                onClose={() => {
                    setAddScanningModalOpen(false);
                    // Remove query parameter when modal is closed
                    const url = new URL(window.location.href);
                    url.searchParams.delete('manageCustomer');
                    router.replace(url.pathname + url.search);
                }}
                customerId={scanData?.id}
                onSubmit={() => {
                    refreshCustomer();
                }}
            />

            {/* Previous Orders Modal */}
            <PreviousOrdersModal
                isOpen={previousOrdersModalOpen}
                onClose={() => setPreviousOrdersModalOpen(false)}
                customerId={scanData?.id || ''}
                fetchType={previousOrdersFetchType}
            />

            {/* backbutton */}
            <div className='mb-6'>
                <div className='flex justify-between items-center gap-4'>
                    <div className=''>
                        <div className="">
                            {/* Versorgung starten */}
                            <div className="flex flex-col items-center">
                                {/* <button
                                    onClick={handleVersorgungsPage}
                                    disabled={isVersorgungLoading}
                                    className="p-5 flex items-center justify-center rounded-2xl border border-black bg-white hover:bg-gray-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Image src={userload} alt="Versorgung starten" width={70} height={70} />
                                </button> */}
                                {/* <span className="mt-2 text-center text-sm font-normal">Versorgung starten</span> */}
                            </div>
                            {/* Kundendaten -historie */}
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={handleHistoryPage}
                                    disabled={isHistoryLoading}
                                    className="p-5 cursor-pointer flex items-center justify-center rounded-2xl border border-black bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Image src={userImg} alt="Kundendaten -historie" width={60} height={60} />
                                </button>
                                <span className="mt-2 text-center text-sm font-normal">Kundendaten -historie</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setAddScanningModalOpen(true);
                            // Add query parameter to URL
                            const url = new URL(window.location.href);
                            url.searchParams.set('manageCustomer', 'true');
                            router.push(url.pathname + url.search);
                        }}
                        className='bg-[#62A07C] capitalize cursor-pointer text-white px-4 py-2 rounded hover:bg-[#62a07c98] transition text-sm'
                    >

                        {/* german name */}
                        Kunden verwalten
                    </button>
                </div>
            </div>


            <ScanningDataPage
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

            <div className='flex flex-col xl:flex-row justify-between items-center gap-4'>
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
                    <Button
                        onClick={() => setSelectedForm('sonstiges')}
                        className={`px-8 py-5 cursor-pointer rounded-lg font-semibold transition-colors ${selectedForm === 'sonstiges'
                            ? 'bg-[#62A17C] text-white hover:bg-[#4A8A5F]'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Sonstiges
                    </Button>
                </div>

                {/* Previous Orders Buttons */}
                <div className="flex gap-4 mb-6">
                    <Button
                        onClick={() => {
                            setPreviousOrdersFetchType('all');
                            setPreviousOrdersModalOpen(true);
                        }}
                        className="px-6 py-3 cursor-pointer rounded-lg font-semibold text-sm transition-colors bg-[#62A17C] text-white hover:bg-[#4A8A5F]"
                    >
                        Letzte Versorgung
                    </Button>
                    <Button
                        onClick={() => {
                            setPreviousOrdersFetchType('customer');
                            setPreviousOrdersModalOpen(true);
                        }}
                        className="px-6 py-3 cursor-pointer rounded-lg font-semibold text-sm transition-colors bg-[#62A17C] text-white hover:bg-[#4A8A5F]"
                    >
                        Vorherige Bestellungen
                    </Button>
                </div>
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
            ) : selectedForm === 'massschuhe' ? (
                <MassschuheForm
                    customer={scanData}
                    onCustomerUpdate={(updatedCustomer) => {
                        updateCustomer(updatedCustomer);
                    }}
                    onDataRefresh={() => {
                        refreshCustomer();
                    }}
                />
            ) : (
                <SonstigesForm
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