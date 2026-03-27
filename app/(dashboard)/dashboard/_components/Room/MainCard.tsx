'use client';

import React, { useState, useMemo, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { format, addDays, isSameDay, startOfWeek } from 'date-fns';
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

export interface EmployeeFreeSlotGroup {
  employeeId: string;
  employeeName: string;
  freeSlots: string[];
}

export interface MainCardProps {
  weekStart?: Date;
  appointmentsByDay?: Record<string, DayAppointment[]>;
  freeSlotsByDay?: Record<string, EmployeeFreeSlotGroup[]>;
  onSlotClick?: (date: Date, slot: string, employeeId: string) => void;
  onAppointmentClick?: (appointmentId: string) => void;
  onCardAppointmentClick?: (date: string, employeeId: string) => void;
}

const DEFAULT_WEEK_DAYS = 4;

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
  onCardAppointmentClick,
}: MainCardProps) {
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: false,
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const weekStart = useMemo(() => {
    if (weekStartProp) return weekStartProp;
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 1 });
  }, [weekStartProp]);

  const days = useMemo(
    () => Array.from({ length: DEFAULT_WEEK_DAYS }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const today = new Date();

  return (
    <div className="mt-5 pb-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-2">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-700">Woche</h3>
          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={scrollPrev}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Vorherige"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Nächste"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embla viewport */}
        <div ref={emblaRef} className="overflow-hidden px-2">
          {/* Embla container — negative margin cancels the per-slide padding */}
          <div className="flex -ml-3 min-h-[200px]">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const appointments = appointmentsByDay[key] ?? [];
              const isToday = isSameDay(day, today);

              return (
                /* Embla slide */
                <div
                  key={key}
                  className="flex-none pl-3 w-full sm:w-1/2 lg:w-1/4"
                >
                  <div className="flex flex-col h-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    {/* Day header */}
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

                    {/* Appointments */}
                    <div className="p-3 flex-1 flex flex-col gap-2 overflow-y-auto min-h-[4.5rem]">
                      {appointments.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-1">Keine Termine</p>
                      ) : (
                        appointments.map((apt) => (
                          <button
                            key={apt.id}
                            type="button"
                            onClick={() => {
                              onAppointmentClick?.(apt.id);
                              onCardAppointmentClick?.(key, apt.id);
                              setExpandedDayKey(key);
                            }}
                            className={cn(
                              'text-left rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-all',
                              'hover:ring-2 hover:ring-offset-1 hover:ring-[#62A07C]/50 hover:brightness-95',
                              colorClasses[apt.color ?? 'gray']
                            )}
                          >
                            <span className="text-gray-500 font-normal">{apt.time}</span>{' '}
                            <span className="font-medium">{apt.title}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Free slots expanded panel */}
        {expandedDayKey && (() => {
          const day = days.find((d) => format(d, 'yyyy-MM-dd') === expandedDayKey);
          if (!day) return null;
          const groups = freeSlotsByDay[expandedDayKey];
          if (groups === undefined) return null;
          const label = `${format(day, 'd')} ${format(day, 'EEE', { locale: de })}`;
          return (
            <div className="border-t border-gray-200 bg-gray-50/80 px-4 py-3 mt-2">
              <div className="flex items-center justify-between mb-3">
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
              {groups.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Keine freien Slots gefunden.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {groups.map((group) => (
                    <div key={group.employeeId}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        {group.employeeName}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.freeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => onSlotClick?.(day, slot, group.employeeId)}
                            className="rounded-lg px-3 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-800 hover:border-[#62A07C] hover:bg-emerald-50/50 transition-colors"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
