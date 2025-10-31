'use client'
import React, { useState, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
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

interface AppointmentDetail {
    id: string;
    customer_name: string;
    time: string;
    date: string;
    reason: string;
    assignedTo: string;
    details: string;
    isClient: boolean;
    user: {
        name: string;
        email: string;
    };
}

interface AppointmentItem {
    id: string;
    time: string;
    title: string;
    reason: string;
    assignedTo: string;
    details: string;
    userType: 'user' | 'other';
}

interface DayAppointments {
    day: string;
    appointments: AppointmentItem[];
}

interface GroupedAppointments {
    [key: string]: {
        day: string;
        appointments: AppointmentItem[];
    };
}

export default function DashboardMainPage() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        slidesToScroll: 1,
        align: 'start',
        breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 4 }
        }
    })
    setDefaultOptions({ locale: de });
    const [appointments, setAppointments] = useState<DayAppointments[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            
            // Add minimum loading time to prevent flash and improve UX
            const startTime = Date.now();
            const minLoadingTime = 800; // 800ms minimum loading time
            
            const response = await getMyAppointments({
                page: 1,
                limit: 100
            });

            if (response?.data) {
                const groupedByDay = response.data.reduce((acc: GroupedAppointments, apt: AppointmentDetail) => {
                    const dayName = format(new Date(apt.date), 'EEEE');

                    if (!acc[dayName]) {
                        acc[dayName] = {
                            day: dayName,
                            appointments: []
                        };
                    }

                    acc[dayName].appointments.push({
                        id: apt.id,
                        time: apt.time,
                        title: apt.customer_name.toUpperCase(),
                        reason: apt.reason,
                        assignedTo: apt.assignedTo,
                        details: apt.details,
                        userType: apt.isClient ? 'user' : 'other'
                    });

                    return acc;
                }, {});

                const daysOfWeek = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
                const finalAppointments = daysOfWeek.map(day => ({
                    day: day,
                    appointments: (groupedByDay[day]?.appointments || [])
                }));

                // Ensure minimum loading time for better UX
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
                
                setTimeout(() => {
                    setAppointments(finalAppointments);
                    setIsLoading(false);
                    setIsInitialLoad(false);
                }, remainingTime);
            } else {
                // If no data, still show the structure with empty appointments
                const daysOfWeek = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
                const emptyAppointments = daysOfWeek.map(day => ({
                    day: day,
                    appointments: []
                }));
                
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
                
                setTimeout(() => {
                    setAppointments(emptyAppointments);
                    setIsLoading(false);
                    setIsInitialLoad(false);
                }, remainingTime);
            }
        } catch (error) {
            // console.error('Failed to load appointments:', error);
            // Even on error, show the structure with empty appointments
            const daysOfWeek = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
            const emptyAppointments = daysOfWeek.map(day => ({
                day: day,
                appointments: []
            }));
            
            setTimeout(() => {
                setAppointments(emptyAppointments);
                setIsLoading(false);
                setIsInitialLoad(false);
            }, 300);
        }
    };

    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

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

    const AppointmentCardSkeleton = () => (
        <div className="p-3 rounded bg-gray-200 animate-pulse">
            <div className="h-3 bg-gray-300 rounded mb-2 w-1/3"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
    );

    const DayCardSkeleton = () => (
        <div className="border rounded-[20px] p-4 h-[400px] flex flex-col bg-white">
            <div className="h-8 bg-gray-200 rounded mb-4 w-2/3 animate-pulse"></div>
            <div className="space-y-3 overflow-y-auto flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <AppointmentCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );



    return (
        <div className='p-4'>


            {isInitialLoad ? <HeaderSkeleton /> : (
                <div className='flex flex-col gap-3 mb-6'>
                    <h1 className='text-3xl font-bold'>WELCOME BACK ORTHOPÄDIE PUTZER</h1>
                    <p className='text-lg text-gray-500'>{format(new Date(), 'EEEE, d. MMMM yyyy')}</p>
                </div>
            )}


            {/* Appointment Carousel */}
            <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                        {isLoading ? (
                            // Show skeleton for all days during loading
                            Array.from({ length: 7 }).map((_, index) => (
                                <div key={index} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] p-2">
                                    <DayCardSkeleton />
                                </div>
                            ))
                        ) : (
                            appointments.map((day, index) => (
                                <div key={index} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] p-2">
                                    <div className="border rounded-[20px] p-4 h-[400px] flex flex-col bg-white transition-all duration-500 hover:shadow-lg">
                                        <h2 className="text-xl font-semibold mb-4 bg-gray-100 p-2 rounded">{day?.day}</h2>
                                        <div className="space-y-3 overflow-y-auto flex-1">
                                            {day.appointments.length > 0 ? (
                                                // Actual appointments
                                                day.appointments.map((apt: AppointmentItem, aptIndex: number) => (
                                                    <div
                                                        key={aptIndex}
                                                        onClick={() => handleAppointmentClick(apt.id)}
                                                        className={`p-3 rounded cursor-pointer transition-all duration-300 hover:opacity-90 ${apt.userType === 'user' ? 'bg-black text-white' : 'bg-[#62A07B] text-white'
                                                            }`}
                                                    >
                                                        {apt.time && <div className="text-xs opacity-90 mb-1 uppercase">{apt.time}</div>}
                                                        <div className="font-semibold">{apt.title}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                // Empty state
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="text-center text-gray-500">
                                                        <div className="text-4xl mb-2">📅</div>
                                                        <p className="text-sm">Keine Termine</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Navigation Arrows - Only show if there are appointments or not loading */}
                {!isLoading && appointments.some(day => day.appointments.length > 0) && (
                    <>
                        <button
                            onClick={scrollPrev}
                            className="absolute cursor-pointer left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white p-2 transition-all duration-300 rounded-full shadow-lg hover:bg-gray-100 z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <button
                            onClick={scrollNext}
                            className="absolute cursor-pointer right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white transition-all duration-300 p-2 rounded-full shadow-lg hover:bg-gray-100 z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </>
                )}
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
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-center w-full mt-10'>
                <Link href="/dashboard/overview" className="flex flex-col items-center text-center">
                    <div className="bg-white px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg transition-all mb-2 hover:bg-gray-200 duration-300">
                        <Image src={dashboard} alt='dashboard' width={100} height={100} className='w-[130px] h-[130px]' />
                    </div>
                    <span className="text-md font-semibold">IHR ÜBERBLICK</span>
                </Link>

                <Link href="/dashboard/customers" className="flex flex-col items-center text-center">
                    <div className="bg-white transition-all duration-300 hover:bg-gray-200 px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg mb-2">
                        <Image src={users} alt='users' width={200} height={200} className='w-[130px] h-[130px] p-7' />
                    </div>
                    <span className="text-md font-semibold">KUNDENSUCHE</span>
                </Link>

                <Link href="/dashboard/calendar" className="flex flex-col items-center text-center">
                    <div className="bg-white transition-all duration-300 hover:bg-gray-200 px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg mb-2">
                        <Image src={date} alt='calendar' width={100} height={100} className='w-[130px] h-[130px] p-7' />
                    </div>
                    <span className="text-md font-semibold">TERMINKALENDER</span>
                </Link>

                <Link href="/dashboard/settings" className="flex flex-col items-center text-center">
                    <div className="bg-white transition-all duration-300 hover:bg-gray-200 px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg mb-2">
                        <Image src={settings} alt='settings' width={100} height={100} className='w-[130px] h-[130px] p-7' />
                    </div>
                    <span className="text-md font-semibold">EINSTELLUNGEN</span>
                </Link>

                <Link href="/dashboard/products" className="flex flex-col items-center text-center">
                    <div className="bg-white transition-all duration-300 hover:bg-gray-200 px-5 border border-gray-400 rounded-[40px] shadow-md hover:shadow-lg mb-2">
                        <Image src={home} alt='products' width={100} height={100} className='w-[130px] h-[130px] p-7' />
                    </div>
                    <span className="text-md font-semibold">PRODUKTVERWALTUNG</span>
                </Link>
            </div>
        </div>
    )
}
