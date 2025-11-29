'use client'

import React from 'react'
import Bodenkonstruktion from '../../_components/Massschuhauftraeges/Details/Bodenkonstruktion'
import { useParams } from 'next/navigation';
import ShoeDetails from '../../_components/Massschuhauftraeges/Details/ShoeDetails';

export default function MassschuhauftraegeDeatilsPage() {
    const params = useParams();
    const id = params?.id as string;
    return (
        <div>
            {
                id === "1" ? (
                    <Bodenkonstruktion />
                ) : id === "2" ? (
                    <ShoeDetails />
                ) : (
                    <div>Invalid ID</div>
                )
            }
        </div>
    )
}

