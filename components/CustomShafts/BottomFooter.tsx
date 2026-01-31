import { useRouter } from 'next/navigation';
import React from 'react'


export default function BottomFooter() {
    const router = useRouter();

    const handleOrder = () => {
        // console.log('order');
        router.push('/dashboard/bodenkonstruktion');
    }

    return (


        <div className='flex justify-between items-start gap-8 mt-16 pt-8 border-t border-gray-200'>

            {/* adresse */}
            <div className='flex-1 flex items-start gap-6'>
                {/* Logo */}
                <div className='flex-shrink-0'>
                    <img
                        src="/images/logo.png"
                        alt="FeetF1rst Logo"
                        className='h-24 w-auto object-contain'
                    />
                </div>

                {/* Address */}
                <div className='text-sm text-gray-600 space-y-0.5'>
                    <p className='font-semibold text-gray-800'>FeetF1rst S.R.L.S.</p>
                    <p>Via Pipen, 5</p>
                    <p>39031 Brunico (BZ)</p>
                    <p>Italien</p>
                </div>
            </div>

            {/* right side */}
            <div className='flex-1 max-w-2xl'>
                <h3 className='text-lg font-bold mb-3'>Bodenkonstruktion & Leistenversand</h3>
                <p className='text-sm text-gray-600 mb-4 leading-relaxed'>
                Für die Bodenkonstruktion benötigen wir – je nach Auftrag – den passenden Leisten. Bitte sende physische Leisten gut verpackt an die angeführte Adresse und lege die Bestellnummer bei.
                </p>
                <button onClick={handleOrder} className='text-sm text-[#388E3C] px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 group cursor-pointer'>
                    Zur Bodenkonstruktion
                    <span className='transform transition-transform group-hover:translate-x-1'>→</span>
                </button>
            </div>

        </div>

    )
}