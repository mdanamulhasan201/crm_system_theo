import { useRouter } from 'next/navigation';
import React from 'react'


export default function BottomFooter() {
    const router = useRouter();

    const handleOrder = () => {
        // console.log('order');
        router.push('/dashboard/massschuhauftraege-deatils/2');
    }

    return (


        <div className='flex justify-between items-start gap-8 mt-16 pt-8 border-t border-gray-200'>

            {/* adresse */}
            <div className='flex-1'>
                {/* Logo */}
                <div className='mb-4'>
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        className='h-12 w-auto object-contain'
                    />
                </div>

                {/* Address */}
                <div className='text-sm text-gray-600'>

                    <p className='text-sm text-gray-400'>
                        Adresse Fehlt -
                        <span>Via Pipen, 5
                            39031 Brunico (BZ)
                            Italien</span>
                    </p>
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