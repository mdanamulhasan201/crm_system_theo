
import React from 'react'
import Versorgungencard from '../_components/Versorgungs/Versorgungencard'

export default function VersorgungsPage() {
    return (
        <div className='mb-20'>
            <div className='flex flex-col gap-2'>
                <h1 className='text-2xl font-bold capitalize'>VERSORGUNGEN</h1>
                <p>Erstelle jetzt Versorgungen, die du häufig verwendest – für eine noch schnellere Abwicklung deiner Arbeitszettel.</p>
            </div>
            <Versorgungencard />
        </div>
    )
}
