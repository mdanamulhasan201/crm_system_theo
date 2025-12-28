'use client'
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
    isMobile: boolean;
    miniCalendarDate: Date;
    showYearMonthPicker: boolean;
    setShowYearMonthPicker: (show: boolean) => void;
    navigateMiniCalendarMonth: (direction: number) => void;
    handleYearMonthChange: (year: number, month: number) => void;
    miniCalendarDays: Date[];
    visibleDates: Date[];
    today: Date;
    monthNames: string[];
    dayNames: string[];
    isSameDay: (date1: Date, date2: Date) => boolean;
    isPastDate: (date: Date) => boolean;
    handleMiniCalendarDateClick: (date: Date) => void;
    getEventsForDate: (date: Date) => any[];
    currentDate: Date;
    selectedRowStartDate?: Date | null;
}

export default function MiniCalendar({
    isMobile,
    miniCalendarDate,
    showYearMonthPicker,
    setShowYearMonthPicker,
    navigateMiniCalendarMonth,
    handleYearMonthChange,
    miniCalendarDays,
    visibleDates,
    today,
    monthNames,
    dayNames,
    isSameDay,
    isPastDate,
    handleMiniCalendarDateClick,
    getEventsForDate,
    currentDate,
    selectedRowStartDate
}: MiniCalendarProps) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

    return (
        <>
            {/* Mini Calendar at the top - Hidden on mobile */}
            {!isMobile && (
                <div className="mb-8 flex justify-center">
                    <div className="w-96 flex-shrink-0 relative bg-white border-2 border-gray-200 rounded-xl p-6 transition-all duration-300">
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => navigateMiniCalendarMonth(-1)}
                                    className="p-2 cursor-pointer hover:bg-[#62A07C] hover:text-white rounded-full border border-gray-300 hover:border-[#62A07C] transition-all duration-200"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => setShowYearMonthPicker(!showYearMonthPicker)}
                                    className="font-semibold text-lg cursor-pointer hover:bg-[#62A07C] hover:text-white px-4 py-1 rounded-lg border border-transparent hover:border-[#62A07C] transition-all duration-300"
                                >
                                    {monthNames[miniCalendarDate.getMonth()]} {miniCalendarDate.getFullYear()}
                                </button>

                                <button
                                    onClick={() => navigateMiniCalendarMonth(1)}
                                    className="p-2 cursor-pointer hover:bg-[#62A07C] hover:text-white rounded-full border border-gray-300 hover:border-[#62A07C] transition-all duration-200"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Year/Month Picker */}
                        {showYearMonthPicker && (
                            <div className="absolute top-20 left-0 right-0 bg-white border-1 border-[#62A07C] rounded-xl z-50 p-6 ">
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-[#62A07C] mb-3">Jahr</label>
                                    <select
                                        value={miniCalendarDate.getFullYear()}
                                        onChange={(e) => handleYearMonthChange(parseInt(e.target.value), miniCalendarDate.getMonth())}
                                        className="w-full cursor-pointer p-2 border-2 border-gray-300 rounded-lg focus:border-[#62A07C] focus:ring-2 focus:ring-[#62A07C]/20 transition-all duration-200"
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-[#62A07C] mb-3">Monat</label>
                                    <select
                                        value={miniCalendarDate.getMonth()}
                                        onChange={(e) => handleYearMonthChange(miniCalendarDate.getFullYear(), parseInt(e.target.value))}
                                        className="w-full cursor-pointer p-2 border-2 border-gray-300 rounded-lg focus:border-[#62A07C] focus:ring-2 focus:ring-[#62A07C]/20 transition-all duration-200"
                                    >
                                        {monthNames.map((month, index) => (
                                            <option key={index} value={index}>{month}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => setShowYearMonthPicker(false)}
                                    className="w-full py-2 bg-[#62A07C] text-white font-semibold rounded-lg cursor-pointer hover:from-[#4f8a65] hover:to-[#62A07C] transform transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    Fertig
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {dayNames.map(day => (
                                <div key={day} className="p-2 font-medium text-gray-600">{day}</div>
                            ))}
                            {miniCalendarDays.map((date, index) => {
                                const isCurrentMonth = date.getMonth() === miniCalendarDate.getMonth();
                                const isToday = isSameDay(date, today);
                                const isSelected = visibleDates.some(visibleDate => isSameDay(visibleDate, date));
                                const isCurrentMonthView = date.getMonth() === currentDate.getMonth();
                                const isPast = isPastDate(date);
                                const hasAppointments = getEventsForDate(date).length > 0; 
                                const isInSelectedRange = selectedRowStartDate && 
                                    date >= selectedRowStartDate && 
                                    date < new Date(selectedRowStartDate.getTime() + 5 * 24 * 60 * 60 * 1000);

                                return (
                                    <div
                                        key={index}
                                        className={`p-2 cursor-pointer hover:bg-gray-200 rounded transition-colors relative ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'
                                            } ${isToday && !isInSelectedRange ? 'bg-[#62A07C] text-white font-bold' : ''
                                            } ${isInSelectedRange ? 'bg-purple-100 text-black font-bold border border-purple-700/40 shadow-lg' : ''
                                            } ${isSelected && !isToday && !isInSelectedRange ? 'bg-blue-100 border-2 border-blue-300' : ''
                                            } ${isCurrentMonthView && !isSelected && !isToday && !isInSelectedRange ? 'bg-blue-50 border border-blue-200' : ''
                                            } ${isPast && !isToday && !isSelected && !isInSelectedRange ? 'opacity-50 text-gray-500' : ''
                                            } ${hasAppointments && !isToday && !isInSelectedRange ? 'text-green-500 font-semibold' : ''
                                            }`}
                                        onClick={() => handleMiniCalendarDateClick(date)}
                                        title={`${date.toDateString()} - Klicken Sie, um die nächsten 4 Tage anzuzeigen${hasAppointments ? ` (${getEventsForDate(date).length} Termin${getEventsForDate(date).length > 1 ? 'e' : ''})` : ''}`}
                                    >
                                        {date.getDate()}
                                        {hasAppointments && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}