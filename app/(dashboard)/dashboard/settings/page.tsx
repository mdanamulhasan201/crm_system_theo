"use client"
import React from 'react'
import Link from 'next/link'
import { FiSettings } from 'react-icons/fi'
import { TbBrandFeedly } from 'react-icons/tb'
import { BiLogOut } from 'react-icons/bi'
import { RiArrowRightLine } from 'react-icons/ri'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import { MdProductionQuantityLimits } from 'react-icons/md'
import { shouldUnoptimizeImage } from '@/lib/imageUtils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Phone, Mail, Clock } from 'lucide-react'
import { getAllLocations } from '@/apis/setting/locationManagementApis'

type StoreLocation = {
    id: string;
    address: string;
    description?: string;
    isPrimary: boolean;
    createdAt: string;
};

export default function Settingss() {
    const [showLanguageDropdown, setShowLanguageDropdown] = React.useState(false);
    const { logout, user } = useAuth();
    const [isLogoutOpen, setIsLogoutOpen] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);
    const [locations, setLocations] = React.useState<StoreLocation[]>([]);

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
            subtitle: "Konto, Benutzer, Sicherheit",
            href: "/dashboard/settings-profile",
            icon: FiSettings,
            alt: "Settings",
        },
        {
            label: "Versorgungen",
            subtitle: "Aktive Services & Status",
            href: "/dashboard/versorgungs",
            icon: MdProductionQuantityLimits,
            alt: "Versorgungs",
        },
        {
            label: "Software",
            subtitle: "Module & Lizenzen",
            href: "/dashboard/software",
            icon: TbBrandFeedly,
            alt: "Software",
        },
        {
            label: "Abmelden",
            subtitle: "Session beenden",
            href: "#",
            icon: BiLogOut,
            alt: "Logout",
            onClick: handleLogoutClick
        },
    ];

    // const handleSettingsClick = () => {
    //     router.push("/dashboard/account-settings");
    // };

    // Get user image URL - already comes as full URL from auth context
    const userImageUrl = user?.image || null;

    // Reset image error when user image changes
    React.useEffect(() => {
        setImageError(false);
    }, [userImageUrl]);

    // Fetch store locations from API
    React.useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await getAllLocations(1, 100);
                const list = res?.data ?? [];
                setLocations(Array.isArray(list) ? list : []);
            } catch {
                setLocations([]);
            }
        };
        fetchLocations();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Accountverwaltung</h1>


            {/* partner design section */}
            <div className="block mb-8 w-full">
                <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6">
                    {/* Left Section - Company Details */}
                    <div className="flex items-center gap-4 flex-1">
                        {/* Company Icon */}
                        <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {userImageUrl && !imageError ? (
                                <Image
                                    src={userImageUrl}
                                    alt="company logo"
                                    width={100}
                                    height={100}
                                    className="w-full h-full object-cover rounded-lg border"
                                    unoptimized={shouldUnoptimizeImage(userImageUrl)}
                                    onError={() => {
                                        setImageError(true);
                                    }}
                                />
                            ) : (
                                <span className="text-3xl font-bold text-blue-600">
                                    {user?.busnessName?.charAt(0).toUpperCase() || 'T'}
                                </span>
                            )}
                        </div>

                        <div>
                            {/* Company Information */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="font-bold text-xl text-gray-900 capitalize">
                                        {user?.busnessName || '-'}
                                    </h2>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                    {/* Customer Number */}
                                    <div>
                                        <span className="text-sm font-semibold">
                                            Kd.-Nr. {user?.partnerId ?? '001004'}
                                        </span>
                                    </div>



                                    {/* Enterprise Label */}
                                    <div>
                                        <span className="text-sm text-gray-500">Unternehmen</span>
                                    </div>

                                    {/* Active Status Badge */}
                                    <div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            Aktiv
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Location - primary store location from API */}
                            {(() => {
                                const primary = locations.find((loc) => loc.isPrimary);
                                if (!primary) return null;
                                return (
                                    <div>
                                        <p className="text-sm text-gray-500">{primary.address}</p>
                                        {primary.description && (
                                            <span className="text-sm text-gray-500">{primary.description}</span>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Right Section - Account Management */}
                    <div className="flex flex-col items-end gap-4 ml-6">
                        {/* Account verwalten Button */}
                        <Link
                            href="/dashboard/account-settings"
                            className="flex items-center gap-2 px-4 py-2  border border-[#61A07B] text-[#61A07B] rounded-lg hover:bg-green-50  transition-colors font-medium text-sm"
                        >
                            <span>Account verwalten</span>
                            <RiArrowRightLine className="text-[#61A07B] " />
                        </Link>


                    </div>
                </div>
            </div>

            {/* manager card */}
            <div className="block mb-8 w-full">
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    {/* Header Section */}
                    <div className="mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                            Ihr Ansprechpartner
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Ihr direkter Kontakt für alle Fragen rund um FeetF1rst
                        </p>
                    </div>
                    
                    {/* Main Content Section */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        {/* Left Section - Contact Person */}
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            {/* Manager Avatar */}
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 border border-[#61A07B]">
                                <span className="text-lg sm:text-xl font-semibold text-[#61A07B]">
                                    MM
                                </span>
                            </div>
                            
                            {/* Manager Information */}
                            <div className="space-y-0.5 min-w-0 flex-1">
                                <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                                    Michael Maier
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Vertriebsleiter
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Mo-Fr, 9:00-17:00
                                </p>
                            </div>
                        </div>
                        
                        {/* Right Section - Contact Details */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 lg:ml-6 flex-shrink-0">
                            {/* Phone Button */}
                            <a 
                                href="tel:+436602951239" 
                                className="flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
                            >
                                <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold truncate">+43 660 2951239</span>
                            </a>
                            
                            {/* Email Button */}
                            <a 
                                href="mailto:m.maier@feetf1rst.com" 
                                className="flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 border border-[#61A07B] text-[#61A07B] rounded-lg hover:bg-green-50 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
                            >
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                <span className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">m.maier@feetf1rst.com</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

{/* settings options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                {settingsOptions.map((option, index) => {
                    const isLogout = option.label === "Abmelden";
                    const CardContent = (
                        <div className={`flex items-center gap-4 p-4 sm:p-5 rounded-lg border transition-all duration-200 cursor-pointer group ${
                            isLogout 
                                ? "bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400" 
                                : "bg-white border-gray-200 hover:shadow-md"
                        }`}>
                            {/* Icon */}
                            <div className="flex-shrink-0">
                                <option.icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                                    isLogout ? "text-gray-500 group-hover:text-gray-600" : "text-gray-600 group-hover:text-gray-900"
                                }`} />
                            </div>
                            
                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-sm sm:text-base mb-0.5 ${
                                    isLogout ? "text-gray-600 group-hover:text-gray-700" : "text-gray-900"
                                }`}>
                                    {option.label}
                                </h3>
                                <p className="text-xs sm:text-sm truncate text-gray-500">
                                    {option.subtitle || ''}
                                </p>
                            </div>
                            
                            {/* Chevron Icon */}
                            <div className="flex-shrink-0">
                                <RiArrowRightLine className={`w-5 h-5 transition-colors ${
                                    isLogout ? "text-gray-400 group-hover:text-gray-500" : "text-gray-400 group-hover:text-gray-600"
                                }`} />
                            </div>
                        </div>
                    );

                    if (option.onClick) {
                        return (
                            <div key={index} onClick={option.onClick}>
                                {CardContent}
                            </div>
                        );
                    }

                    return (
                        <Link key={index} href={option.href}>
                            {CardContent}
                        </Link>
                    );
                })}
            </div>

            {/* Support & Hilfe Footer Section */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg  font-semibold text-gray-900 mb-2">
                        Support & Hilfe
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Unser Team unterstützt Sie gerne persönlich.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8">
                    {/* Phone */}
                    <div className="flex items-center gap-2 text-base text-gray-500">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <a href="tel:+390471123456" className="text-gray-500">
                            +39 0471 123 456
                        </a>
                    </div>
                    
                    {/* Email */}
                    <div className="flex items-center gap-2 text-base text-gray-500">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <a href="mailto:support@example.com" className="text-gray-500">
                            support@example.com
                        </a>
                    </div>
                    
                    {/* Response Time */}
                    <div className="flex items-center gap-2 text-base text-gray-500">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <span>Antwortzeit: innerhalb 24h</span>
                    </div>
                </div>
            </div>

            {/* Notfall-Support Section - Bottom */}
            <div className="mt-5  py-5 border-b border-t border-gray-200">
                <div className="bg-white rounded-lg  border-gray-200 ">
                    <div className="mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                            Notfall-Support
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Bei kritischen Systemausfällen außerhalb der Geschäftszeiten.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-h-[48px] border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center text-gray-500 text-sm">
                        0039 366 508 7742
                        </div>
                        <a
                            href="tel:+00393665087742"
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-[#61A07B] text-[#61A07B] rounded-lg hover:bg-green-50 transition-colors font-medium text-sm whitespace-nowrap"
                        >
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            Notfall anrufen
                        </a>
                    </div>
                </div>
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
