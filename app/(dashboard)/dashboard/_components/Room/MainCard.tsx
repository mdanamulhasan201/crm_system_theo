'use client';

import React, { useState, useMemo } from 'react';
import { format, addDays, isSameDay, startOfWeek, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DayAppointment {
  id: string;
  time: string;
  title: string;
  type?: string;
  color?: 'green' | 'orange' | 'gray';
}

export interface MainCardProps {
  /** Start of the week to display (default: current week start) */
  weekStart?: Date;
  /** Appointments per day (key = YYYY-MM-DD) */
  appointmentsByDay?: Record<string, DayAppointment[]>;
  /** Free slots per day when expanded (key = YYYY-MM-DD) */
  freeSlotsByDay?: Record<string, string[]>;
  onSlotClick?: (date: Date, slot: string) => void;
  onAppointmentClick?: (appointmentId: string) => void;
}

const DEFAULT_WEEK_DAYS = 4;
const DEMO_APPOINTMENTS: Record<string, DayAppointment[]> = {
  // Keys filled in component
};
const DEMO_FREE_SLOTS: Record<string, string[]> = {};

function getDemoData(day: Date) {
  const key = format(day, 'yyyy-MM-dd');
  const dayNum = day.getDay();
  if (dayNum === 1) {
    return [
      { id: '1', time: '09:00', title: 'Dr', color: 'gray' as const },
      { id: '2', time: '11:30', title: 'Thera', color: 'gray' as const },
    ];
  }
  if (dayNum === 2) {
    return [
      { id: '3', time: '10:00', title: 'Follow-up', color: 'green' as const },
    ];
  }
  if (dayNum === 3) {
    return [
      { id: '4', time: '09:30', title: 'Team Sync', color: 'orange' as const },
      { id: '5', time: '14:00', title: 'Consultation', color: 'gray' as const },
      { id: '6', time: '16:00', title: 'Review', color: 'gray' as const },
    ];
  }
  if (dayNum === 4) {
    return [{ id: '7', time: '11:00', title: 'New Patient', color: 'gray' as const }];
  }
  return [];
}

function getDemoFreeSlots(day: Date): string[] {
  const d = day.getDay();
  if (d === 2) return ['11:00-11:30', '14:00-14:30'];
  if (d === 3) return ['10:00-10:30'];
  if (d === 4) return ['09:00-09:30', '14:00-14:30', '15:00-15:30'];
  return [];
}

const colorClasses = {
  green: 'bg-emerald-100 text-emerald-800',
  orange: 'bg-amber-100 text-amber-800',
  gray: 'bg-gray-100 text-gray-800',
};

export default function MainCard({
  weekStart: weekStartProp,
  appointmentsByDay = {},
  freeSlotsByDay = {},
  onSlotClick,
  onAppointmentClick,
}: MainCardProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);

  const weekStart = useMemo(() => {
    if (weekStartProp) return weekStartProp;
    const today = new Date();
    return subDays(startOfWeek(today, { weekStartsOn: 1 }), weekOffset * 7);
  }, [weekStartProp, weekOffset]);

  const days = useMemo(() => {
    return Array.from({ length: DEFAULT_WEEK_DAYS }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const today = new Date();

  return (
    <div className=" mt-5 pb-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-2">
        <div className="flex items-center justify-between px-4 py-3  border-gray-100 ">
          <h3 className="text-sm font-semibold text-gray-700">Woche</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o + 1)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Vorherige Woche"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o - 1)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Nächste Woche"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-4 min-h-[200px] px-2">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const appointments = appointmentsByDay[key] ?? getDemoData(day);
            const freeSlots = freeSlotsByDay[key] ?? getDemoFreeSlots(day);
            const isToday = isSameDay(day, today);
            const isExpanded = expandedDayKey === key;

            return (
              <div
                key={key}
                className="flex flex-1 min-w-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{format(day, 'd')}</span>
                    <span className="text-sm text-gray-600">{format(day, 'EEE', { locale: de })}</span>
                  </div>
                  {isToday && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#62A07C] bg-[#62A07C]/10 px-2 py-0.5 rounded">
                      Heute
                    </span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col gap-2 overflow-y-auto">
                  {appointments.map((apt) => (
                    <button
                      key={apt.id}
                      type="button"
                      onClick={() => onAppointmentClick?.(apt.id)}
                      className={cn(
                        'text-left rounded-lg px-2.5 py-2 text-xs font-medium transition-opacity hover:opacity-90',
                        colorClasses[apt.color ?? 'gray']
                      )}
                    >
                      <span className="text-gray-500 font-normal">{apt.time}</span>{' '}
                      <span className="font-medium">{apt.title}</span>
                    </button>
                  ))}
                  {freeSlots.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandedDayKey(isExpanded ? null : key)}
                      className="mt-auto rounded-lg px-2.5 py-2 text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                    >
                      + {freeSlots.length} freie Slots
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {expandedDayKey && (() => {
          const day = days.find((d) => format(d, 'yyyy-MM-dd') === expandedDayKey);
          const freeSlots =
            day != null
              ? freeSlotsByDay[expandedDayKey] ?? getDemoFreeSlots(day)
              : [];
          if (!day || freeSlots.length === 0) return null;
          const label = `${format(day, 'd')} ${format(day, 'EEE', { locale: de })}`;
          return (
            <div className="border-t border-gray-200 bg-gray-50/80 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Verfügbare Slots für {label}:
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedDayKey(null)}
                  className="p-1 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  aria-label="Schließen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {freeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onSlotClick?.(day, slot)}
                    className="rounded-lg px-3 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-800 hover:border-[#62A07C] hover:bg-emerald-50/50 transition-colors"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
