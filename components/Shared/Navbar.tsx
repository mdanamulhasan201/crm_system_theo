'use client'
import React, { useState, useEffect, useRef } from 'react';
import { HiMenuAlt2, HiSearch, HiArrowLeft, HiExternalLink } from 'react-icons/hi';
import NotificationPage from './Notification';
import { useRouter } from 'next/navigation';
import { HiOutlineChatBubbleOvalLeft } from 'react-icons/hi2';
import { useFeatureAccess } from '@/contexts/FeatureAccessContext';
import axiosClient from '@/lib/axiosClient';

interface NavbarProps {
    onMenuClick: () => void;
    isSidebarOpen: boolean;
}

const TEAMCHAT_PATH = '/dashboard/teamchat';
const CRM_BASE_URL = process.env.NEXT_PUBLIC_CRM_URL || 'http://localhost:5173';

export default function Navbar({ onMenuClick, isSidebarOpen }: NavbarProps) {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isCrmLoading, setIsCrmLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { isPathAllowed } = useFeatureAccess();
    const showTeamchat = isPathAllowed(TEAMCHAT_PATH);

    const handleGoToCRM = async () => {
        setIsCrmLoading(true);
        try {
            const res = await axiosClient.get('/v2/auth/crm-token');
            if (res.data?.success && res.data?.token) {
                window.open(`${CRM_BASE_URL}/sso-login?token=${res.data.token}`, '_blank');
            }
        } catch {
            console.error('Failed to get CRM token');
        } finally {
            setIsCrmLoading(false);
        }
    };

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

    const handleBack = () => {
        router.back();
    };

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="px-4 py-3 md:py-4 flex items-center justify-between relative">
                <div className="flex items-center gap-2 ms-5">
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
                        onClick={handleBack}
                        className="hidden md:flex text-gray-600 cursor-pointer hover:text-gray-800 transition-all duration-300"
                        aria-label="Go back"
                    >
                        <HiArrowLeft className="text-2xl" />
                    </button>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">

                    {/* Go to CRM button */}
                    <button
                        onClick={handleGoToCRM}
                        disabled={isCrmLoading}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCrmLoading ? 'Loading...' : 'Go to CRM'}
                        {!isCrmLoading && <HiExternalLink className="text-base" />}
                    </button>

                    {/* Chat icon – only when Teamchat is allowed (same feature access as sidebar) */}
                    {showTeamchat && (
                        <HiOutlineChatBubbleOvalLeft
                            onClick={() => router.push(TEAMCHAT_PATH)}
                            className="text-2xl text-gray-600 hover:text-gray-800 cursor-pointer"
                            aria-label="Teamchat"
                        />
                    )}
                    <NotificationPage />
                        
                    {/* search icon */}
                    <div className="relative" ref={searchRef}>
                        <HiSearch
                            className="h-6 w-6 text-gray-600 hover:text-gray-800 cursor-pointer"
                            onClick={() => setIsSearchVisible(!isSearchVisible)}
                        />

                        {/* Search dropdown */}
                        {isSearchVisible && (
                            <div className="absolute z-50 right-0 top-10 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                <input
                                    type="text"
                                    placeholder="Suchen..."
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
