'use client'
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCustomerColor, getAssignedToColor, EVENT_COLORS } from '@/lib/appointmentColors';

interface Event {
    id: string;
    date: string;
    time: string;
    title: string;
    subtitle: string;
    type: string;
    assignedTo: string | Array<{
        employeId: string;
        assignedTo: string;
    }>;
    reason: string;
    details?: string;
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
    onEventClick?: (eventId: string) => void;
    colorMode?: 'customer' | 'assignedTo';
}

// Colors are now imported from shared utility

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({
    selectedDate,
    events,
    dayNamesLong,
    onDateChange,
    onEventClick,
    colorMode = 'customer'
}) => {
    // Calendar configuration
    const calendarStartHour = 8;
    const timeSlots = Array.from({ length: 24 }, (_, i) => `${String((calendarStartHour + i) % 24).padStart(2, '0')}:00`);
    const containerHeightPx = timeSlots.length * 100;

    // Modal state
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [noteContent, setNoteContent] = useState<string>('');

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

    // Get color based on customer (customerId or customer_name)
    // This ensures the same customer always gets the same color

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
                        height: '700px',
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
                            minWidth: '1000px'
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
                            // Get color based on colorMode
                            // If colorMode is 'assignedTo', use employee-based colors (old system)
                            // If colorMode is 'customer', use customer-based colors (new system)
                            const assignedToForColor = Array.isArray(event.assignedTo) 
                                ? event.assignedTo.length > 0 
                                    ? event.assignedTo[0].assignedTo 
                                    : ''
                                : (typeof event.assignedTo === 'string' ? event.assignedTo : '');
                            const color = colorMode === 'assignedTo'
                                ? getAssignedToColor(assignedToForColor, index)
                                : getCustomerColor(event.customerId, event.customer_name, index);
                            const topPercent = (event.startMinutes / (timeSlots.length * 60)) * 100;
                            const heightPercent = (event.durationMinutes / (timeSlots.length * 60)) * 100;

                            return (
                                <div
                                    key={event.id}
                                    className={`absolute ${color.bg} rounded-lg p-2 sm:p-3 text-gray-800 ${onEventClick ? 'cursor-pointer hover:opacity-90' : ''} transition-opacity shadow-sm border-2`}
                                    style={{
                                        top: `${topPercent}%`,
                                        left: `${event.left + 6}%`,
                                        width: `${event.width - 2}%`,
                                        height: `${heightPercent}%`,
                                        minHeight: '140px',
                                        marginTop: '2px',
                                        marginBottom: '2px',
                                        borderColor: color.border
                                    }}
                                    onClick={onEventClick ? () => onEventClick(event.id) : undefined}
                                >
                                    {/* Time Pills */}
                                    <div className='flex justify-between items-center'>
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

                                        <h2
                                            className='text-xs sm:text-sm font-medium text-gray-700 underline cursor-pointer'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setNoteContent(event.details || '');
                                                setIsNotesOpen(true);
                                            }}
                                        >
                                            Notiz öffnen
                                        </h2>
                                    </div>

                                    {/* customer name */}
                                    <div className=" text-xs sm:text-sm mb-1 leading-tight">
                                        {
                                            event.customer_name && (
                                                <>
                                                    Kund:{' '}
                                                    {event.customerId ? (
                                                        <Link
                                                            href={`/dashboard/customer-info/${event.customerId}`}
                                                            className="font-semibold text-blue-600 hover:underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {event.customer_name}
                                                        </Link>
                                                    ) : (
                                                        <span className='font-semibold'>{event.customer_name}</span>
                                                    )}
                                                </>
                                            )
                                        }
                                    </div>

                                    {/* Event Subtitle */}
                                    {(event.reason || event.subtitle) && (
                                        <div className="text-xs opacity-90 mb-1 sm:mb-2 leading-tight">
                                            {event.reason || event.subtitle}
                                        </div>
                                    )}

                                    {/* Assigned To */}
                                    {/* {event.assignedTo && (
                                        <div className="text-xs opacity-80 mb-1 sm:mb-2 leading-tight flex items-center gap-1">
                                            <span className="font-medium">Kunde</span>
                                            <span>{event.customer_name}</span>
                                        </div>
                                    )} */}

                                    {/* employee avatar */}
                                    <div className="flex items-center gap-1 mt-auto flex-wrap">
                                        {Array.isArray(event.assignedTo) && event.assignedTo.length > 0 ? (
                                            // Multiple employees (array format) - show all avatars
                                            event.assignedTo.map((emp, empIndex) => (
                                                <div 
                                                    key={emp.employeId || empIndex}
                                                    className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full flex items-center justify-center"
                                                    title={emp.assignedTo}
                                                >
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {emp.assignedTo?.charAt(0).toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            ))
                                        ) : typeof event.assignedTo === 'string' && event.assignedTo.includes(',') ? (
                                            // Multiple employees (comma-separated string format) - show all avatars
                                            event.assignedTo.split(',').map((name, nameIndex) => {
                                                const trimmedName = name.trim();
                                                return trimmedName ? (
                                                    <div 
                                                        key={nameIndex}
                                                        className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full flex items-center justify-center"
                                                        title={trimmedName}
                                                    >
                                                        <span className="text-xs font-medium text-gray-700">
                                                            {trimmedName.charAt(0).toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                ) : null;
                                            })
                                        ) : (
                                            // Single employee (string format) or no employee
                                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-gray-700">
                                                    {typeof event.assignedTo === 'string' 
                                                        ? event.assignedTo?.charAt(0).toUpperCase() || 'U'
                                                        : 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* No Events Message */}
                    {events.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <div className="text-base sm:text-lg font-medium mb-2">Keine Termine</div>
                                <div className="text-xs sm:text-sm">Keine Termine für diesen Tag geplant</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isNotesOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setIsNotesOpen(false)} />
                    <div className="relative bg-white rounded-lg shadow-lg w-[90%] max-w-md p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-800">Notiz</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700 text-sm"
                                onClick={() => setIsNotesOpen(false)}
                            >
                                Schließen
                            </button>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                            {noteContent}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                className="px-3 py-1.5 rounded-md bg-gray-800 text-white text-xs sm:text-sm"
                                onClick={() => setIsNotesOpen(false)}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyCalendarView;
