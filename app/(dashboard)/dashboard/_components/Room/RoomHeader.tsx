'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface StaffItem {
    id: string;
    name: string;
    percentage: number;
}

export interface RoomItem {
    id: string;
    name: string;
    percentage: number;
}

export interface RoomHeaderProps {
    staff?: StaffItem[];
    rooms?: RoomItem[];
    selectedStaffId?: string | null;
    selectedRoomId?: string | null;
    onStaffSelect?: (id: string) => void;
    onRoomSelect?: (id: string) => void;
}

const DEFAULT_STAFF: StaffItem[] = [
    { id: '1', name: 'Anna', percentage: 100 },
    { id: '2', name: 'Mark', percentage: 65 },
    { id: '3', name: 'Lisa', percentage: 91 },
    { id: '4', name: 'Tom', percentage: 48 },
];

const DEFAULT_ROOMS: RoomItem[] = [
    { id: '1', name: 'Room 1', percentage: 65 },
    { id: '2', name: 'Scan 2', percentage: 78 },
    { id: '3', name: 'Consultation', percentage: 85 },
    { id: '4', name: 'Lab', percentage: 42 },
];

function FilterPill<T extends { id: string; name: string; percentage: number }>({
    item,
    selected,
    onSelect,
    showPercentageInLabel = true,
}: {
    item: T;
    selected: boolean;
    onSelect: () => void;
    showPercentageInLabel?: boolean;
}) {
    const label = showPercentageInLabel ? `${item.name} ${item.percentage}%` : item.name;
    const pct = Math.min(100, Math.max(0, item.percentage));

    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                'relative flex flex-col rounded-xl min-w-[5rem] px-3.5 py-2.5 text-left transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#62A07C] focus-visible:ring-offset-2',
                selected
                    ? 'bg-[#62A07C] text-white shadow-md shadow-[#62A07C]/20'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#62A07C]/40 hover:bg-gray-50/80'
            )}
        >
            <span className="text-sm font-semibold truncate leading-tight">{label}</span>
            <div
                className={cn(
                    'mt-2 h-1.5 w-full rounded-full overflow-hidden',
                    selected ? 'bg-white/30' : 'bg-gray-200'
                )}
            >
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-300',
                        selected ? 'bg-white' : 'bg-[#62A07C]/60'
                    )}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </button>
    );
}

export default function RoomHeader({
    staff = DEFAULT_STAFF,
    rooms = DEFAULT_ROOMS,
    selectedStaffId = null,
    selectedRoomId = null,
    onStaffSelect,
    onRoomSelect,
}: RoomHeaderProps) {
    return (
        <div className="px-4 mt-10 py-5 bg-white border-t border-gray-100 rounded-t-xl shadow-sm">
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Staff
                        </span>
                        <span className="hidden sm:inline text-gray-300">·</span>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {staff.map((s) => (
                            <FilterPill
                                key={s.id}
                                item={s}
                                selected={selectedStaffId === s.id}
                                onSelect={() => onStaffSelect?.(s.id)}
                                showPercentageInLabel
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Räume
                        </span>
                        <span className="hidden sm:inline text-gray-300">·</span>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {rooms.map((r) => (
                            <FilterPill
                                key={r.id}
                                item={r}
                                selected={selectedRoomId === r.id}
                                onSelect={() => onRoomSelect?.(r.id)}
                                showPercentageInLabel
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
