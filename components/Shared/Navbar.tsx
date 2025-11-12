'use client'
import React, { useState, useEffect, useRef } from 'react';
import { HiMenuAlt2, HiSearch, HiArrowLeft } from 'react-icons/hi';
import logo from '@/public/images/logo.png'
import Image from 'next/image';
import NotificationPage from './Notification';

interface NavbarProps {
    onMenuClick: () => void;
    onCollapseToggle: () => void;
    isSidebarOpen: boolean;
    isSidebarCollapsed: boolean;
}

export default function Navbar({ onMenuClick, onCollapseToggle, isSidebarOpen, isSidebarCollapsed }: NavbarProps) {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchVisible(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="px-4 py-3 md:py-4 flex items-center justify-between relative">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onMenuClick}
                        className="text-gray-600 cursor-pointer hover:text-gray-800 transition-all duration-300 md:hidden"
                    >
                        {isSidebarOpen ? (
                            <HiArrowLeft className="text-2xl" />
                        ) : (
                            <HiMenuAlt2 className="text-2xl" />
                        )}
                    </button>
                    <button
                        onClick={onCollapseToggle}
                        className="hidden md:flex text-gray-600 cursor-pointer hover:text-gray-800 transition-all duration-300"
                        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <HiArrowLeft
                            className={`text-2xl transform transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''
                                }`}
                        />
                    </button>
                </div>

                <div className="hidden md:block">
                    <div className='w-16 h-16'>
                        <Image src={logo} alt="logo" width={100} height={100} className='w-full h-full object-contain' />
                    </div>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                    <NotificationPage />
                    {/* search icon */}
                    <div className="relative" ref={searchRef}>
                        <HiSearch
                            className="h-6 w-6 text-gray-600 hover:text-gray-800 cursor-pointer"
                            onClick={() => setIsSearchVisible(!isSearchVisible)}
                        />

                        {/* Search dropdown */}
                        {isSearchVisible && (
                            <div className="absolute right-0 top-10 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
