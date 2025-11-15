'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoClose, IoSearchOutline } from 'react-icons/io5';
import {
    HiCog,
    HiCollection,
    HiShoppingCart,
    HiCalendar,
    HiChat,
    HiOutlineCube
} from 'react-icons/hi';
import { RxDashboard } from "react-icons/rx";
import { HiArrowRightOnRectangle, HiMiniBars2, HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { FaMoneyCheckAlt, FaShoePrints } from 'react-icons/fa';
import { TbActivityHeartbeat, TbDashboardFilled, TbUsers } from 'react-icons/tb';
import { GiFootprint } from 'react-icons/gi';
import { HiDocumentText } from 'react-icons/hi';
import { RiDashboard2Line } from 'react-icons/ri';
import type { IconType } from 'react-icons';
import { FiBarChart, FiShoppingBag, FiUserPlus } from 'react-icons/fi';
import { PiFootprintsLight } from "react-icons/pi";
import { GrCubes } from "react-icons/gr";



interface SidebarProps {
    isCollapsed: boolean;
    onClose: () => void;
}

export default function Sidebar({ isCollapsed, onClose }: SidebarProps) {
    const { logout, user } = useAuth();

    const pathname = usePathname();



    const showLabels = !isCollapsed;

    const menuSections = [
        {
            id: '0',
            standalone: true,
            icon: RxDashboard,
            label: 'Dashboard',
            href: '/dashboard'
        },
        {
            id: '1',
            standalone: true,
            icon: HiOutlineChatBubbleOvalLeft,
            label: 'Teamchat',
            href: '/dashboard/teamchat'
        },
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
            icon: PiFootprintsLight,
            label: 'Einlagenaufträge',
            href: '/dashboard/einlagenauftraege'
        },
        {
            id: '1d',
            standalone: true,
            icon: FiShoppingBag,
            label: 'Maßschuhaufträge',
            href: '/dashboard/massschuhauftraege'
        },
        {
            id: '1e',
            standalone: true,
            icon: FaShoePrints,
            label: 'Maßschäfte',
            href: '/dashboard/custom-shafts'
        },
        {
            id: '2',
            label: 'Aufträge & Produkte',
            items: [
                { icon: HiShoppingCart, label: 'Aufträge', href: '/dashboard/orders' },
                { icon: HiOutlineCube, label: 'Produktverwaltung', href: '/dashboard/lager' },
                { icon: GrCubes, label: 'Sammelbestellungen', href: '/dashboard/group-orders' }

            ]
        },
        {
            id: '3',
            label: 'Kundenmanagement',
            items: [

                { icon: HiChat, label: 'Nachrichten', href: '/dashboard/email/inbox' },
                { icon: HiCalendar, label: 'Terminkalender', href: '/dashboard/calendar' }
            ]
        },


        // {
        //     id: '4',
        //     label: 'Finanzen',
        //     items: [
        //         { icon: FaMoneyCheckAlt, label: 'Finanzen im Überblick', href: '/dashboard/finance' },
        //         { icon: TbDashboardFilled, label: 'Dashboard FeetF1rst', href: '/dashboard/dashboard-feetfirst' },
        //         { icon: RiDashboard2Line, label: 'Masschuhe', href: '/dashboard/masschuhe' },
        //     ]
        // },

        {
            id: '4',
            label: 'Finanzen',
            items: [
                { icon: FiBarChart, label: 'Monatsstatistik', href: '/dashboard/monatsstatistik' },
                { icon: TbUsers, label: 'Mitarbeitercontrolling', href: '/dashboard/mitarbeitercontrolling' },
                { icon: TbActivityHeartbeat, label: 'Einlagencontrolling', href: '/dashboard/einlagencontrolling' },
            ]
        },
        {
            id: '5',
            label: 'System & Einstellungen',
            items: [
                { icon: HiMiniBars2, label: 'Fußübungen', href: '/dashboard/foot-exercises' },
                { icon: HiDocumentText, label: 'Musterzettel', href: '/dashboard/musterzettel' },
                { icon: HiCog, label: 'Einstellungen', href: '/dashboard/settings' },
            ]
        }
    ];

    type MenuItem =
        | { type: 'link'; key: string; icon: IconType; label: string; href: string }
        | { type: 'divider'; key: string };

    const menuItems: MenuItem[] = menuSections.flatMap((section, index) => {
        const items = section.standalone
            ? [{
                type: 'link' as const,
                key: section.id,
                icon: section.icon,
                label: section.label,
                href: section.href
            }]
            : (section.items ?? []).map((item, subIndex) => ({
                type: 'link' as const,
                key: `${section.id}-${subIndex}`,
                icon: item.icon,
                label: item.label,
                href: item.href
            }));

        const result: MenuItem[] = [];
        // Add divider when:
        // 1. Not the first section
        // 2. Transitioning from standalone to group, or between groups
        // 3. After first 4 standalone items (before Einlagenaufträge)
        // 4. Don't add divider between other standalone items
        if (index > 0 && items.length > 0) {
            const prevSection = menuSections[index - 1];
            // Add divider if:
            // - Current is a group (not standalone) OR previous was a group
            // - OR we're at Einlagenaufträge (id: '1c') after the first 4 standalone items
            if (!section.standalone || !prevSection.standalone || section.id === '1c') {
                result.push({ type: 'divider', key: `divider-${section.id}` });
            }
        }
        result.push(...items);
        return result;
    });

    // Get user first letter for avatar
    const getUserInitials = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <div className={`h-screen bg-white flex flex-col border-r border-gray-200 transition-all duration-300 w-80 ${isCollapsed ? 'md:w-20' : 'md:w-80'}`}>


            {/* Top Logo Section */}
            <div className={`py-5 flex items-center ${showLabels ? 'px-3 justify-between' : 'px-2 justify-center '}`}>
                <div className={`${showLabels ? 'w-16 h-16' : 'w-10 h-10'}  p-2 flex items-center justify-center overflow-hidden bg-[#61A175]/15 rounded`}>
                    {user?.image ? (
                        <Image
                            src={user.image}
                            alt={user.name || 'User'}
                            width={showLabels ? 56 : 40}
                            height={showLabels ? 56 : 40}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        showLabels ? (
                            <span className="text-white font-bold text-xl">{getUserInitials()}</span>
                        ) : (
                            <span className="text-white font-bold text-lg">{getUserInitials()}</span>
                        )
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 md:hidden"
                >
                    <IoClose className="h-6 w-6" />
                </button>
            </div>



            {/* main menu section */}

            <nav className={`mt-4 flex-1 overflow-y-auto px-3 ${isCollapsed ? 'space-y-6' : 'space-y-2'}`}>
                {menuItems.map((item) => {
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
                                <Icon className={`h-5 w-5 ${showLabels ? 'mr-3' : ''}`} />
                                {showLabels && item.label}
                            </span>
                        </Link>
                    );
                })}
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
                                {user?.name || 'User'}
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
