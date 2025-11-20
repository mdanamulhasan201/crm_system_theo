'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '../Shared/Sidebar';
import Navbar from '../Shared/Navbar';
import TeamChat from '../Shared/TeamChat';

interface LayoutProps {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: LayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
                setIsSidebarCollapsed(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebarVisibility = () => {
        setIsSidebarOpen(prev => {
            const next = !prev;
            if (next) {
                setIsSidebarCollapsed(false);
            }
            return next;
        });
    };

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(prev => !prev);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>

            {/* Main Content */}
            <div
                className={`flex-1 flex flex-col overflow-hidden transition-[margin] duration-300 ml-0 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-80'}`}
            >
                <Navbar
                    onMenuClick={toggleSidebarVisibility}
                    onCollapseToggle={toggleSidebarCollapse}
                    isSidebarOpen={isSidebarOpen}
                    isSidebarCollapsed={isSidebarCollapsed}
                />

                {/* Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 sm:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-4">
                    {children}
                </main>

                {/* Global Team Chat */}
                {/* <TeamChat /> */}

            </div>

        </div>
    );
};

export default DashboardLayout;
