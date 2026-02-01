import React from "react";

interface SectionHeaderProps {
  title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 mb-6 mt-8">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    </div>
  );
}

