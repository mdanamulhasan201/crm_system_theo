'use client'
import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoClose, IoSearchOutline } from 'react-icons/io5';
import {

    HiOutlineCube
} from 'react-icons/hi';
import { RxDashboard } from "react-icons/rx";
import {  HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureAccess } from '@/contexts/FeatureAccessContext';
import { shouldUnoptimizeImage } from '@/lib/imageUtils';
import { TbActivityHeartbeat, TbUsers, TbUserCircle } from 'react-icons/tb';


import type { IconType } from 'react-icons';
import type { StaticImageData } from 'next/image';
import { FiBarChart, FiUserPlus } from 'react-icons/fi';

import { FiDollarSign } from 'react-icons/fi';
import { BsCashStack } from 'react-icons/bs';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { BiNews, BiPackage } from 'react-icons/bi';
import { MdAccountBalanceWallet } from 'react-icons/md';
import Einlagenauftrag from '@/public/images/dashboard/partner_sidebar/Einlagenaufträge.png';
import Einstellungen from '@/public/images/dashboard/partner_sidebar/Einstellungen.png';
import Fußübungen from '@/public/images/dashboard/partner_sidebar/Fußübungen.png';
import Maßschäfte from '@/public/images/dashboard/partner_sidebar/Maßschäfte.png';
import Maßschuhaufträge from '@/public/images/dashboard/partner_sidebar/Maßschuhaufträge.png';
import Musterzettel from '@/public/images/dashboard/partner_sidebar/Musterzettel.png';
import Nachrichten from '@/public/images/dashboard/partner_sidebar/Nachrichten.png';
import Terminkalender from '@/public/images/dashboard/partner_sidebar/Terminkalender.png';
import { MdKeyboardArrowLeft } from 'react-icons/md';



interface SidebarProps {
    isCollapsed: boolean;
    onClose: () => void;
    onCollapseToggle: () => void;
}

export default function Sidebar({ isCollapsed, onClose, onCollapseToggle }: SidebarProps) {
    const { user } = useAuth();
    const pathname = usePathname();
    const showLabels = !isCollapsed;
    const { isPathAllowed, loading: featureLoading, features } = useFeatureAccess();

    const menuSections = useMemo(
        () => {
            return [
                {
                    id: '0',
                    standalone: true,
                    icon: RxDashboard,
                    label: 'Dashboard',
                    href: '/dashboard'
                },
                // {
                //     id: '1',
                //     standalone: true,
                //     icon: HiOutlineChatBubbleOvalLeft,
                //     label: 'Teamchat',
                //     href: '/dashboard/teamchat'
                // },
                {
                id: '1a',
                standalone: true,
                icon: IoSearchOutline,
                label: 'Kundensuche',
                href: '/dashboard/customers'
            },
            {
                id: '1b',
                standalone: true,
                icon: FiUserPlus,
                label: 'Neukundenerstellung',
                href: '/dashboard/neukundenerstellung'
            },
            {
                id: '1c',
                standalone: true,
                icon: Einlagenauftrag,
                label: 'Einlagenaufträge',
                href: '/dashboard/orders'
            },
            {
                id: '1d',
                standalone: true,
                icon: Maßschuhaufträge,
                label: 'Maßschuhaufträge',
                href: '/dashboard/massschuhauftraege'
            },
            {
                id: '1e',
                standalone: true,
                icon: Maßschäfte,
                label: 'Maßschäfte',
                href: '/dashboard/custom-shafts'
            },
            {
                id: '2',
                label: 'Aufträge & Produkte',
                items: [
                    { icon: HiOutlineCube, label: 'Produktverwaltung', href: '/dashboard/lager' },
                    // { icon: GrCubes, label: 'Sammelbestellungen', href: '/dashboard/group-orders' }
                ]
            },
            {
                id: '3',
                label: 'Kundenmanagement',
                items: [
                    { icon: Nachrichten, label: 'Nachrichten', href: '/dashboard/email/inbox' },
                    { icon: HiOutlineChatBubbleLeftRight, label: 'Automatisierte Nachrichten', href: '/dashboard/automatisierte-nachrichten' },
                    { icon: Terminkalender, label: 'Terminkalender', href: '/dashboard/calendar' }
                ]
            },
            {
                id: '4',
                label: 'Finanzen',
                items: [
                    { icon: FiDollarSign, label: 'Kasse & Abholungen', href: '/dashboard/kasse' },
                    { icon: BsCashStack, label: 'Finanzen & Kasse', href: '/dashboard/finanzen-kasse' },
                    { icon: HiOutlineDocumentText, label: 'Einnahmen & Rechnungen', href: '/dashboard/einnahmen' },
                    { icon: FiBarChart, label: 'Monatsstatistik', href: '/dashboard/monatsstatistik' },
                    { icon: TbUsers, label: 'Mitarbeitercontrolling', href: '/dashboard/mitarbeitercontrolling' },
                    { icon: TbActivityHeartbeat, label: 'Einlagencontrolling', href: '/dashboard/einlagencontrolling' },
                ]
            },
            {
                id: '5',
                label: 'System & Einstellungen',
                items: [
                    { icon: Fußübungen, label: 'Fußübungen', href: '/dashboard/foot-exercises' },
                    // { icon: Musterzettel, label: 'Musterzettel', href: '/dashboard/musterzettel' },
                    { icon: Einstellungen, label: 'Einstellungen', href: '/dashboard/settings' },
                ]
            },
            {
                id: '6',
                label: 'Kundeninformationen',
                items: [
                    { icon: BiNews, label: 'News & Aktuelles', href: '/dashboard/news' },
                    { icon: BiPackage, label: 'Produktkatalog', href: '/dashboard/products' },
                ]
            },
            {
                id: '7',
                standalone: true,
                icon: MdAccountBalanceWallet,
                label: 'Balance',
                href: '/dashboard/balance-dashboard'
            },
            // Employee Profile - Always at bottom, only for EMPLOYEE role
            ...(user?.role === 'EMPLOYEE' ? [{
                id: 'employee-profile',
                standalone: true,
                icon: TbUserCircle,
                label: 'Mitarbeiterprofil',
                href: '/dashboard/employee-profile',
                employeeOnly: true
            }] : [])
            ];
        },
        [user?.role]
    );

    type MenuItem =
        | { type: 'link'; key: string; icon: IconType | StaticImageData; label: string; href: string }
        | { type: 'divider'; key: string };

    const menuItems: MenuItem[] = useMemo(() => {
        // Wait for API to load features - don't show anything until features are loaded
        if (featureLoading || features.length === 0) {
            return []; // Return empty array while loading from API
        }

        const canShow = (href: string, section?: any) => {
            if (section?.employeeOnly && user?.role !== 'EMPLOYEE') return false;
            // Features are loaded from API, check if path is allowed
            return isPathAllowed(href);
        };

        return menuSections.flatMap((section, index) => {
            const rawItems = section.standalone
                ? [{
                    type: 'link' as const,
                    key: section.id,
                    icon: section.icon,
                    label: section.label,
                    href: section.href
                }]
                : (section.items ?? []).map((item: any, subIndex: number) => ({
                    type: 'link' as const,
                    key: `${section.id}-${subIndex}`,
                    icon: item.icon,
                    label: item.label,
                    href: item.href
                }));

            // Filter items based on access - only show allowed routes
            const items = rawItems.filter((item: any) => canShow(item.href, section));

            // Don't add section if no items are allowed
            if (items.length === 0) return [];

            const result: MenuItem[] = [];
            if (index > 0) {
                const prevSection = menuSections[index - 1];
                if (section.id === 'employee-profile') {
                    result.push({ type: 'divider', key: `divider-${section.id}` });
                } else if (!section.standalone || !prevSection.standalone || section.id === '1c') {
                    result.push({ type: 'divider', key: `divider-${section.id}` });
                }
            }
            result.push(...items);
            return result;
        });
    }, [menuSections, isPathAllowed, features, user, featureLoading]);

    // Get user first letter for avatar
    const getUserInitials = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <div className={`h-screen bg-white flex flex-col border-r border-gray-200 transition-all duration-300 w-80 ${isCollapsed ? 'md:w-28' : 'md:w-80'}`}>


            {/* Top Logo Section */}
            <div className={`py-5 flex items-center ${showLabels ? 'px-3 justify-between' : 'px-2 justify-between'}`}>
                <div className={`${showLabels ? 'w-16 h-16' : 'w-12 h-12'}  p-2 flex items-center justify-center overflow-hidden bg-[#61A175]/15 rounded`}>
                    {user?.image ? (
                        <Image
                            src={user.image.startsWith('http') ? user.image : `https://${user.image}`}
                            alt={user.name || 'User'}
                            width={showLabels ? 56 : 40}
                            height={showLabels ? 56 : 40}
                            className="w-full h-full object-contain"
                            unoptimized={shouldUnoptimizeImage(user.image)}
                        />
                    ) : (
                        showLabels ? (
                            <span className="text-white font-bold text-xl">{getUserInitials()}</span>
                        ) : (
                            <span className="text-white font-bold text-lg">{getUserInitials()}</span>
                        )
                    )}
                </div>
                <div className="flex items-center gap-2 -mr-3">
                    
                    <button
                        onClick={onCollapseToggle}
                        className="hidden md:flex border border-[#61A175] bg-gray-100 text-gray-600 cursor-pointer hover:text-gray-800 transition-all duration-300 p-1 rounded-s-lg hover:bg-gray-100"
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                    
                        <MdKeyboardArrowLeft
                            className={`text-xl transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 md:hidden"
                    >
                        <IoClose className="h-6 w-6" />
                    </button>
                </div>
            </div>



            {/* main menu section */}

            <nav className={`mt-4 flex-1 overflow-y-auto px-3 ${isCollapsed ? 'space-y-6' : 'space-y-2'}`}>
                {featureLoading && features.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
                    </div>
                ) : (
                    menuItems.map((item) => {
                    if (item.type === 'divider') {
                        return (
                            <div
                                key={item.key}
                                className={`h-px bg-gray-200 ${isCollapsed ? 'my-4 mx-2' : 'mx-1'}`}
                            />
                        );
                    }

                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    // Check if icon is an image import (StaticImageData) or React Icon component
                    const isImageIcon = typeof Icon !== 'function';

                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            title={item.label}
                            className="no-underline block"
                            style={{ textDecoration: 'none' }}
                        >
                            <span
                                className={`flex items-center ${showLabels ? 'px-5 justify-start' : 'justify-center p-2'} py-1 rounded-lg transition-colors duration-200 ${isActive ? 'bg-[var(--td-green,#61A175)] text-white' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {isImageIcon ? (
                                    <Image 
                                        src={Icon} 
                                        alt={item.label}
                                        width={20}
                                        height={20}
                                        className={`h-7 w-7 object-contain ${showLabels ? 'mr-3' : ''} ${isActive ? 'brightness-0 invert' : ''}`}
                                    />
                                ) : (
                                    <Icon className={`h-5 w-5 ${showLabels ? 'mr-3' : ''}`} />
                                )}
                                {showLabels && item.label}
                            </span>
                        </Link>
                    );
                })
                )}
            </nav>

            {/* User Profile Section */}
            <div className={`border-t border-gray-200 ${showLabels ? 'px-3 py-1' : 'p-2'}`}>
                {showLabels ? (
                    <div className="flex gap-2 items-center">
                        <div className="w-10 h-10 rounded-full bg-[#61A175] flex items-center justify-center mb-3 overflow-hidden">
                            <span className="text-white font-semibold text-lg">
                                {getUserInitials()}
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-sm text-gray-600 mb-1">Welcome back</p>
                            <p className="text-base font-semibold text-gray-800 mb-2">
                                {user?.busnessName || ''}
                                <span className="ml-2">👋</span>
                            </p>
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-[#61A175] flex items-center justify-center  overflow-hidden">
                            <span className="text-white font-semibold text-base">
                                {getUserInitials()}
                            </span>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
