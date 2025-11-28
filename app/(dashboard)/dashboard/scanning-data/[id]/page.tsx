'use client'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import MassschuheForm from '@/app/(dashboard)/dashboard/_components/Scanning/MassschuheForm';
import ScannningDataPage from '@/app/(dashboard)/dashboard/_components/ScannningData/ScannningDataPage';

import { useSingleCustomer } from '@/hooks/customer/useSingleCustomer'
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Einlagen from '@/app/(dashboard)/dashboard/_components/Scanning/Einlagen';



export default function ScanningData() {
    const router = useRouter();
    const params = useParams();
    const { customer: scanData, loading, error, updateCustomer, refreshCustomer } = useSingleCustomer(String(params.id));
    const [selectedForm, setSelectedForm] = useState<'einlagen' | 'massschuhe'>('einlagen');


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
            <ScannningDataPage scanData={scanData} />
            <hr className='my-10 border-gray-500' />

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