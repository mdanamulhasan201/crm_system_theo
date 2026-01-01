'use client'
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAssignedToColor } from '@/lib/appointmentColors';

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
    onTimeSlotClick?: (time: string, date: Date) => void;
}

// Using assignedTo-based color system from appointmentColors.ts

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({
    selectedDate,
    events,
    dayNamesLong,
    onDateChange,
    onEventClick,
    onTimeSlotClick
}) => {
    // Calendar configuration - Only show 5 AM to 9 PM (5-21)
    const calendarStartHour = 5;
    const calendarEndHour = 21; // 9 PM
    const totalHours = calendarEndHour - calendarStartHour + 1; // 17 hours (5 to 21 inclusive)
    const timeSlots = Array.from({ length: totalHours }, (_, i) => `${String(calendarStartHour + i).padStart(2, '0')}:00`);
    const heightPerSlot = 150; // Height in pixels per time slot (17 slots * 150px = 2550px total) - Increased for better visibility and content display
    const containerHeightPx = timeSlots.length * heightPerSlot;
    // Show first 4 hours (5-9) initially, then scroll for rest
    const initialVisibleHours = 4; // 5 to 9 (4 hours)
    const initialVisibleHeight = initialVisibleHours * heightPerSlot; // 600px (4 * 150)

    // Modal state
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [noteContent, setNoteContent] = useState<string>('');

    // Parse time to minutes from 5 AM (calendarStartHour)
    const parseTimeToMinutes = (timeStr: string): number => {
        const time = timeStr.trim().toLowerCase();
        const ampmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);

        if (ampmMatch) {
            let hour = parseInt(ampmMatch[1], 10);
            const minute = parseInt(ampmMatch[2], 10);
            const period = ampmMatch[3];

            if (period === 'pm' && hour !== 12) hour += 12;
            if (period === 'am' && hour === 12) hour = 0;

            // Clamp hour to calendar range (5-21)
            if (hour < calendarStartHour) hour = calendarStartHour;
            if (hour > calendarEndHour) hour = calendarEndHour;

            // Calculate minutes from start of calendar (5 AM)
            const diff = (hour - calendarStartHour) * 60 + minute;
            return Math.max(0, diff);
        }

        const time24Match = time.match(/^(\d{1,2}):(\d{2})$/);
        if (time24Match) {
            let hour = parseInt(time24Match[1], 10);
            const minute = parseInt(time24Match[2], 10);
            
            // Clamp hour to calendar range (5-21)
            if (hour < calendarStartHour) hour = calendarStartHour;
            if (hour > calendarEndHour) hour = calendarEndHour;

            const diff = (hour - calendarStartHour) * 60 + minute;
            return Math.max(0, diff);
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

    // Helper function to check if event has employee assignment
    const hasEmployeeAssignment = (event: Event): boolean => {
        if (Array.isArray(event.assignedTo) && event.assignedTo.length > 0) {
            return true; // Has employee array
        }
        if (typeof event.assignedTo === 'string' && event.assignedTo.trim() !== '') {
            return true; // Has employee string
        }
        return false;
    };

    // Calculate event layout
    const eventLayout = useMemo(() => {
        if (events.length === 0) return [];

        // Sort events: first by time, then prioritize employee-assigned events
        const sortedEvents = [...events].sort((a, b) => {
            const timeDiff = parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
            if (timeDiff !== 0) return timeDiff;
            
            // If same time, prioritize employee-assigned events (process them first)
            const aHasEmployee = hasEmployeeAssignment(a);
            const bHasEmployee = hasEmployeeAssignment(b);
            if (aHasEmployee && !bHasEmployee) return -1; // Employee first
            if (!aHasEmployee && bHasEmployee) return 1;  // Employee first
            return 0;
        });

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

            // Find overlapping events (already processed ones)
            const overlappingLayouts = layout.filter(layoutItem => {
                return !(endMinutes <= layoutItem.startMinutes || startMinutes >= layoutItem.endMinutes);
            });

            // Check if this event has employee assignment
            const isEmployeeAssigned = hasEmployeeAssignment(event);

            // Find available column with priority logic
            let column = 0;
            
            // Check if left column (0) is occupied by overlapping events
            const leftColumnOccupied = overlappingLayouts.some(layoutItem => layoutItem.column === 0);
            
            if (isEmployeeAssigned) {
                // Employee-assigned events: prioritize left column
                if (!leftColumnOccupied) {
                    column = 0; // Use left column if available
                } else {
                    // Left column occupied, find next available column
                    for (let col = 1; col < maxColumns; col++) {
                        const columnOccupied = overlappingLayouts.some(layoutItem => layoutItem.column === col);
                        if (!columnOccupied) {
                            column = col;
                            break;
                        }
                    }
                }
            } else {
                // Non-employee events: use left column if free, otherwise use right columns
                if (!leftColumnOccupied) {
                    column = 0; // Use left column if available
                } else {
                    // Left column occupied, find next available column
                    for (let col = 1; col < maxColumns; col++) {
                        const columnOccupied = overlappingLayouts.some(layoutItem => layoutItem.column === col);
                        if (!columnOccupied) {
                            column = col;
                            break;
                        }
                    }
                }
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
        // Calculate end time from start time + duration
        const startMinutes = parseTimeToMinutes(event.time);
        const durationMinutes = Math.round((event.duration || 0.17) * 60);
        const totalEndMinutes = startMinutes + durationMinutes;
        
        const endHour = Math.floor(totalEndMinutes / 60) + calendarStartHour;
        const endMin = totalEndMinutes % 60;
        
        // Clamp to calendar range (5-21)
        const clampedHour = Math.min(Math.max(endHour, calendarStartHour), calendarEndHour);
        const clampedMin = clampedHour === calendarEndHour && endMin > 0 ? 0 : endMin;
        
        return `${String(clampedHour).padStart(2, '0')}:${String(clampedMin).padStart(2, '0')}`;
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
                        height: `${initialVisibleHeight}px`,
                        width: '100%'
                    }}
                >
                    {/* Time Labels - Fixed 5% width - Integrated with table */}
                    <div
                        className="absolute left-0 top-0 z-20 pointer-events-none"
                        style={{
                            height: `${containerHeightPx}px`,
                            width: '5%'
                        }}
                    >
                        {timeSlots.map((time, index) => (
                            <div
                                key={index}
                                className="absolute text-xs sm:text-sm text-gray-500 font-medium flex items-center justify-center pointer-events-none"
                                style={{
                                    top: `${index * heightPerSlot}px`,
                                    height: `${heightPerSlot}px`,
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
                            minWidth: '1000px',
                            minHeight: `${containerHeightPx}px`
                        }}
                    >
                        {/* Grid Lines - Horizontal */}
                        {timeSlots.map((_, index) => (
                            <div
                                key={index}
                                className="absolute border-t border-gray-200"
                                style={{
                                    top: `${index * heightPerSlot}px`,
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

                        {/* Clickable Time Slots - Full box clickable for creating new appointments */}
                        {onTimeSlotClick && timeSlots.map((timeSlot, index) => {
                            const hour = calendarStartHour + index;
                            const timeString = `${String(hour).padStart(2, '0')}:00`;
                            
                            return (
                                <div
                                    key={`timeslot-${index}`}
                                    className="absolute cursor-pointer hover:bg-blue-50/30 transition-colors z-0"
                                    style={{
                                        top: `${index * heightPerSlot}px`,
                                        left: '0%',
                                        width: '100%',
                                        height: `${heightPerSlot}px`
                                    }}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        if (onTimeSlotClick) {
                                            onTimeSlotClick(timeString, selectedDate);
                                        }
                                    }}
                                    title={`Doppelklicken Sie, um einen Termin um ${timeString} zu erstellen`}
                                />
                            );
                        })}

                        {/* Event Blocks */}
                        {eventLayout.map((event, index) => {
                            // Get color based on assignedTo using getAssignedToColor
                            const assignedToForColor = Array.isArray(event.assignedTo)
                                ? event.assignedTo.length > 0
                                    ? event.assignedTo[0].assignedTo
                                    : ''
                                : (typeof event.assignedTo === 'string' ? event.assignedTo : '');
                            const color = getAssignedToColor(assignedToForColor, index);
                            
                            // Calculate exact pixel positions based on minutes
                            // Since heightPerSlot = 150px and each hour = 60 minutes, 1 minute = 150/60 = 2.5px
                            const pixelsPerMinute = heightPerSlot / 60; // 150px per 60 minutes = 2.5px per minute
                            
                            // Calculate top position: startMinutes * pixelsPerMinute (exact calculation)
                            const topPx = Math.round(event.startMinutes * pixelsPerMinute * 100) / 100; // Round to 2 decimals for precision
                            
                            // Calculate height: durationMinutes * pixelsPerMinute (exact, ensure it doesn't exceed)
                            // Make sure height is calculated precisely so card ends exactly at end time
                            const calculatedHeight = event.durationMinutes * pixelsPerMinute;
                            const heightPx = Math.round(calculatedHeight * 100) / 100; // Round to 2 decimals
                            
                            // Ensure the card doesn't extend beyond the container
                            const maxHeight = containerHeightPx - topPx;
                            const finalHeight = Math.min(heightPx, maxHeight);

                            return (
                                <div
                                    key={event.id}
                                    className={`absolute ${color.bg} rounded-md text-gray-800 ${onEventClick ? 'cursor-pointer hover:opacity-90' : ''} transition-opacity shadow-md overflow-visible z-10`}
                                    style={{
                                        top: `${topPx}px`,
                                        left: `${event.left + 6}%`,
                                        width: `${event.width - 2}%`,
                                        height: `${finalHeight}px`,
                                        minHeight: `${heightPerSlot / 2.5}px`, // Minimum height for better content visibility (60px)
                                        boxSizing: 'border-box',
                                        margin: 0,
                                        padding: '4px'
                                    }}
                                    onDoubleClick={onEventClick ? () => onEventClick(event.id) : undefined}
                                    title={onEventClick ? "Doppelklicken Sie, um zu bearbeiten" : undefined}
                                >
                                    {/* Main Content - Full Card Layout */}
                                    <div className="px-2 py-1 h-full flex flex-col relative" style={{ paddingTop: '0px', paddingBottom: '28px' }}>
                                        {/* Top Section: Title and Icons */}
                                        <div className="flex items-start justify-between mb-1 gap-1.5">
                                            {/* Event Title/Reason - Left Side */}
                                            {(event.reason || event.subtitle) && (
                                                <div className="text-xs font-semibold leading-tight flex-1 break-words" style={{ lineHeight: '1.3', wordBreak: 'break-word' }}>
                                                    {event.reason || event.subtitle}
                                                </div>
                                            )}
                                            
                                            {/* Employee Icons - Right Side */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {Array.isArray(event.assignedTo) && event.assignedTo.length > 0 ? (
                                                    event.assignedTo.slice(0, 2).map((emp, empIndex) => (
                                                        <div
                                                            key={emp.employeId || empIndex}
                                                            className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center border border-white/50 flex-shrink-0"
                                                            title={emp.assignedTo}
                                                        >
                                                            <span className="text-[10px] font-medium" style={{ color: color.border }}>
                                                                {emp.assignedTo?.charAt(0).toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : typeof event.assignedTo === 'string' && event.assignedTo.includes(',') ? (
                                                    event.assignedTo.split(',').slice(0, 2).map((name, nameIndex) => {
                                                        const trimmedName = name.trim();
                                                        return trimmedName ? (
                                                            <div
                                                                key={nameIndex}
                                                                className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center border border-white/50 flex-shrink-0"
                                                                title={trimmedName}
                                                            >
                                                                <span className="text-[10px] font-medium" style={{ color: color.border }}>
                                                                    {trimmedName.charAt(0).toUpperCase() || 'U'}
                                                                </span>
                                                            </div>
                                                        ) : null;
                                                    })
                                                ) : typeof event.assignedTo === 'string' ? (
                                                    <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center border border-white/50 flex-shrink-0">
                                                        <span className="text-[10px] font-medium" style={{ color: color.border }}>
                                                            {event.assignedTo?.charAt(0).toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* Customer name */}
                                        {event.customer_name && (
                                            <div className="text-xs mb-1 leading-tight" style={{ lineHeight: '1.4' }}>
                                                <span className="text-gray-700">Kunde: </span>
                                                {event.customerId ? (
                                                    <Link
                                                        href={`/dashboard/scanning-data/${event.customerId}`}
                                                        className="font-semibold text-blue-600 hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {event.customer_name}
                                                    </Link>
                                                ) : (
                                                    <span className='font-semibold text-gray-700'>{event.customer_name}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Note button - After Customer name */}
                                        {event.details && (
                                            <div className="mb-1">
                                                <button
                                                    className='text-xs font-medium text-gray-700 underline cursor-pointer hover:text-gray-900'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setNoteContent(event.details || '');
                                                        setIsNotesOpen(true);
                                                    }}
                                                >
                                                    Notiz öffnen
                                                </button>
                                            </div>
                                        )}

                                        {/* Time Indicators - Bottom Right */}
                                        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 flex-shrink-0">
                                            <div
                                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white whitespace-nowrap"
                                                style={{ backgroundColor: color.border }}
                                            >
                                                {formatTime(event.time)}
                                            </div>
                                            <div
                                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white whitespace-nowrap"
                                                style={{ backgroundColor: color.border }}
                                            >
                                                {getEndTime(event)}
                                            </div>
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

