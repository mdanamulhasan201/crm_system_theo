<<<<<<< HEAD
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import { DateRangeFilter, OrderStatusFilter } from '@/components/LastScans/Tables/types';
=======
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import {
  DateRangeFilter,
  OrderStatusFilter,
} from "@/components/LastScans/Tables/types";
>>>>>>> 70f38c7 (updates)

type Option<T> = { label: string; value: T };

interface LastScanFiltersProps {
<<<<<<< HEAD
    dateRange: DateRangeFilter;
    yearFilter: string;
    monthFilter: string;
    locationFilter: string;
    insuranceFilter: string;
    orderFilter: OrderStatusFilter;
    periodOptions: Option<DateRangeFilter>[];
    yearOptions: Option<string>[];
    monthOptions: Option<string>[];
    locationOptions: Option<string>[];
    insuranceOptions: Option<string>[];
    orderOptions: Option<OrderStatusFilter>[];
    onDateRangeChange: (value: DateRangeFilter) => void;
    onYearChange: (value: string) => void;
    onMonthChange: (value: string) => void;
    onLocationChange: (value: string) => void;
    onInsuranceChange: (value: string) => void;
    onOrderChange: (value: OrderStatusFilter) => void;
    onReset: () => void;
}

export function LastScanFilters({
    dateRange,
    yearFilter,
    monthFilter,
    locationFilter,
    insuranceFilter,
    orderFilter,
    periodOptions,
    yearOptions,
    monthOptions,
    locationOptions,
    insuranceOptions,
    orderOptions,
    onDateRangeChange,
    onYearChange,
    onMonthChange,
    onLocationChange,
    onInsuranceChange,
    onOrderChange,
    onReset,
}: LastScanFiltersProps) {
    return (
        <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <FilterSelect
                label="Zeitraum"
                value={dateRange}
                onValueChange={(val) => onDateRangeChange(val as DateRangeFilter)}
                options={periodOptions}
            />
            <FilterSelect
                label="Jahr"
                value={yearFilter}
                onValueChange={(val) => onYearChange(val as string)}
                options={yearOptions}
            />
            <FilterSelect
                label="Monat"
                value={monthFilter}
                onValueChange={(val) => onMonthChange(val as string)}
                options={monthOptions}
            />
            <FilterSelect
                label="Standort"
                value={locationFilter}
                onValueChange={(val) => onLocationChange(val as string)}
                options={locationOptions}
            />
            <FilterSelect
                label="Kostenträger"
                value={insuranceFilter}
                onValueChange={(val) => onInsuranceChange(val as string)}
                options={insuranceOptions}
            />
            <FilterSelect
                label="Auftragsstatus"
                value={orderFilter}
                onValueChange={(val) => onOrderChange(val as OrderStatusFilter)}
                options={orderOptions}
            />
            <div className="flex md:col-span-2 xl:col-span-3 2xl:col-span-6 justify-start">
                <Button
                    variant="ghost"
                    className="mt-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-11 px-4 cursor-pointer"
                    onClick={onReset}
                >
                    Filter zurücksetzen
                </Button>
            </div>
        </div>
    );
}

interface FilterSelectProps<T extends string> {
    label: string;
    value: T;
    onValueChange: (value: T) => void;
    options: Option<T>[];
}

function FilterSelect<T extends string>({ label, value, onValueChange, options }: FilterSelectProps<T>) {
    return (
        <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">{label}</span>
            <Select value={value} onValueChange={(val) => onValueChange(val as T)}>
                <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-sm px-4 justify-start">
                    <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

=======
  dateRange: DateRangeFilter;
  yearFilter: string;
  monthFilter: string;
  locationFilter: string;
  insuranceFilter: string;
  orderFilter: OrderStatusFilter;
  periodOptions: Option<DateRangeFilter>[];
  yearOptions: Option<string>[];
  monthOptions: Option<string>[];
  locationOptions: Option<string>[];
  insuranceOptions: Option<string>[];
  orderOptions: Option<OrderStatusFilter>[];
  onDateRangeChange: (value: DateRangeFilter) => void;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onInsuranceChange: (value: string) => void;
  onOrderChange: (value: OrderStatusFilter) => void;
  onReset: () => void;
}

export function LastScanFilters({
  dateRange,
  yearFilter,
  monthFilter,
  locationFilter,
  insuranceFilter,
  orderFilter,
  periodOptions,
  yearOptions,
  monthOptions,
  locationOptions,
  insuranceOptions,
  orderOptions,
  onDateRangeChange,
  onYearChange,
  onMonthChange,
  onLocationChange,
  onInsuranceChange,
  onOrderChange,
  onReset,
}: LastScanFiltersProps) {
  return (
    <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <FilterSelect
        label="Zeitraum"
        value={dateRange}
        onValueChange={(val) => onDateRangeChange(val as DateRangeFilter)}
        options={periodOptions}
      />
      <FilterSelect
        label="Jahr"
        value={yearFilter}
        onValueChange={(val) => onYearChange(val as string)}
        options={yearOptions}
      />
      <FilterSelect
        label="Monat"
        value={monthFilter}
        onValueChange={(val) => onMonthChange(val as string)}
        options={monthOptions}
      />
      <FilterSelect
        label="Standort"
        value={locationFilter}
        onValueChange={(val) => onLocationChange(val as string)}
        options={locationOptions}
      />
      <FilterSelect
        label="Kostenträger"
        value={insuranceFilter}
        onValueChange={(val) => onInsuranceChange(val as string)}
        options={insuranceOptions}
      />
      <FilterSelect
        label="Auftragsstatus"
        value={orderFilter}
        onValueChange={(val) => onOrderChange(val as OrderStatusFilter)}
        options={orderOptions}
      />
      <div className="flex md:col-span-2 xl:col-span-3 2xl:col-span-6 justify-start">
        <Button
          variant="ghost"
          className="mt-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md h-11 px-4 cursor-pointer"
          onClick={onReset}
        >
          Filter zurücksetzen
        </Button>
      </div>
    </div>
  );
}

interface FilterSelectProps<T extends string> {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: Option<T>[];
}

function FilterSelect<T extends string>({
  label,
  value,
  onValueChange,
  options,
}: FilterSelectProps<T>) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </span>
      <Select value={value} onValueChange={(val) => onValueChange(val as T)}>
        <SelectTrigger className="h-11 rounded-md bg-white border-gray-200 shadow-sm px-4 justify-start">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
>>>>>>> 70f38c7 (updates)
