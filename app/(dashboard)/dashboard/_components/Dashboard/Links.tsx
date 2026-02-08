import dashboard from '@/public/images/dashboard/dashbord.png'
import users from '@/public/images/dashboard/user.png'
import date from '@/public/images/dashboard/date.png'
import settings from '@/public/images/dashboard/settings.png'
import home from '@/public/images/dashboard/home.png'
import Image from 'next/image';
import Link from 'next/link'

export default function Links() {
    return (
        <div>
            {/* Navigation Links */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-center w-full mt-10 uppercase'>
                <Link href="/dashboard/orders" className="flex flex-col items-center text-center">
                    <div className="bg-white px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg transition-all mb-2 hover:bg-gray-200 duration-300">
                        <Image src={dashboard} alt='dashboard' width={100} height={100} className='w-[110px] h-[110px]' />
                    </div>
                    <span className="text-md font-semibold">Aufträge</span>
                </Link>
                {/* <Link href="/dashboard/overview" className="flex flex-col items-center text-center">
                    <div className="bg-white px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg transition-all mb-2 hover:bg-gray-200 duration-300">
                        <Image src={dashboard} alt='dashboard' width={100} height={100} className='w-[130px] h-[130px]' />
                    </div>
                    <span className="text-md font-semibold">Aufträge</span>
                </Link> */}

                <Link href="/dashboard/customers" className="flex flex-col items-center text-center">
                    <div className="bg-white transition-all duration-300 hover:bg-gray-200 px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg mb-2">
                        <Image src={users} alt='users' width={200} height={200} className='w-[110px] h-[110px] p-7' />
                    </div>
                    <span className="text-md font-semibold">KUNDENSUCHE</span>
                </Link>

                <Link href="/dashboard/calendar" className="flex flex-col items-center text-center">
                    <div className="bg-white transition-all duration-300 hover:bg-gray-200 px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg mb-2">
                        <Image src={date} alt='calendar' width={100} height={100} className='w-[110px] h-[110px] p-7' />
                    </div>
                    <span className="text-md font-semibold">TERMINKALENDER</span>
                </Link>

                <Link href="/dashboard/settings" className="flex flex-col items-center text-center">
                    <div className="bg-white transition-all duration-300 hover:bg-gray-200 px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg mb-2">
                        <Image src={settings} alt='settings' width={100} height={100} className='w-[110px] h-[110px] p-7' />
                    </div>
                    <span className="text-md font-semibold">EINSTELLUNGEN</span>
                </Link>

                {/* <Link href="/dashboard/products" className="flex flex-col items-center text-center">
                    <div className="bg-white transition-all duration-300 hover:bg-gray-200 px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg mb-2">
                        <Image src={home} alt='products' width={100} height={100} className='w-[130px] h-[130px] p-7' />
                    </div>
                    <span className="text-md font-semibold">PRODUKTVERWALTUNG</span>
                </Link> */}
                <Link href="/dashboard/lager" className="flex flex-col items-center text-center">
                    <div className="bg-white transition-all duration-300 hover:bg-gray-200 px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg mb-2">
                        <Image src={home} alt='products' width={100} height={100} className='w-[110px] h-[110px] p-7' />
                    </div>
                    <span className="text-md font-semibold">PRODUKTVERWALTUNG</span>
                </Link>
            </div>
        </div>
    )
}
