'use client';

import React from 'react';
import { ScanLine, ShoppingBag, Wrench, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'scans' | 'shoes' | 'versorgungen' | 'reviews';

const TABS: { id: TabId; label: string; icon: React.ComponentType<React.SVGAttributes<SVGElement> & { size?: number }> }[] = [
  { id: 'scans', label: 'Durchgeführte Scans', icon: ScanLine },
  { id: 'versorgungen', label: 'Versorgungen', icon: Wrench },
  { id: 'shoes', label: 'Schuhkäufe', icon: ShoppingBag },

  { id: 'reviews', label: 'Bewertungen', icon: Star },
];

export interface CardFilterTabProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function CardFilterTab({ activeTab, onTabChange }: CardFilterTabProps) {
  return (
    <div className="w-full border-b border-gray-200">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max gap-0 md:justify-start">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 cursor-pointer',
                  isActive
                    ? 'text-emerald-500 border-emerald-500 bg-transparent'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                )}
              >
                <Icon
                  className={cn('w-5 h-5 shrink-0', isActive ? 'text-emerald-500' : 'text-gray-500')}
                  strokeWidth={2}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
