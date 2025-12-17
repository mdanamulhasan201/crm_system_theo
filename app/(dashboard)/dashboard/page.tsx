'use client'
import React, { useState, useEffect } from 'react'
import dashboard from '@/public/images/dashboard/dashbord.png'
import users from '@/public/images/dashboard/user.png'
import date from '@/public/images/dashboard/date.png'
import settings from '@/public/images/dashboard/settings.png'
import home from '@/public/images/dashboard/home.png'
import Image from 'next/image';
import Link from 'next/link'
import { format, setDefaultOptions } from 'date-fns';
import { getMyAppointments, getSingleAppointment } from '@/apis/appoinmentApis';
import { de } from 'date-fns/locale';
import { X } from 'lucide-react';
import DailyCalendarView from '@/components/AppoinmentData/DailyCalendarView';
import { useWeeklyCalendar } from '@/hooks/calendar/useWeeklyCalendar';
import { useAuth } from '@/contexts/AuthContext';

interface AppointmentDetail {
    id: string;
    customer_name: string;
    time: string;
    date: string;
    reason: string;
    assignedTo: string;
    details: string;
    isClient: boolean;
    duration?: number;
    customerId?: string;
    user: {
        name: string;
        email: string;
    };
}

interface Event {
    id: string;
    date: string;
    time: string;
    title: string;
    subtitle: string;
    type: string;
    assignedTo: string;
    reason: string;
    duration?: number;
    customer_name?: string;
    customerId?: string;
    user?: {
        name: string;
        email: string;
    };
}

export default function DashboardMainPage() {
    setDefaultOptions({ locale: de });

    // Use hooks for calendar functionality
    const {
        today
    } = useWeeklyCalendar();

    // German day and month names
    const dayNamesLong = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [currentSelectedDate, setCurrentSelectedDate] = useState<Date>(today);

    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // user data show
    const { user } = useAuth();

    // Fetch appointments using getMyAppointments API directly - fetch all pages
    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            let allAppointments: AppointmentDetail[] = [];
            let currentPage = 1;
            let totalPages = 1;
            const limit = 100; // Fetch 100 items per page

            // Fetch all pages
            do {
                const response = await getMyAppointments({
                    page: currentPage,
                    limit: limit
                });

                if (response?.data && Array.isArray(response.data)) {
                    allAppointments = [...allAppointments, ...response.data];
                    totalPages = response.pagination?.totalPages || 1;
                    currentPage++;
                } else {
                    break;
                }
            } while (currentPage <= totalPages);

            // Format all appointments
            if (allAppointments.length > 0) {
                const formattedEvents = allAppointments.map((apt: AppointmentDetail) => {
                    // Parse date from ISO format (e.g., "2025-11-30T19:00:00.000Z")
                    const appointmentDate = new Date(apt.date);
                    const dateStr = appointmentDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format

                    // Handle empty customer_name
                    const customerName = apt.customer_name?.trim() || '';
                    const title = customerName ? customerName.toUpperCase() : 'No Customer Name';

                    return {
                        id: apt.id,
                        date: dateStr,
                        time: apt.time,
                        title: title,
                        subtitle: apt.details?.toUpperCase() || '',
                        type: apt.isClient ? 'user' : 'others',
                        assignedTo: apt.assignedTo || '',
                        reason: apt.reason || '',
                        duration: apt.duration || 1,
                        customer_name: apt.customer_name || '',
                        customerId: apt.customerId || undefined,
                        user: apt.user
                    };
                });
                setEvents(formattedEvents);
            }
        } catch (error) {
            console.error('Failed to load appointments:', error);
        } finally {
            setIsLoading(false);
            setIsInitialLoad(false);
        }
    };

    // Helper function to format date
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get events for a specific date
    const getEventsForDate = (date: Date): Event[] => {
        const dateStr = formatDate(date); // Format: YYYY-MM-DD

        const eventsForDay = events.filter((event: Event) => {
            // event.date is already in YYYY-MM-DD format from fetchAppointments
            return event.date === dateStr;
        });

        // Sort by time chronologically
        const parseToMinutes = (timeStr: string | undefined): number => {
            if (!timeStr) return Number.MAX_SAFE_INTEGER;
            const trimmed = timeStr.trim().toLowerCase();
            // If already like 13:45
            const twentyFour = /^\d{1,2}:\d{2}$/;
            if (twentyFour.test(trimmed)) {
                const [h, m] = trimmed.split(':').map(Number);
                return h * 60 + m;
            }
            // Try parsing am/pm like "3:00 pm"
            const ampm = /^(\d{1,2}):(\d{2})\s*(am|pm)$/;
            const match = trimmed.match(ampm);
            if (match) {
                let hour = parseInt(match[1], 10);
                const minute = parseInt(match[2], 10);
                const modifier = match[3];
                if (modifier === 'pm' && hour !== 12) hour += 12;
                if (modifier === 'am' && hour === 12) hour = 0;
                return hour * 60 + minute;
            }
            // Fallback: try Date parsing
            const d = new Date(`2000-01-01T${trimmed}`);
            if (!isNaN(d.getTime())) {
                return d.getHours() * 60 + d.getMinutes();
            }
            return Number.MAX_SAFE_INTEGER;
        };

        return eventsForDay.sort((a, b) => parseToMinutes(a.time) - parseToMinutes(b.time));
    };

    // Fetch appointments on mount
    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleAppointmentClick = async (appointmentId: string) => {
        try {
            setIsDetailLoading(true);
            setIsModalOpen(true);
            const response = await getSingleAppointment(appointmentId);
            if (response?.success) {
                setSelectedAppointment(response.appointment);
            }
        } catch (error) {
            console.error('Failed to fetch appointment details:', error);
        } finally {
            setIsDetailLoading(false);
        }
    };

    // Skeleton Components
    const HeaderSkeleton = () => (
        <div className='flex flex-col gap-3 mb-6'>
            <div className='h-9 bg-gray-200 rounded-lg w-3/4 animate-pulse'></div>
            <div className='h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse'></div>
        </div>
    );



    return (
        <div className='p-4'>


            {isInitialLoad ? <HeaderSkeleton /> : (
                <div className='flex flex-col gap-3 mb-6'>
                    <h1 className='text-3xl font-bold uppercase'>Willkommen zurück <span className='capitalize'> {user?.busnessName}</span> </h1>
                    <p className='text-lg text-gray-500'>{format(new Date(), 'EEEE, d. MMMM yyyy')}</p>
                </div>
            )}


            {/* Calendar View */}
            <div className="mb-6">
                <DailyCalendarView
                    key={currentSelectedDate.toDateString()}
                    selectedDate={currentSelectedDate}
                    events={getEventsForDate(currentSelectedDate)}
                    monthNames={monthNames}
                    dayNamesLong={dayNamesLong}
                    onDateChange={(direction) => {
                        setCurrentSelectedDate(prev => {
                            const next = new Date(prev);
                            next.setDate(next.getDate() + direction);
                            return next;
                        });
                    }}
                    onEventClick={handleAppointmentClick}
                />
            </div>

            {/* Appointment Detail Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold">Termin Details</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {isDetailLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#62A07C]"></div>
                                </div>
                            ) : selectedAppointment ? (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Kunde</p>
                                                <p className="font-medium">{selectedAppointment.customer_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Datum & Zeit</p>
                                                <p className="font-medium">
                                                    {format(new Date(selectedAppointment.date), 'dd.MM.yyyy')} {selectedAppointment.time}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Grund</p>
                                                <p className="font-medium">{selectedAppointment.reason}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Zugewiesen an</p>
                                                <p className="font-medium">{selectedAppointment.assignedTo}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-500">Details</p>
                                                <p className="font-medium">{selectedAppointment.details}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">Keine Details verfügbar</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
