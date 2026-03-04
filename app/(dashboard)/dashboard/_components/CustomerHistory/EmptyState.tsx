'use client';

import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4 [&>svg]:w-8 [&>svg]:h-8">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{subtitle}</p>
    </div>
  );
}
