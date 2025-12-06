'use client';

import React from 'react';

interface CardProps {
  title: string;
  value: string;
}

export default function Card({ title, value }: CardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm  flex flex-col justify-center overflow-hidden">
      <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2 break-words">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-emerald-500 break-words">{value}</p>
    </div>
  );
}
