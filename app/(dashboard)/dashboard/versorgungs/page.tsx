
import React from 'react'
import Alltagseinlagen from '../_components/Versorgungs/Alltagseinlagen'
import Sporteinlagen from '../_components/Versorgungs/Sporteinlagen'
import Businesseinlagen from '../_components/Versorgungs/Businesseinlagen'

export default function VersorgungsPage() {
    return (
        <div className='mb-20'>
            <div className='flex flex-col gap-2'>
                <h1 className='text-2xl font-bold capitalize'>VERSORGUNGEN</h1>
                <p>Erstelle jetzt Versorgungen, die du häufig verwendest – für eine noch schnellere Abwicklung deiner Arbeitszettel.</p>
            </div>
            <Alltagseinlagen />
            <Sporteinlagen />
            <Businesseinlagen />
        </div>
    )
}
