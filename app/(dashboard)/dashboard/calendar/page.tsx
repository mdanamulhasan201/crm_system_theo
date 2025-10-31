'use client'
import React from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
// import AppoinmentData from '@/components/AppoinmentData/AppoinmentData';
import { useForm } from "react-hook-form"
import { useAppoinment } from '@/hooks/appoinment/useAppoinment';
import AppointmentModal from '@/components/AppointmentModal/AppointmentModal';
import { useWeeklyCalendar } from '@/hooks/calendar/useWeeklyCalendar';
import MiniCalendar from '@/components/AppoinmentData/MiniCalendar';

import DailyCalendarView from '@/components/AppoinmentData/DailyCalendarView';

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

interface AppointmentData {
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
    employeId?: string;
}

interface AppointmentFormData {
    kunde: string;
    uhrzeit: string;
    selectedEventDate: Date | undefined;
    termin: string;
    bemerk?: string;
    mitarbeiter: string;
    isClientEvent: boolean;
    duration: number;
    customerId?: string;
    employeeId?: string;
}



const WeeklyCalendar = () => {
    const [showAddForm, setShowAddForm] = React.useState(false);
    const {
        currentDate,
        miniCalendarDate,
        showYearMonthPicker,
        isMobile,
        isNavigating,
        setShowYearMonthPicker,
        navigateWeek,
        navigateMiniCalendarMonth,
        handleYearMonthChange,
        handleMiniCalendarDateClick,
        weekDates,
        miniCalendarDays,
        today,
        monthNames,
        dayNames,
        dayNamesLong,
        isSameDay,
        isPastDate,
    } = useWeeklyCalendar();
    const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
        show: boolean;
        appointmentId: string | null;
    }>({
        show: false,
        appointmentId: null
    });

    const [selectedAppointment, setSelectedAppointment] = React.useState<AppointmentData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [visibleDaysCount, setVisibleDaysCount] = React.useState(4);
    const [selectedRowStartDate, setSelectedRowStartDate] = React.useState<Date | null>(null);
    const [currentSelectedDate, setCurrentSelectedDate] = React.useState<Date>(today);

    // Use the custom hook
    const {
        events,
        isLoading,
        refreshKey,
        fetchAppointments,
        createNewAppointment,
        deleteAppointmentById,
        getAppointmentById,
        updateAppointmentById,
        getEventsForDate,
        formatDate
    } = useAppoinment();

    const form = useForm<AppointmentFormData>({
        defaultValues: {
            kunde: '',
            uhrzeit: '',
            selectedEventDate: undefined,
            termin: '',
            bemerk: '',
            mitarbeiter: '',
            isClientEvent: false,
            duration: 1,
            customerId: undefined,
            employeeId: undefined
        }
    });

    const editForm = useForm<AppointmentFormData>({
        defaultValues: {
            kunde: '',
            uhrzeit: '',
            selectedEventDate: undefined,
            termin: '',
            bemerk: '',
            mitarbeiter: '',
            isClientEvent: false,
            duration: 1,
            customerId: undefined,
            employeeId: undefined
        }
    });

    React.useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Generate dates based on selected month from mini calendar or selected row
    const getSelectedMonthDates = () => {
        // If a specific date is selected from mini calendar, generate dates AFTER that date within the same month
        if (selectedRowStartDate) {
            const dates = [];
            const selectedYear = selectedRowStartDate.getFullYear();
            const selectedMonth = selectedRowStartDate.getMonth();
            const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);


            for (let i = 1; i <= 30; i++) {
                const date = new Date(selectedRowStartDate);
                date.setDate(selectedRowStartDate.getDate() + i);


                if (date.getMonth() !== selectedMonth) {
                    break;
                }

                dates.push(date);
            }
            return dates;
        }

        const selectedYear = miniCalendarDate.getFullYear();
        const selectedMonth = miniCalendarDate.getMonth();

        const isCurrentMonth = selectedYear === today.getFullYear() && selectedMonth === today.getMonth();

        const startDate = isCurrentMonth ?
            new Date(today.getTime() + 24 * 60 * 60 * 1000) :
            new Date(selectedYear, selectedMonth, 1);

        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);

        const dates = [];
        for (let date = new Date(startDate); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
            dates.push(new Date(date));
        }

        return dates;
    };

    const selectedMonthDates = getSelectedMonthDates();
    const visibleDates = selectedMonthDates.slice(0, visibleDaysCount);
    const hasMoreDates = visibleDaysCount < selectedMonthDates.length;


    const handleSeeMore = () => {
        setVisibleDaysCount(prev => Math.min(prev + 4, selectedMonthDates.length));
    };

    const miniCalendarMonth = miniCalendarDate.getMonth();
    const miniCalendarYear = miniCalendarDate.getFullYear();

    React.useEffect(() => {
        setVisibleDaysCount(4);
        setSelectedRowStartDate(null);
        setCurrentSelectedDate(today);
    }, [miniCalendarMonth, miniCalendarYear, today]);

    // Override the handleMiniCalendarDateClick to set selected row
    const handleMiniCalendarDateClickOverride = (date: Date) => {
        setSelectedRowStartDate(date);
        setCurrentSelectedDate(date);
        setVisibleDaysCount(4);
        handleMiniCalendarDateClick(date);
    };

    const handleDateClick = (date: Date) => {
        if (isPastDate(date)) {
            alert('You cannot add appointments to past dates.');
            return;
        }

        form.reset();
        form.setValue('selectedEventDate', date);
        setShowAddForm(true);
    };


    const onSubmit = async (data: { selectedEventDate: Date | undefined; isClientEvent: boolean; kunde: string; uhrzeit: string; termin: string; bemerk?: string; mitarbeiter: string; duration: number; customerId?: string; employeeId?: string }) => {
        const success = await createNewAppointment(data);
        if (success) {
            form.reset();
            setShowAddForm(false);
        }
    };


    const deleteAppointments = async (appointmentId: string) => {
        const success = await deleteAppointmentById(appointmentId);
        if (success) {
            setDeleteConfirmation({ show: false, appointmentId: null });
        }
    };


    const handleAppointmentClick = async (appointmentId: string) => {
        const apt = await getAppointmentById(appointmentId);
        if (apt) {
            setSelectedAppointment(apt);

            // Format date and time for form
            const date = new Date(apt.date);
            const to24h = (t: string) => {
                const time = t.trim().toLowerCase();
                const ampm = time.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
                if (ampm) {
                    let h = parseInt(ampm[1], 10);
                    const m = ampm[2];
                    const mod = ampm[3];
                    if (mod === 'pm' && h !== 12) h += 12;
                    if (mod === 'am' && h === 12) h = 0;
                    return `${String(h).padStart(2, '0')}:${m}`;
                }
                const hhmm = time.match(/^(\d{1,2}):(\d{2})$/);
                if (hhmm) {
                    return `${hhmm[1].padStart(2, '0')}:${hhmm[2]}`;
                }
                // Fallback: try Date parsing
                const d = new Date(`2000-01-01T${time}`);
                if (!isNaN(d.getTime())) {
                    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                }
                return time;
            };
            const formattedTime = to24h(apt.time);

            editForm.reset({
                kunde: apt.customer_name,
                uhrzeit: formattedTime,
                selectedEventDate: date,
                termin: apt.reason,
                bemerk: apt.details,
                mitarbeiter: apt.assignedTo,
                isClientEvent: apt.isClient,
                duration: apt.duration || 1,
                customerId: apt.customerId,
                employeeId: apt.employeId
            });

            setIsEditModalOpen(true);
        }
    };

    const onUpdateSubmit = async (data: { selectedEventDate: Date | undefined; isClientEvent: boolean; kunde: string; uhrzeit: string; termin: string; bemerk?: string; mitarbeiter: string; duration: number; customerId?: string; employeeId?: string }) => {
        if (!selectedAppointment?.id) return;

        const success = await updateAppointmentById(selectedAppointment.id.toString(), data);
        if (success) {
            setIsEditModalOpen(false);
        }
    };

    return (
        <div className=" bg-white">
            {/* <div className='p-4 sm:p-6'>
                <AppoinmentData onRefresh={refreshKey} />
            </div> */}

            {/* Header */}
            <div className=" bg-white border-b border-gray-200 z-40">
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-xl sm:text-2xl font-bold">TERMINKALENDER</h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center cursor-pointer gap-2 px-3 sm:px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50 text-sm"
                            >
                                <span className="hidden sm:inline">TERMIN HINZUFÜGEN</span>
                                <span className="sm:hidden">TERMIN</span>
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-2 sm:p-4 md:p-6">
                <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 mb-6 sm:mb-10 w-full">

                    {/* Daily Calendar View - Responsive layout */}
                    <div className="w-full xl:w-11/12">
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
                        />
                    </div>

                    {/* MiniCalendar */}
                    <div className="w-full xl:w-5/12">
                        <MiniCalendar
                            isMobile={isMobile}
                            miniCalendarDate={miniCalendarDate}
                            showYearMonthPicker={showYearMonthPicker}
                            setShowYearMonthPicker={setShowYearMonthPicker}
                            navigateMiniCalendarMonth={navigateMiniCalendarMonth}
                            handleYearMonthChange={handleYearMonthChange}
                            miniCalendarDays={miniCalendarDays}
                            visibleDates={visibleDates}
                            today={today}
                            monthNames={monthNames}
                            dayNames={dayNames}
                            isSameDay={isSameDay}
                            isPastDate={isPastDate}
                            handleMiniCalendarDateClick={handleMiniCalendarDateClickOverride}
                            getEventsForDate={getEventsForDate}
                            currentDate={currentDate}
                            selectedRowStartDate={selectedRowStartDate}
                        />
                    </div>

                    {/* Selected Date Display */}
                    {/* <DayView
                        selectedDate={selectedRowStartDate ? currentSelectedDate : today}
                        events={getEventsForDate(selectedRowStartDate ? currentSelectedDate : today)}
                        monthNames={monthNames}
                        dayNamesLong={dayNamesLong}
                        isSelectedDate={!!selectedRowStartDate}
                    /> */}
                </div>




                <div className={`${isMobile ? 'block' : 'flex gap-8'}`}>
                    {/* Monthly Calendar */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {visibleDates.map((date, index) => {
                                const dayEvents = getEventsForDate(date);
                                const isToday = isSameDay(date, today);
                                const dayColor = date.getDay() === 0 || date.getDay() === 6 ? 'text-red-500' : 'text-gray-600';

                                return (
                                    <div key={index} className="border-b border-gray-200 pb-6">
                                        {/* Date Header */}
                                        <div className={`flex items-center justify-between mb-4 p-3 rounded ${isPastDate(date) ? 'bg-gray-100 border border-gray-200' : 'bg-gray-50'
                                            }`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`text-3xl sm:text-4xl font-light ${dayColor} ${isPastDate(date) ? 'opacity-60' : ''
                                                    }`}>
                                                    {date.getDate()}
                                                </div>
                                                <div>
                                                    <div className={`text-sm ${dayColor} ${isPastDate(date) ? 'opacity-60' : ''
                                                        }`}>
                                                        {dayNamesLong[date.getDay()]}
                                                    </div>
                                                    <div className={`text-xs ${isPastDate(date) ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>
                                                        {monthNames[date.getMonth()]} {date.getFullYear()}
                                                    </div>
                                                </div>
                                            </div>
                                            {isToday && (
                                                <div className="w-4 h-4 bg-[#62A07C] rounded-full"></div>
                                            )}
                                            {isPastDate(date) && (
                                                <div className="text-xs text-gray-400 italic">Past</div>
                                            )}
                                        </div>

                                        {/* Events List */}
                                        <div className="space-y-3">
                                            {isLoading ? (
                                                <div className="flex justify-center items-center py-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#62A07C]"></div>
                                                </div>
                                            ) : (
                                                <>
                                                    {dayEvents.map((event: Event) => (
                                                        <div
                                                            key={event.id}
                                                            className="relative group"
                                                            onClick={() => handleAppointmentClick(event.id)}
                                                        >
                                                            <div className={`p-3 rounded-lg text-sm font-medium border-l-4 cursor-pointer ${event.type === 'user'
                                                                ? 'bg-gray-900 text-white border-gray-700'
                                                                : 'bg-[#62A07C] text-white border-green-700'
                                                                }`}>
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        {event.time && (
                                                                            <div className="text-xs opacity-90 mb-1">{(() => {
                                                                                const t = event.time.trim().toLowerCase();
                                                                                const ampm = /^(\d{1,2}):(\d{2})\s*(am|pm)$/;
                                                                                const m = t.match(ampm);
                                                                                if (m) {
                                                                                    let h = parseInt(m[1], 10);
                                                                                    const min = m[2];
                                                                                    const mod = m[3];
                                                                                    if (mod === 'pm' && h !== 12) h += 12;
                                                                                    if (mod === 'am' && h === 12) h = 0;
                                                                                    return `${String(h).padStart(2, '0')}:${min}`;
                                                                                }
                                                                                const is24 = /^\d{1,2}:\d{2}$/.test(t);
                                                                                if (is24) return t.length === 4 ? `0${t}` : t;
                                                                                const d = new Date(`2000-01-01T${t}`);
                                                                                if (!isNaN(d.getTime())) {
                                                                                    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                                                                                }
                                                                                return t;
                                                                            })()}</div>
                                                                        )}
                                                                        <h1 className="font-semibold">{event.title}</h1>
                                                                        {
                                                                            event.assignedTo && (
                                                                                <div className="text-xs opacity-90 mb-1">Mitarbeiter: {event.assignedTo}</div>
                                                                            )
                                                                        }
                                                                        {
                                                                            event.reason && (
                                                                                <div className="text-xs opacity-90 mb-1">Grund: {event.reason}</div>
                                                                            )
                                                                        }
                                                                        {
                                                                            event.duration && (
                                                                                <div className="text-xs opacity-90 mb-1">Dauer: {event.duration === 0.17 ? '10 Min' :
                                                                                    event.duration === 0.5 ? '30 Min' :
                                                                                        event.duration === 1 ? '60 Min' :
                                                                                            `${event.duration} Std`}</div>
                                                                            )
                                                                        }

                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setDeleteConfirmation({
                                                                                show: true,
                                                                                appointmentId: event.id
                                                                            });
                                                                        }}
                                                                        className="opacity-0 cursor-pointer group-hover:opacity-100 text-white bg-red-500 rounded-full p-1 ml-2"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDateClick(date);
                                                }}
                                                disabled={isPastDate(date)}
                                                className={`w-full cursor-pointer p-3 border-2 border-dashed rounded-lg text-sm transition-colors ${isPastDate(date)
                                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                                                    : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                title={isPastDate(date) ? 'Cannot add appointments to past dates' : 'Add new appointment'}
                                            >
                                                {isPastDate(date) ? 'Past Date' : '+ Termin hinzufügen'}
                                            </button>
                                            {dayEvents.length === 0 && (
                                                <div className="space-y-2 py-4">
                                                    {[...Array(6)].map((_, i) => (
                                                        <div key={i} className="h-px bg-gray-200"></div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* See More Button - Always show when there are more days */}
                            {hasMoreDates && (
                                <div className="col-span-full flex justify-center mt-6">
                                    <button
                                        onClick={handleSeeMore}
                                        className="px-6 py-3 bg-[#62A07C] text-white rounded-lg hover:bg-[#4f8a65] transition-colors cursor-pointer"
                                    >
                                        Mehr Anzeigen 
                                        {/* ({selectedMonthDates.length - visibleDaysCount} more days) */}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            {showAddForm && (
                <AppointmentModal
                    isOpen
                    onClose={() => {
                        setShowAddForm(false);
                        form.reset();
                    }}
                    form={form}
                    onSubmit={onSubmit}
                    title="Neuer Termin"
                    buttonText="Termin bestätigen"
                />
            )}

            {/* Edit Event Modal */}
            {isEditModalOpen && (
                <AppointmentModal
                    isOpen
                    onClose={() => setIsEditModalOpen(false)}
                    form={editForm}
                    onSubmit={onUpdateSubmit}
                    title="Termin bearbeiten"
                    buttonText="Aktualisieren"
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Bestätigen Sie das Löschen</h3>
                        <p className="text-gray-600 mb-6">Sind Sie sicher, dass Sie diesen Termin löschen möchten?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setDeleteConfirmation({ show: false, appointmentId: null })}
                                className="px-4 py-2 cursor-pointer text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={async () => {
                                    if (!deleteConfirmation.appointmentId || isDeleting) return;
                                    try {
                                        setIsDeleting(true);
                                        await deleteAppointments(deleteConfirmation.appointmentId);
                                    } finally {
                                        setIsDeleting(false);
                                    }
                                }}
                                disabled={isDeleting}
                                className={`px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isDeleting && <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />}
                                {isDeleting ? 'Bitte warten...' : 'Löschen'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyCalendar;