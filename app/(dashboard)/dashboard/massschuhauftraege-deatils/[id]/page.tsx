'use client'

import React from 'react'
import Bodenkonstruktion from '../../_components/Massschuhauftraeges/Details/Bodenkonstruktion'
import { useParams, useSearchParams } from 'next/navigation';
import ShoeDetails from '../../_components/Massschuhauftraeges/Details/ShoeDetails';

export default function MassschuhauftraegeDeatilsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params?.id as string;
    const orderId = searchParams?.get('orderId') || null;
    
    return (
        <div>
            {
                id === "1" ? (
                    <ShoeDetails orderId={orderId} />
                ) : id === "2" ? (
                    <Bodenkonstruktion orderId={orderId} />
                ) : (
                    <div>Invalid ID</div>
                )
            }
        </div>
    )
}

