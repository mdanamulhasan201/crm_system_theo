"use client"
import React from 'react'
import Link from 'next/link'
import { BiCube } from 'react-icons/bi'
import { BiMessageDetail } from 'react-icons/bi'
import { FiSettings } from 'react-icons/fi'
import { TbBrandFeedly } from 'react-icons/tb'
import { BiSupport } from 'react-icons/bi'
import { BiGlobe } from 'react-icons/bi'
import { BiLogOut } from 'react-icons/bi'
import { RiArrowRightLine } from 'react-icons/ri'
import { useAuth } from '@/contexts/AuthContext'
import LanguageSwitcher from '@/components/Shared/LanguageSwitcher'
import Image from 'next/image'
import { MdProductionQuantityLimits } from 'react-icons/md'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function Settingss() {
    const [showLanguageDropdown, setShowLanguageDropdown] = React.useState(false);
    const { logout, user } = useAuth();
    const [isLogoutOpen, setIsLogoutOpen] = React.useState(false);

    const handleLanguageClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowLanguageDropdown(!showLanguageDropdown);
    };

    const handleLogoutClick = () => {
        setIsLogoutOpen(true);
    };

    const confirmLogout = async () => {
        setIsLogoutOpen(false);
        await logout();
    };

    const settingsOptions = [
        // {
        //     label: "Produktverwaltung",
        //     href: "/dashboard/lager",
        //     icon: BiCube,
        //     className: "text-6xl text-gray-800 hover:text-primary-600 transition-colors ",
        //     alt: "Product Management",
        // },
        // {
        //     label: "Nachrichten",
        //     href: "/dashboard/email",
        //     icon: BiMessageDetail,
        //     className: "text-6xl text-gray-800 hover:text-primary-600 transition-colors",
        //     alt: "News",
        // },

        // {
        //     label: "Sprache",
        //     href: "#",
        //     icon: BiGlobe,
        //     className: "text-6xl text-gray-800 hover:text-primary-600 transition-colors",
        //     alt: "Language",
        //     onClick: handleLanguageClick,
        // },

        {
            label: "Einstellungen",
            href: "/dashboard/settings-profile",
            icon: FiSettings,
            className: "text-6xl text-gray-800 hover:text-primary-600 transition-colors",
            alt: "Settings",
        },
        {
            label: "Versorgungen",
            href: "/dashboard/versorgungs",
            icon: MdProductionQuantityLimits,
            className: "text-6xl text-gray-800 hover:text-primary-600 transition-colors",
            alt: "Versorgungs",
        },



        {
            label: "Software",
            href: "/dashboard/software",
            icon: TbBrandFeedly,
            className: "text-6xl text-gray-800 hover:text-primary-600 transition-colors",
            alt: "Software",
        },
        // {
        //     label: "Hilfe",
        //     href: "/dashboard/support",
        //     icon: BiSupport,
        //     className: "text-6xl text-gray-800 hover:text-primary-600 transition-colors",
        //     alt: "Support",
        // },

        {
            label: "Log Out",
            href: "#",
            icon: BiLogOut,
            className: "text-6xl text-gray-800 hover:text-primary-600 transition-colors",
            alt: "Logout",
            onClick: handleLogoutClick
        },
    ];

    // const handleSettingsClick = () => {
    //     router.push("/dashboard/account-settings");
    // };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Accountverwaltung</h1>

            <Link href="/dashboard/account-settings" className="block mb-8 w-full lg:w-[40%]">
                <div className="flex items-center border-2 border-gray-600 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors p-4">
                    <div className="border border-gray-300 rounded-md mr-4 p-2 w-40 h-40">
                        <Image
                            src={
                                user?.image
                                    ? (user.image.startsWith('http')
                                        ? user.image
                                        : `https://${user.image}`)
                                    : "/favicon.ico"
                            }
                            alt="user"
                            width={500}
                            height={500}
                            className="w-full h-full rounded-md object-contain"
                        />
                    </div>
                    <div className='flex justify-between items-center w-full'>
                        <div>
                            <h2 className="font-bold text-xl capitalize">{user?.busnessName}</h2>
                            <p className="text-sm text-gray-600">Infos, System und mehr</p>
                        </div>
                        <RiArrowRightLine className='text-gray-600 text-3xl' />
                    </div>
                </div>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 w-full justify-between items-center">
                {settingsOptions.map((option, index) => (
                    <div key={index} className="relative">
                        {option.onClick ? (
                            <div
                                className="flex flex-col items-center cursor-pointer capitalize"
                                onClick={option.onClick}
                            >
                                <div className="bg-white  hover:bg-gray-200 p-6 rounded-[40px] border-2 border-gray-300 hover:shadow-xl hover:border-primary-500 transition-all duration-300 mb-3">
                                    <div className='flex justify-center items-center px-10 py-2 w-full '>
                                        <option.icon className={option.className} />
                                    </div>
                                </div>
                                <span className="text-base font-medium text-gray-700">{option.label}</span>
                            </div>
                        ) : (
                            <Link href={option.href} className="flex flex-col items-center">
                                <div className="bg-white hover:bg-gray-200 p-6 rounded-[40px] border-2 border-gray-300 hover:shadow-xl hover:border-primary-500 transition-all duration-300 mb-3">
                                    <div className='flex justify-center items-center px-10 sm:px-10 lg:px-8 2xl:px-10 py-2  w-full '>
                                        <option.icon className={option.className} />
                                    </div>
                                </div>
                                <span className="text-base font-medium text-gray-700 capitalize">{option.label}</span>
                            </Link>
                        )}


                    </div>
                ))}
            </div>
            <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Logout bestätigen?</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center gap-3 pt-2">
                        <Button variant="outline" onClick={() => setIsLogoutOpen(false)} className="cursor-pointer">Abbrechen</Button>
                        <Button onClick={confirmLogout} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">Logout</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>


    )
}
