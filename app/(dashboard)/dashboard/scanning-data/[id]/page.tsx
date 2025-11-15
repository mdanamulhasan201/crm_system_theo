'use client'
import React from 'react'
import { useParams, useRouter } from 'next/navigation'
// import Image from 'next/image'
// import folderImg from '@/public/images/scanning/folder.png'
// import userImg from '@/public/images/scanning/user.png'
// import shoesImg from '@/public/images/scanning/shoes.png'
// import emailImg from '@/public/images/scanning/email.png'
// import logoImg from '@/public/images/scanning/logo.png'
import Link from 'next/link';
import SacnningForm from '@/app/(dashboard)/dashboard/_components/Scanning/SacnningForm';
import ScannningDataPage from '@/app/(dashboard)/dashboard/_components/ScannningData/ScannningDataPage';

import { useSingleCustomer } from '@/hooks/customer/useSingleCustomer'
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';



export default function ScanningData() {
    const router = useRouter();
    const params = useParams();
    const { customer: scanData, loading, error, updateCustomer, refreshCustomer } = useSingleCustomer(String(params.id));


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
            {/*  form section */}
            <SacnningForm
                customer={scanData}
                onCustomerUpdate={(updatedCustomer) => {
                    updateCustomer(updatedCustomer);
                }}
                onDataRefresh={() => {
                    refreshCustomer();
                }}
            />
            {/* Bottom Action Links */}
            <div className=" grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 text-center  ">

                {/* <div className="flex flex-col items-center">
                    <div
                        onClick={handleWerkstattzettleClick}
                        className="p-3 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full mb-2 relative transition-all duration-300"
                    >
                        <Image src={fxImg} alt="Werkstattzettel" width={50} height={50} className='w-11 h-auto' />
                    </div>
                    <span className="text-sm">Werkstattzettel<br />ausdrucken</span>
                </div> */}

                {/* <div className="flex flex-col items-center">
                    <Link href="" className="p-3 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full mb-2 relative transition-all duration-300">
                        <Image src={folderImg} alt="Kundenordner" width={50} height={50} className='w-10 h-auto' />

                    </Link>
                    <span className="text-sm">Kundenordner</span>
                </div> */}

                {/* <div className="flex flex-col items-center">
                    <Link href={`/dashboard/customer-history/${scanData.id}`} className="p-3 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full mb-2 relative transition-all duration-300">
                        <Image src={userImg} alt="Kundendaten" width={50} height={50} className='w-10 h-auto' />
                    </Link>
                    <span className="text-sm">Kundendaten und - historie</span>
                </div> */}

                {/* <div className="flex flex-col items-center">
                    <Link href=" " className="p-3 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full mb-2 relative transition-all duration-300">
                        <Image src={shoesImg} alt="Schuhfinder" width={50} height={50} className='w-12 h-auto' />

                    </Link>
                    <span className="text-sm">Shoe Finder</span>
                </div> */}

                {/* <div className="flex flex-col items-center">
                    <Link href="/dashboard/email" className="p-3 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full mb-2 relative transition-all duration-300">
                        <Image src={emailImg} alt="Email" width={50} height={50} className='w-11 h-auto' />
                    </Link>
                    <span className="text-sm">Email kontaktieren</span>
                </div> */}

                {/* <div className="flex flex-col items-center">
                    <Link href="" className="p-3 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full mb-2 relative transition-all duration-300">
                        <Image src={logoImg} alt="Zugang FeetFirst App" width={50} height={50} className='w-11 h-auto' />
                    </Link>
                    <span className="text-sm">Zugang FeetFirst<br />App</span>
                </div> */}
            </div>
        </div>
    );
}