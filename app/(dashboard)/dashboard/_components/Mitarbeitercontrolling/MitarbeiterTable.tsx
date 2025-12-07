'use client';

import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';

// Employee data interface
interface EmployeeData {
    id: string;
    name: string;
    avatar: string;
    clockedInSince: string | null;
    status: {
        label: string;
        color: string;
        bgColor: string;
    };
    timeInStatus: string | null;
    totalTimeToday: string | null;
}

// Status configurations
const statusConfig: Record<string, { color: string; bgColor: string }> = {
    'Produktion-Einlagen': {
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50'
    },
    'Kunden-versorgwng': {
        color: 'text-amber-700',
        bgColor: 'bg-amber-50'
    },
    'Krank': {
        color: 'text-red-700',
        bgColor: 'bg-red-50'
    },
    'Urlaub': {
        color: 'text-orange-700',
        bgColor: 'bg-orange-50'
    },
    'Produktion-Mabschuhe': {
        color: 'text-purple-700',
        bgColor: 'bg-purple-50'
    }
};

// Sample employee data - declare in children component
const employeesData: EmployeeData[] = [
    {
        id: '1',
        name: 'Peter',
        avatar: '/api/placeholder/40/40',
        clockedInSince: '7:48 UHR',
        status: {
            label: 'Produktion-Einlagen',
            color: statusConfig['Produktion-Einlagen'].color,
            bgColor: statusConfig['Produktion-Einlagen'].bgColor
        },
        timeInStatus: '1 h 23 min',
        totalTimeToday: '133 m'
    },
    {
        id: '2',
        name: 'Max',
        avatar: '/api/placeholder/40/40',
        clockedInSince: null,
        status: {
            label: 'Kunden-versorgwng',
            color: statusConfig['Kunden-versorgwng'].color,
            bgColor: statusConfig['Kunden-versorgwng'].bgColor
        },
        timeInStatus: null,
        totalTimeToday: null
    },
    {
        id: '3',
        name: 'Lisa',
        avatar: '/api/placeholder/40/40',
        clockedInSince: '13:40 UHR',
        status: {
            label: 'Krank',
            color: statusConfig['Krank'].color,
            bgColor: statusConfig['Krank'].bgColor
        },
        timeInStatus: '59 min',
        totalTimeToday: '59 m'
    },
    {
        id: '4',
        name: 'Anna',
        avatar: '/api/placeholder/40/40',
        clockedInSince: '10:05 UHR',
        status: {
            label: 'Urlaub',
            color: statusConfig['Urlaub'].color,
            bgColor: statusConfig['Urlaub'].bgColor
        },
        timeInStatus: '2 h 56 min',
        totalTimeToday: '256 m'
    },
    {
        id: '5',
        name: 'Michael',
        avatar: '/api/placeholder/40/40',
        clockedInSince: '8:24 UHR',
        status: {
            label: 'Produktion-Mabschuhe',
            color: statusConfig['Produktion-Mabschuhe'].color,
            bgColor: statusConfig['Produktion-Mabschuhe'].bgColor
        },
        timeInStatus: '10 min',
        totalTimeToday: '10 m'
    }
];

// Calculate active employees
const activeEmployeesCount = employeesData.filter(emp => emp.clockedInSince !== null).length;
const totalEmployees = employeesData.length;

export default function MitarbeiterTable() {
    const [activeTab, setActiveTab] = useState<'tag' | 'woche' | 'monat' | 'historie'>('tag');

    // Filter data based on active tab using useMemo for optimization
    const filteredData = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        switch (activeTab) {
            case 'tag':
                // Tag: Show today's data - employees who clocked in today
                // For now, show all employees with clockedInSince (active today)
                return employeesData.filter(emp => emp.clockedInSince !== null);
            
            case 'woche':
                // Woche: Show weekly aggregated data - all employees from this week
                // For now, show all employees (when real data comes, filter by week)
                return employeesData;
            
            case 'monat':
                // Monat: Show monthly aggregated data - all employees from this month
                // For now, show all employees (when real data comes, filter by month)
                return employeesData;
            
            case 'historie':
                // Historie: Show historical data - all employees including inactive ones
                return employeesData;
            
            default:
                return employeesData;
        }
    }, [activeTab]);

    // Recalculate active employees count based on filtered data
    const activeEmployeesCount = useMemo(() => {
        return filteredData.filter(emp => emp.clockedInSince !== null).length;
    }, [filteredData]);

    return (
        <div className="w-full mt-6">
            {/* Single Card with Header and Table */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                {/* Header Section - inside the same card */}
                <div className="p-4 sm:p-5 md:p-6 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Title and Subtitle */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                                Mitarbeiter Übersicht
                            </h2>
                            <p className="text-sm sm:text-base text-slate-500">
                                {activeEmployeesCount} von {filteredData.length} Mitarbeitern aktiv
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
                            <button
                                onClick={() => setActiveTab('tag')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                    activeTab === 'tag'
                                        ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
                                        : 'bg-transparent text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Tag
                            </button>
                            <button
                                onClick={() => setActiveTab('woche')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                    activeTab === 'woche'
                                        ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
                                        : 'bg-transparent text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Woche
                            </button>
                            <button
                                onClick={() => setActiveTab('monat')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                    activeTab === 'monat'
                                        ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
                                        : 'bg-transparent text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Monat
                            </button>
                            <button
                                onClick={() => setActiveTab('historie')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                    activeTab === 'historie'
                                        ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
                                        : 'bg-transparent text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Historie
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Section - inside the same card */}
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="text-xs sm:text-sm font-semibold text-slate-600 uppercase py-3 sm:py-4 px-3 sm:px-4">
                                Mitarbeiter
                            </TableHead>
                            <TableHead className="text-xs sm:text-sm font-semibold text-slate-600 uppercase py-3 sm:py-4 px-3 sm:px-4">
                                Eingestempelt seit
                            </TableHead>
                            <TableHead className="text-xs sm:text-sm font-semibold text-slate-600 uppercase py-3 sm:py-4 px-3 sm:px-4">
                                Status
                            </TableHead>
                            <TableHead className="text-xs sm:text-sm font-semibold text-slate-600 uppercase py-3 sm:py-4 px-3 sm:px-4">
                                Zeit im Status
                            </TableHead>
                            <TableHead className="text-xs sm:text-sm font-semibold text-slate-600 uppercase py-3 sm:py-4 px-3 sm:px-4">
                                Gesamtzeit heute
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((employee) => (
                            <TableRow key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                                {/* Mitarbeiter */}
                                <TableCell className="py-3 sm:py-4 px-3 sm:px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center">
                                            {employee.avatar && employee.avatar !== '/api/placeholder/40/40' ? (
                                                <Image
                                                    src={employee.avatar}
                                                    alt={employee.name}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs sm:text-sm font-semibold text-slate-600">
                                                    {employee.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm sm:text-base font-medium text-slate-900">
                                            {employee.name}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Eingestempelt seit */}
                                <TableCell className="py-3 sm:py-4 px-3 sm:px-4">
                                    <span className="text-sm sm:text-base text-slate-600">
                                        {employee.clockedInSince || '-'}
                                    </span>
                                </TableCell>

                                {/* Status */}
                                <TableCell className="py-3 sm:py-4 px-3 sm:px-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium ${employee.status.bgColor} ${employee.status.color}`}>
                                        {employee.status.label}
                                    </span>
                                </TableCell>

                                {/* Zeit im Status */}
                                <TableCell className="py-3 sm:py-4 px-3 sm:px-4">
                                    <span className="text-sm sm:text-base text-slate-600">
                                        {employee.timeInStatus || '-'}
                                    </span>
                                </TableCell>

                                {/* Gesamtzeit heute */}
                                <TableCell className="py-3 sm:py-4 px-3 sm:px-4">
                                    <span className="text-sm sm:text-base text-slate-600">
                                        {employee.totalTimeToday || '-'}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
