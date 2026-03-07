"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type SchedulingTab = "staff-availability" | "rooms" | "booking-rules";

const TABS: { value: SchedulingTab; label: string }[] = [
  { value: "staff-availability", label: "Mitarbeiter-Verfügbarkeit" },
  { value: "rooms", label: "Räume" },
  { value: "booking-rules", label: "Buchungsregeln" },
];

interface TabConfigProps {
  value: SchedulingTab;
  onValueChange: (value: SchedulingTab) => void;
  children?: React.ReactNode;
}

export default function TabConfig({ value, onValueChange, children }: TabConfigProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as SchedulingTab)} className="w-full">
      <TabsList className="inline-flex h-auto w-full gap-8 rounded-none border-0 border-t border-b border-gray-200 bg-transparent p-0 pt-3 pb-0 shadow-none">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "relative cursor-pointer rounded-none border-0 bg-transparent px-0 pb-3 pt-0 text-sm shadow-none outline-none ring-0 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0",
              "data-[state=inactive]:font-normal data-[state=inactive]:text-gray-500 data-[state=inactive]:font-medium data-[state=inactive]:hover:text-gray-600",
              "data-[state=active]:font-semibold data-[state=active]:text-gray-900 data-[state=active]:shadow-none",
              "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-gray-700 data-[state=active]:after:content-['']"
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
