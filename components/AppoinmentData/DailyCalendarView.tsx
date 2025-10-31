'use client'
import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface DailyCalendarViewProps {
    selectedDate: Date;
    events: Event[];
    monthNames: string[];
    dayNamesLong: string[];
    onDateChange: (direction: number) => void;
}

// Color configuration
const EVENT_COLORS = [
    { bg: 'bg-green-50', border: '#4CAF50' },
    { bg: 'bg-orange-50', border: '#FF9800' },
    { bg: 'bg-purple-50', border: '#9C27B0' },
    { bg: 'bg-pink-50', border: '#E91E63' },
    { bg: 'bg-blue-50', border: '#2196F3' },
    { bg: 'bg-yellow-50', border: '#FFC107' },
    { bg: 'bg-red-50', border: '#F44336' },
    { bg: 'bg-teal-50', border: '#009688' },
    { bg: 'bg-indigo-50', border: '#3F51B5' },
    { bg: 'bg-rose-50', border: '#E91E63' }
];

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({
    selectedDate,
    events,
    dayNamesLong,
    onDateChange
}) => {
    // Calendar configuration
    const calendarStartHour = 8; // Start from 08:00
    // Show full 24 hours starting from 08:00 → 07:00 next day
    const timeSlots = Array.from({ length: 24 }, (_, i) => `${String((calendarStartHour + i) % 24).padStart(2, '0')}:00`);
    const containerHeightPx = timeSlots.length * 60; // 60px per hour

    // Parse time to minutes from 6 AM
    const parseTimeToMinutes = (timeStr: string): number => {
        const time = timeStr.trim().toLowerCase();
        const ampmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);

        if (ampmMatch) {
            let hour = parseInt(ampmMatch[1], 10);
            const minute = parseInt(ampmMatch[2], 10);
            const period = ampmMatch[3];

            if (period === 'pm' && hour !== 12) hour += 12;
            if (period === 'am' && hour === 12) hour = 0;

            // Wrap across midnight (e.g., 01:00 should appear after 23:00 when starting at 08:00)
            const diff = (hour - calendarStartHour) * 60 + minute;
            return diff < 0 ? diff + 24 * 60 : diff;
        }

        const time24Match = time.match(/^(\d{1,2}):(\d{2})$/);
        if (time24Match) {
            const hour = parseInt(time24Match[1], 10);
            const minute = parseInt(time24Match[2], 10);
            const diff = (hour - calendarStartHour) * 60 + minute;
            return diff < 0 ? diff + 24 * 60 : diff;
        }

        return 0;
    };

    // Format time for display
    const formatTime = (timeStr: string) => {
        const time = timeStr.trim().toLowerCase();
        const ampmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);

        if (ampmMatch) {
            let hour = parseInt(ampmMatch[1], 10);
            const minute = ampmMatch[2];
            const period = ampmMatch[3];

            if (period === 'pm' && hour !== 12) hour += 12;
            if (period === 'am' && hour === 12) hour = 0;

            return `${String(hour).padStart(2, '0')}:${minute}`;
        }

        const time24Match = time.match(/^(\d{1,2}):(\d{2})$/);
        if (time24Match) {
            return `${time24Match[1].padStart(2, '0')}:${time24Match[2]}`;
        }

        return timeStr;
    };

    // Configuration
    const maxColumns = 4;

    // Calculate event layout
    const eventLayout = useMemo(() => {
        if (events.length === 0) return [];

        const sortedEvents = [...events].sort((a, b) =>
            parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
        );
        const layout: Array<{
            id: string;
            startMinutes: number;
            endMinutes: number;
            durationMinutes: number;
            column: number;
            width: number;
            left: number;
            [key: string]: any;
        }> = [];

        sortedEvents.forEach((event, index) => {
            const startMinutes = parseTimeToMinutes(event.time);
            const durationMinutes = Math.round((event.duration || 0.17) * 60);
            const endMinutes = startMinutes + durationMinutes;

            // Find overlapping events
            const overlappingEvents = sortedEvents.filter((otherEvent, otherIndex) => {
                if (otherIndex === index) return false;
                const otherStartMinutes = parseTimeToMinutes(otherEvent.time);
                const otherEndMinutes = otherStartMinutes + Math.round((otherEvent.duration || 0.17) * 60);
                return !(endMinutes <= otherStartMinutes || startMinutes >= otherEndMinutes);
            });

            // Find available column
            let column = 0;
            for (let col = 0; col < maxColumns; col++) {
                const hasConflict = overlappingEvents.some(overlappingEvent => {
                    const overlappingLayout = layout.find(l => l.id === overlappingEvent.id);
                    return overlappingLayout && overlappingLayout.column === col;
                });

                if (!hasConflict) {
                    column = col;
                    break;
                }
            }

            if (overlappingEvents.length === 0) {
                column = index % maxColumns;
            }

            layout.push({
                ...event,
                startMinutes,
                endMinutes,
                durationMinutes,
                column,
                width: 95 / maxColumns,
                left: column * (95 / maxColumns)
            });
        });

        return layout;
    }, [events]);

    // Deterministic color per assignedTo
    const hashString = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    };

    const getEventColor = (assignedTo: string | undefined, fallbackIndex: number) => {
        if (assignedTo && assignedTo.trim().length > 0) {
            const idx = hashString(assignedTo.trim()) % EVENT_COLORS.length;
            return EVENT_COLORS[idx];
        }
        return EVENT_COLORS[fallbackIndex % EVENT_COLORS.length];
    };

    // Calculate end time
    const getEndTime = (event: any) => {
        const endHour = (Math.floor(event.endMinutes / 60) + calendarStartHour) % 24;
        const endMin = event.endMinutes % 60;
        return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    {(() => {
                        const now = new Date();
                        const isToday = now.getFullYear() === selectedDate.getFullYear() &&
                            now.getMonth() === selectedDate.getMonth() &&
                            now.getDate() === selectedDate.getDate();
                        return isToday ? 'Heute' : dayNamesLong[selectedDate.getDay()];
                    })()}
                </h2>
                <div className="flex items-center gap-1 sm:gap-2 border border-gray-200 rounded-full p-1 shadow-sm">
                    <button
                        onClick={() => onDateChange(-1)}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                    <div className="text-xs sm:text-sm font-medium text-gray-700 px-2 sm:px-3">
                        {dayNamesLong[selectedDate.getDay()]} {selectedDate.getDate()}.{String(selectedDate.getMonth() + 1).padStart(2, '0')}
                    </div>
                    <button
                        onClick={() => onDateChange(1)}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="relative">
                {/* Calendar Grid Container - Responsive with proper overflow handling */}
                <div
                    className="relative bg-white border border-gray-200 rounded-lg overflow-y-auto overflow-x-auto"
                    style={{
                        height: '500px',
                        width: '100%'
                    }}
                >
                    {/* Time Labels - Fixed 5% width - Integrated with table */}
                    <div
                        className="absolute left-0 top-0  z-10"
                        style={{
                            height: `${containerHeightPx}px`,
                            width: '5%'
                        }}
                    >
                        {timeSlots.map((time, index) => (
                            <div
                                key={index}
                                className="absolute text-xs sm:text-sm text-gray-500 font-medium flex items-center justify-center"
                                style={{
                                    top: `${(index * 100) / timeSlots.length}%`,
                                    height: `${100 / timeSlots.length}%`,
                                    width: '100%'
                                }}
                            >
                                {time.split(':')[0]}
                            </div>
                        ))}
                    </div>

                    {/* Background Grid Container - Remaining 95% divided into 4 columns */}
                    <div
                        className="absolute top-0 bg-white"
                        style={{
                            height: `${containerHeightPx}px`,
                            left: '0%',
                            width: '99.9%',
                            minWidth: '800px'
                        }}
                    >
                        {/* Grid Lines - Horizontal */}
                        {timeSlots.map((_, index) => (
                            <div
                                key={index}
                                className="absolute border-t border-gray-200"
                                style={{
                                    top: `${(index * 100) / timeSlots.length}%`,
                                    left: '0',
                                    width: '100%',
                                    height: '1px'
                                }}
                            />
                        ))}

                        {/* Grid Lines - Vertical - Integrated table structure */}
                        <div className="absolute left-0 top-0 w-full h-full">
                            {/* Border at 5% (end of Time Labels) */}
                            <div
                                className="absolute top-0 h-full border-l border-gray-200"
                                style={{
                                    left: '5%',
                                    width: '1px',
                                    height: '100%'
                                }}
                            />
                            {/* Borders for 4 calendar columns */}
                            {Array.from({ length: 4 }, (_, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 h-full border-l border-gray-200"
                                    style={{
                                        left: `${5 + ((i + 1) * 23.75)}%`,
                                        width: '1px',
                                        height: '100%'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Event Blocks */}
                        {eventLayout.map((event, index) => {
                            const color = getEventColor(event.assignedTo, index);
                            const topPercent = (event.startMinutes / (timeSlots.length * 60)) * 100;

                            return (
                                <div
                                    key={event.id}
                                    className={`absolute ${color.bg} rounded-lg p-2 sm:p-3 text-gray-800 cursor-pointer hover:opacity-90 transition-opacity shadow-sm border-2`}
                                    style={{
                                        top: `${topPercent}%`,
                                        left: `${event.left + 6}%`,
                                        width: `${event.width - 2}%`,
                                        minHeight: '50px',
                                        marginTop: '2px',
                                        marginBottom: '2px',
                                        borderColor: color.border
                                    }}
                                >
                                    {/* Time Pills */}
                                    <div className="flex gap-1 mb-1 sm:mb-2">
                                        <div
                                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium text-white border-2"
                                            style={{ backgroundColor: color.border, borderColor: color.border }}
                                        >
                                            {formatTime(event.time)}
                                        </div>
                                        <div
                                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium text-white border-2"
                                            style={{ backgroundColor: color.border, borderColor: color.border }}
                                        >
                                            {getEndTime(event)}
                                        </div>
                                    </div>

                                    {/* Event Title */}
                                    <div className="font-semibold text-xs sm:text-sm mb-1 leading-tight">
                                        {event.customer_name || event.title}
                                    </div>

                                    {/* Event Subtitle */}
                                    {(event.reason || event.subtitle) && (
                                        <div className="text-xs opacity-90 mb-1 sm:mb-2 leading-tight">
                                            {event.reason || event.subtitle}
                                        </div>
                                    )}

                                    {/* Assigned To */}
                                    {event.assignedTo && (
                                        <div className="text-xs opacity-80 mb-1 sm:mb-2 leading-tight flex items-center gap-1">
                                            <span className="font-medium">Assigned to:</span>
                                            <span>{event.assignedTo}</span>
                                        </div>
                                    )}

                                    {/* Customer Avatar */}
                                    <div className="flex items-center gap-1 mt-auto">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-gray-700">
                                                {event.customer_name?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* No Events Message */}
                    {events.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <div className="text-base sm:text-lg font-medium mb-2">No appointments</div>
                                <div className="text-xs sm:text-sm">No appointments scheduled for this day</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyCalendarView;
