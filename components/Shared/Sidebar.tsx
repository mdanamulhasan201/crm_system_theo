'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoClose } from 'react-icons/io5';
import {
    HiCog,
    HiCollection,
    HiHome,
    HiShoppingCart,
    HiUsers,
    HiCalendar,
    HiChat
} from 'react-icons/hi';
import { HiArrowRightOnRectangle } from "react-icons/hi2";
import logo from '@/public/images/logo.png'
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { FaMoneyCheckAlt } from 'react-icons/fa';
import { TbDashboardFilled } from 'react-icons/tb';
import { GiFootprint } from 'react-icons/gi';
import { FaShoePrints } from 'react-icons/fa';
import { HiDocumentText } from 'react-icons/hi';
import { RiDashboard2Line } from 'react-icons/ri';
import type { IconType } from 'react-icons';


interface SidebarProps {
    isCollapsed: boolean;
    onClose: () => void;
}

export default function Sidebar({ isCollapsed, onClose }: SidebarProps) {
    const { logout } = useAuth();

    const pathname = usePathname();

    const handleLogout = async () => {
        await logout();
    };

    const showLabels = !isCollapsed;

    const menuSections = [
        {
            id: '1',
            standalone: true,
            icon: HiHome,
            label: 'Dashboard',
            href: '/dashboard'
        },
        {
            id: '2',
            label: 'Aufträge & Produkte',
            items: [
                { icon: HiShoppingCart, label: 'Aufträge', href: '/dashboard/orders' },
                { icon: HiShoppingCart, label: 'Sammelbestellungen', href: '/dashboard/group-orders' },
                { icon: HiCollection, label: 'Produktverwaltung', href: '/dashboard/lager' }
            ]
        },
        {
            id: '3',
            label: 'Kundenmanagement',
            items: [
                { icon: HiUsers, label: 'Kundensuche', href: '/dashboard/customers' },
                { icon: HiChat, label: 'Nachrichten', href: '/dashboard/email' }
            ]
        },
        {
            id: '4',
            label: 'Individuelle Kundenversorgung',
            items: [
                { icon: FaShoePrints, label: 'Maßschäfte', href: '/dashboard/custom-shafts' },
                { icon: RiDashboard2Line, label: 'Masschuhe', href: '/dashboard/masschuhe' },
                { icon: GiFootprint, label: 'Fußübungen', href: '/dashboard/foot-exercises' },
                { icon: HiDocumentText, label: 'Musterzettel', href: '/dashboard/musterzettel' }
            ]
        },
        {
            id: '5',
            label: 'Kalender & Termine',
            items: [
                { icon: HiCalendar, label: 'Terminkalender', href: '/dashboard/calendar' }
            ]
        },
        {
            id: '6',
            label: 'Finanzen',
            items: [
                { icon: FaMoneyCheckAlt, label: 'Finanzen im Überblick', href: '/dashboard/finance' },
                { icon: TbDashboardFilled, label: 'Dashboard FeetF1rst', href: '/dashboard/dashboard-feetfirst' }
            ]
        },
        {
            id: '7',
            label: 'System & Einstellungen',
            items: [
                { icon: HiCog, label: 'Einstellungen', href: '/dashboard/settings' }
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
        if (index > 0 && items.length > 0) {
            result.push({ type: 'divider', key: `divider-${section.id}` });
        }
        result.push(...items);
        return result;
    });

    return (
        <div className={`h-screen bg-white flex flex-col border-r border-gray-200 transition-all duration-300 w-80 ${isCollapsed ? 'md:w-20' : 'md:w-80'}`}>
            <div className={`py-5 flex items-center border-gray-400 ${showLabels ? 'px-3 justify-between' : 'px-2 justify-center'}`}>
                <div className={`${showLabels ? 'w-14 h-14' : 'w-10 h-10'}`}>
                    <Image src={logo} alt="logo" width={100} height={100} className='w-full h-full object-contain' />
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 md:hidden"
                >
                    <IoClose className="h-6 w-6" />
                </button>
            </div>

            <nav className="mt-4 flex-1 overflow-y-auto space-y-3 px-3">
                {menuItems.map((item) => {
                    if (item.type === 'divider') {
                        return (
                            <div
                                key={item.key}
                                className="h-px bg-gray-200 mx-1"
                            />
                        );
                    }

                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.key} href={item.href} title={item.label}>
                            <span
                                className={`flex items-center ${showLabels ? 'px-5 justify-start' : 'justify-center p-3'} py-2 rounded-full transition-colors duration-200 ${isActive ? 'bg-[var(--td-green,#61A175)] text-white' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${showLabels ? 'mr-3' : ''}`} />
                                {showLabels && item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout button */}
            <div className="border-t border-gray-200 pb-1">
                <button
                    onClick={handleLogout}
                    className={`flex items-center cursor-pointer w-full ${showLabels ? 'px-4 justify-start' : 'justify-center px-0'} py-2 text-gray-700 hover:bg-[#61A175] hover:text-white rounded-md transition-colors duration-300 group`}
                    title="Logout"
                >
                    <HiArrowRightOnRectangle className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${showLabels ? 'mr-3' : ''}`} />
                    {showLabels && 'Logout'}
                </button>
            </div>
        </div>
    );
}
