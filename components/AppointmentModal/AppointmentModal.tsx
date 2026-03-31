import React from "react";
import { X, CalendarIcon, Loader2, CalendarDays, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function toValidDate(value: Date | string | undefined | null): Date | undefined {
    if (value == null) return undefined;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
}
import { UseFormReturn } from "react-hook-form";
import { Calendar } from "../ui/calendar";
import { useSearchCustomer } from "@/hooks/customer/useSearchCustomer";
import { useSearchEmployee } from "@/hooks/employee/useSearchEmployee";
import { getCombinedAvailableSlots, getAllActiveAppointmentRooms } from "@/apis/appoinmentApis";
import toast from "react-hot-toast";

// Expand API slot times into every valid minute-level start time
function expandAvailableSlots(times: string[], intervalMinutes: number): string[] {
    if (!times || times.length === 0 || intervalMinutes <= 0) return [];

    const toMin = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };
    const toStr = (total: number) => {
        const h = Math.floor(total / 60);
        const m = total % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const sorted = [...times].map(toMin).sort((a, b) => a - b);

    // Group into contiguous blocks
    const blocks: { start: number; end: number }[] = [];
    let bStart = sorted[0];
    let bEnd = sorted[0] + intervalMinutes;

    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === bEnd) {
            bEnd = sorted[i] + intervalMinutes;
        } else {
            blocks.push({ start: bStart, end: bEnd });
            bStart = sorted[i];
            bEnd = sorted[i] + intervalMinutes;
        }
    }
    blocks.push({ start: bStart, end: bEnd });

    // For each block, valid start = every minute from block.start to block.end - intervalMinutes
    const result: string[] = [];
    for (const { start, end } of blocks) {
        for (let t = start; t <= end - intervalMinutes; t++) {
            if (t < 24 * 60) result.push(toStr(t));
        }
    }
    return result;
}

/** Minute steps offered for Dauer (filtered by booking rules). */
const DURATION_STEPS_MINUTES = [
    10, 15, 20, 30, 45, 60, 90, 120, 180, 210, 240, 300, 360, 420, 480, 540, 600,
];

function labelForDurationMinutes(m: number): string {
    if (m < 60) return `${m} Minuten`;
    if (m === 60) return "60 Minuten";
    const h = m / 60;
    if (Number.isInteger(h)) return `${h} Stunden`;
    const s = h.toFixed(1).replace(".", ",");
    return `${s} Stunden`;
}

export type DurationOption = { minutes: number; value: number; label: string };

/** Build Dauer options: min … max minutes (inclusive). `defaultSlotMinutes` from API = max length. */
export function buildAppointmentDurationOptions(
    maxMinutes: number | null | undefined,
    minMinutes: number | null | undefined
): DurationOption[] {
    const min =
        minMinutes != null && Number.isFinite(minMinutes) && minMinutes > 0
            ? Math.floor(minMinutes)
            : 10;
    const max =
        maxMinutes != null && Number.isFinite(maxMinutes) && maxMinutes > 0
            ? Math.floor(maxMinutes)
            : Infinity;

    const set = new Set<number>();
    for (const step of DURATION_STEPS_MINUTES) {
        if (step >= min && step <= max) set.add(step);
    }
    if (Number.isFinite(max) && max >= min) set.add(max);

    const sorted = [...set].sort((a, b) => a - b);
    if (sorted.length === 0 && Number.isFinite(max) && max > 0) {
        return [
            {
                minutes: max,
                value: max / 60,
                label: labelForDurationMinutes(max),
            },
        ];
    }
    return sorted.map((m) => ({
        minutes: m,
        value: m / 60,
        label: labelForDurationMinutes(m),
    }));
}

export function clampDurationToAllowedOptions(
    durationHours: number,
    options: DurationOption[]
): number {
    if (!options.length) return durationHours;
    const allowedM = options.map((o) => o.minutes).sort((a, b) => a - b);
    const m = Math.round(durationHours * 60);
    const notAbove = allowedM.filter((x) => x <= m);
    const pick = notAbove.length ? notAbove[notAbove.length - 1] : allowedM[0];
    return pick / 60;
}

interface Employee {
    employeeId: string;
    assignedTo: string;
}

interface AppointmentFormData {
    isClientEvent: boolean;
    kunde: string;
    uhrzeit: string;
    selectedEventDate: Date | undefined;
    termin: string;
    mitarbeiter: string;
    bemerk?: string;
    duration: number;
    customerId?: string;
    employeeId?: string;
    employees?: Employee[];
    reminder?: number | null;
    appomnentRoom?: string;
}

interface SubmittedAppointmentData {
    isClientEvent: boolean;
    kunde: string;
    uhrzeit: string;
    selectedEventDate: Date | undefined;
    termin: string;
    mitarbeiter: string;
    bemerk?: string;
    duration: number;
    customerId?: string;
    employeeId?: string;
    employees?: Employee[];
    reminder?: number | null;
    appomnentRoom?: string;
}

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    form: UseFormReturn<AppointmentFormData>;
    onSubmit: (data: SubmittedAppointmentData) => Promise<any> | void;
    title: string;
    buttonText: string;
    onDelete?: () => void;
    showDeleteButton?: boolean;
    /** From booking rules `defaultSlotMinutes` — longest selectable Dauer (minutes). */
    maxAppointmentDurationMinutes?: number | null;
    /** Optional API `minDurationMinutes` — shortest selectable Dauer (minutes). */
    minAppointmentDurationMinutes?: number | null;
}

export default function AppointmentModal({
    isOpen,
    onClose,
    form,
    onSubmit,
    title,
    buttonText,
    onDelete,
    showDeleteButton = false,
    maxAppointmentDurationMinutes = null,
    minAppointmentDurationMinutes = null,
}: AppointmentModalProps) {
    const [submitting, setSubmitting] = React.useState(false);
    const isClientEvent = form.watch('isClientEvent');
    const kundeContainerRef = React.useRef<HTMLDivElement | null>(null);
    const employeeContainerRef = React.useRef<HTMLDivElement | null>(null);
    const watchedEmployees = form.watch('employees');
    const employees = React.useMemo(() => watchedEmployees ?? [], [watchedEmployees]);
    const [currentEmployeeSearch, setCurrentEmployeeSearch] = React.useState('');

    const selectedEventDate = form.watch('selectedEventDate');
    const durationValue = form.watch('duration');

    // Step-by-step progressive unlock
    const datumEnabled   = employees.length > 0;
    const dauerEnabled   = datumEnabled && !!toValidDate(selectedEventDate);
    const uhrzeitEnabled = dauerEnabled && !!durationValue;

    // Available time slots from API
    const [availableSlots, setAvailableSlots] = React.useState<string[]>([]);
    const [slotsLoading, setSlotsLoading]     = React.useState(false);

    // Appointment rooms from API
    const [rooms, setRooms]           = React.useState<string[]>([]);
    const [roomsLoading, setRoomsLoading] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) return;
        setRoomsLoading(true);
        getAllActiveAppointmentRooms()
            .then((res) => {
                if (res?.data) {
                    setRooms((res.data as { name: string }[]).map(r => r.name).filter(Boolean));
                }
            })
            .catch(() => setRooms([]))
            .finally(() => setRoomsLoading(false));
    }, [isOpen]);

    React.useEffect(() => {
        if (!uhrzeitEnabled) {
            setAvailableSlots([]);
            return;
        }
        const validDate = toValidDate(selectedEventDate);
        if (!validDate || !durationValue || employees.length === 0) return;

        const dateStr        = format(validDate, 'yyyy-MM-dd');
        const employeeIds    = employees.map(e => e.employeeId);
        const intervalMinutes = Math.round(durationValue * 60);

        setSlotsLoading(true);
        getCombinedAvailableSlots(dateStr, employeeIds, intervalMinutes)
            .then((res) => {
                if (res?.times) {
                    setAvailableSlots(expandAvailableSlots(res.times as string[], intervalMinutes));
                } else {
                    setAvailableSlots([]);
                }
            })
            .catch(() => setAvailableSlots([]))
            .finally(() => setSlotsLoading(false));
    }, [uhrzeitEnabled, selectedEventDate, durationValue, employees]);

    const clientTerminOptions = React.useMemo(() => [
        { value: 'fussanalyse-laufanalyse', label: 'Fußanalyse / Laufanalyse' },
        { value: 'massnehmen', label: 'Maßnehmen' },
        { value: 'anprobe-abholung', label: 'Anprobe / Abholung' },
        { value: 'kontrolle-nachkontrolle', label: 'Kontrolle / Nachkontrolle' },
        { value: 'beratung-rezept-einloesung', label: 'Beratung / Rezept-Einlösung' },
        { value: 'hausbesuch', label: 'Hausbesuch' },
        { value: 'sonstiges', label: 'Sonstiges' },
    ], []);

    const otherTerminOptions = React.useMemo(() => [
        { value: 'teammeeting-fallbesprechung', label: 'Teammeeting / Fallbesprechung' },
        { value: 'fortbildung-schulung', label: 'Fortbildung / Schulung' },
        { value: 'verwaltung-dokumentation', label: 'Verwaltung / Dokumentation' },
        { value: 'interne-sprechstunde-besprechung', label: 'Interne Sprechstunde / Besprechung' },
        { value: 'externe-termine-kooperation', label: 'Externe Termine / Kooperation' },
    ], []);

    const durationOptions = React.useMemo(
        () =>
            buildAppointmentDurationOptions(
                maxAppointmentDurationMinutes,
                minAppointmentDurationMinutes
            ),
        [maxAppointmentDurationMinutes, minAppointmentDurationMinutes]
    );

    React.useLayoutEffect(() => {
        if (!isOpen || durationOptions.length === 0) return;
        const cur = form.getValues("duration");
        const clamped = clampDurationToAllowedOptions(cur, durationOptions);
        if (clamped !== cur) {
            form.setValue("duration", clamped, { shouldValidate: true, shouldDirty: true });
        }
    }, [isOpen, durationOptions, form]);

    const reminderOptions = [
        { value: null, label: 'Keine Erinnerung' },
        { value: 5, label: '5 Minuten vorher' },
        { value: 10, label: '10 Minuten vorher' },
        { value: 30, label: '30 Minuten vorher' },
        { value: 60, label: '60 Minuten vorher' },
        { value: 180, label: '3 Stunden vorher' },
        { value: 720, label: '12 Stunden vorher' },
        { value: 1440, label: '24 Stunden vorher' },
    ];

    // Generate time slots in 5-minute intervals from 0:00 to 23:55 (full day for calendar slot click)
    const timeSlots = React.useMemo(() => {
        const slots = [];
        const startHour = 0;
        const endHour = 23;

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 5) {
                if (hour === endHour && minute > 55) break;
                const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                slots.push({ value: timeString, label: timeString });
            }
        }
        return slots;
    }, []);

    React.useEffect(() => {
        const currentTermin = form.getValues('termin');
        const validValues = (isClientEvent ? clientTerminOptions : otherTerminOptions).map((o) => o.value);
        if (currentTermin && !validValues.includes(currentTermin)) {
            form.setValue('termin', '');
        }
    }, [isClientEvent, form, clientTerminOptions, otherTerminOptions]);

    const {
        searchName,
        setSearchName,
        handleNameChange,
        nameSuggestions,
        showNameSuggestions,
        suggestionLoading,
        handleSuggestionSelect,
        nameInputRef,
        setShowNameSuggestions,
        clearSearch,
    } = useSearchCustomer();

    // Sync searchName with form's kunde value when modal opens or form value changes
    React.useEffect(() => {
        if (isOpen && isClientEvent) {
            const kundeValue = form.getValues('kunde');
            if (kundeValue) {
                setSearchName(kundeValue);
            }
        } else if (!isClientEvent) {
            // Clear searchName when switching to non-client event
            setSearchName('');
        }
    }, [isOpen, isClientEvent, form, setSearchName]);

    // Watch form's kunde value and sync with searchName
    const kundeValue = form.watch('kunde');
    React.useEffect(() => {
        if (isOpen && isClientEvent && kundeValue && kundeValue !== searchName) {
            setSearchName(kundeValue);
        }
    }, [kundeValue, isOpen, isClientEvent, searchName, setSearchName]);

    const {
        searchText: employeeSearchText,
        setSearchText: setEmployeeSearchText,
        suggestions: employeeSuggestions,
        loading: employeeSuggestionLoading,
        showSuggestions: showEmployeeSuggestions,
        setShowSuggestions: setShowEmployeeSuggestions,
        handleChange: handleEmployeeChange,
        clearSearch: clearEmployeeSearch,
        inputRef: employeeInputRef,
    } = useSearchEmployee();

    const addEmployee = React.useCallback((employee: { id: string; employeeName: string }) => {
        const currentEmployees = form.getValues('employees') || [];
        // Check if employee already exists
        if (currentEmployees.some(emp => emp.employeeId === employee.id)) {
            return;
        }
        const newEmployee: Employee = {
            employeeId: employee.id,
            assignedTo: employee.employeeName
        };
        form.setValue('employees', [...currentEmployees, newEmployee]);
        setCurrentEmployeeSearch('');
        setEmployeeSearchText('');
        setShowEmployeeSuggestions(false);
    }, [form, setEmployeeSearchText, setShowEmployeeSuggestions]);

    const removeEmployee = React.useCallback((index: number) => {
        const currentEmployees = form.getValues('employees') || [];
        const updatedEmployees = currentEmployees.filter((_, i) => i !== index);
        form.setValue('employees', updatedEmployees);
    }, [form]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;
            if (kundeContainerRef.current && !kundeContainerRef.current.contains(target)) {
                setShowNameSuggestions(false);
            }
            if (employeeContainerRef.current && !employeeContainerRef.current.contains(target)) {
                setShowEmployeeSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [setShowNameSuggestions, setShowEmployeeSuggestions]);

    // Filter out already selected employees from suggestions
    const filteredEmployeeSuggestions = React.useMemo(() => {
        const selectedIds = (form.getValues('employees') || []).map(emp => emp.employeeId);
        return employeeSuggestions.filter(s => !selectedIds.includes(s.id));
    }, [employeeSuggestions, form]);

    if (!isOpen) return null;

    const handleFormSubmit = async (data: AppointmentFormData) => {
        const formattedData: SubmittedAppointmentData = {
            ...data,
            // send Date directly without ISO conversion
            selectedEventDate: data.selectedEventDate,
            employees: data.employees || []
        };
        try {
            setSubmitting(true);
            await Promise.resolve(onSubmit(formattedData));
        } finally {
            setSubmitting(false);
        }
    };

    const handleKundeSuggestionClick = (suggestion: any) => {
        handleSuggestionSelect(suggestion);
        if (suggestion?.name) {
            form.setValue('kunde', suggestion.name);
        }
        if (suggestion?.id) {
            form.setValue('customerId', suggestion.id);
        }
        setShowNameSuggestions(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 min-h-screen">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-100">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 z-10 rounded-t-2xl">
                    <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#61A07B]/10 flex items-center justify-center shrink-0">
                                <CalendarDays className="w-5 h-5 text-[#61A07B]" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="px-4 sm:px-6 py-5 space-y-5">
                        {/* Kundentyp segmented toggle */}
                        <FormField
                            control={form.control}
                            name="isClientEvent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kundentyp <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mt-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    field.onChange(true);
                                                    if (searchName) form.setValue('kunde', searchName);
                                                }}
                                                className={cn(
                                                    "flex-1 cursor-pointer rounded-lg text-sm font-medium transition-all duration-200 py-2 px-3",
                                                    field.value
                                                        ? "bg-white shadow-sm text-[#61A07B] border border-[#61A07B]/20"
                                                        : "bg-transparent text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                Kundentermin
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    field.onChange(false);
                                                    clearSearch();
                                                    form.setValue('kunde', '');
                                                    form.setValue('customerId', undefined);
                                                }}
                                                className={cn(
                                                    "flex-1 cursor-pointer rounded-lg text-sm font-medium transition-all duration-200 py-2 px-3",
                                                    !field.value
                                                        ? "bg-white shadow-sm text-[#61A07B] border border-[#61A07B]/20"
                                                        : "bg-transparent text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                Anderes
                                            </button>
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Row 1: Kunde + Grund */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            {isClientEvent && (
                                <FormField
                                    control={form.control}
                                    name="kunde"
                                    render={({ field }) => {
                                        const kundeError = form.formState.errors.kunde;
                                        return (
                                        <FormItem className="min-w-0">
                                            <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kunde <span className="text-red-500">*</span></FormLabel>
                                            <div className="relative mt-1" ref={kundeContainerRef}>
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                <Input
                                                    ref={nameInputRef}
                                                    placeholder="Kunde suchen..."
                                                    value={searchName}
                                                    onChange={(e) => {
                                                        handleNameChange(e.target.value);
                                                        setSearchName(e.target.value);
                                                        form.setValue('kunde', e.target.value);
                                                        form.setValue('customerId', undefined);
                                                    }}
                                                    className={cn("w-full pl-9 rounded-xl focus:border-[#61A07B] focus:ring-[#61A07B]/20", kundeError ? "border-red-500" : "border-gray-200")}
                                                />
                                                {suggestionLoading && (
                                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                                                )}
                                                {showNameSuggestions && nameSuggestions.length > 0 && (
                                                    <div className="absolute z-50 mt-1.5 w-full bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden py-1">
                                                        {nameSuggestions.map((s, i) => {
                                                            const meta = [s.phone, s.email].filter(Boolean).join(" · ");
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={s.id}
                                                                    className="w-full text-left px-3 py-2 hover:bg-white/10 cursor-pointer flex items-baseline gap-3 transition-colors"
                                                                    onClick={() => handleKundeSuggestionClick(s)}
                                                                >
                                                                    <span className="tabular-nums font-extrabold text-sm text-white/50 w-7 text-right shrink-0">
                                                                        {i + 1}
                                                                    </span>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="font-bold text-sm uppercase tracking-tight text-white truncate">
                                                                            {s.name}
                                                                        </div>
                                                                        {meta ? (
                                                                            <div className="text-[11px] text-white/45 truncate mt-0.5">
                                                                                {meta}
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-red-500 text-xs mt-1 min-h-[16px] ${kundeError ? 'visible' : 'invisible'}`}>
                                                {kundeError?.message}
                                            </p>
                                        </FormItem>
                                        );
                                    }}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="termin"
                                render={({ field, fieldState }) => (
                                    <FormItem className={cn("min-w-0", !isClientEvent && "sm:col-span-2")}>
                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Grund <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={cn("cursor-pointer w-full rounded-xl mt-1", fieldState.error ? "border-red-500" : "border-gray-200")}>
                                                    <SelectValue placeholder="Termingrund wählen" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl">
                                                {(isClientEvent ? clientTerminOptions : otherTerminOptions).map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer rounded-lg">
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className={`text-red-500 text-xs mt-1 min-h-[16px] ${form.formState.errors.termin ? 'visible' : 'invisible'}`}>
                                            {form.formState.errors.termin?.message}
                                        </p>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Row 2: Mitarbeiter + Datum */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            <FormField
                                control={form.control}
                                name="employees"
                                render={({ field, fieldState }) => (
                                    <FormItem className="min-w-0">
                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mitarbeiter <span className="text-red-500">*</span></FormLabel>
                                        <div
                                            ref={employeeContainerRef}
                                            className={cn(
                                                "relative mt-1 border rounded-xl bg-white transition-all duration-150 cursor-text",
                                                showEmployeeSuggestions && filteredEmployeeSuggestions.length > 0
                                                    ? "border-[#61A07B] ring-2 ring-[#61A07B]/15"
                                                    : fieldState.error
                                                        ? "border-red-500"
                                                        : "border-gray-200 hover:border-gray-300"
                                            )}
                                        >
                                            <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px] items-center">
                                                {employees.map((emp, index) => (
                                                    <div
                                                        key={`${emp.employeeId}-${index}`}
                                                        className="flex items-center gap-1.5 bg-[#61A07B]/10 border border-[#61A07B]/25 text-[#3d7a5a] px-2 py-1 rounded-lg text-sm font-medium shrink-0"
                                                    >
                                                        <div className="w-5 h-5 rounded-full bg-[#61A07B] text-white text-[10px] flex items-center justify-center shrink-0 font-bold">
                                                            {emp.assignedTo.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="truncate max-w-[90px]">{emp.assignedTo}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeEmployee(index)}
                                                            className="text-[#61A07B]/60 hover:text-red-500 cursor-pointer shrink-0 transition-colors ml-0.5"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <input
                                                    ref={employeeInputRef}
                                                    placeholder={employees.length === 0 ? "Mitarbeiter suchen..." : "Weitere..."}
                                                    value={currentEmployeeSearch || employeeSearchText || ''}
                                                    onChange={(e) => {
                                                        handleEmployeeChange(e.target.value);
                                                        setEmployeeSearchText(e.target.value);
                                                        setCurrentEmployeeSearch(e.target.value);
                                                    }}
                                                    onFocus={() => {
                                                        setShowEmployeeSuggestions(true);
                                                        if (!(employeeSearchText || currentEmployeeSearch)) {
                                                            handleEmployeeChange('');
                                                        }
                                                    }}
                                                    className="flex-1 min-w-[100px] text-sm outline-none bg-transparent placeholder-gray-400 py-0.5 px-1"
                                                />
                                                {employeeSuggestionLoading && (
                                                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />
                                                )}
                                            </div>
                                            {showEmployeeSuggestions && filteredEmployeeSuggestions.length > 0 && (
                                                <div className="absolute z-50 top-full left-0 mt-1.5 w-full bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl max-h-52 overflow-y-auto py-1">
                                                    {filteredEmployeeSuggestions.map((s, i) => (
                                                        <button
                                                            type="button"
                                                            key={s.id}
                                                            className="w-full text-left px-3 py-2 hover:bg-white/10 cursor-pointer flex items-baseline gap-3 transition-colors"
                                                            onClick={() => addEmployee(s)}
                                                        >
                                                            <span className="tabular-nums font-extrabold text-sm text-white/50 w-7 text-right shrink-0">
                                                                {i + 1}
                                                            </span>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="font-bold text-sm uppercase tracking-tight text-white truncate">
                                                                    {s.employeeName}
                                                                </div>
                                                                {s.email ? (
                                                                    <div className="text-[11px] text-white/45 truncate mt-0.5">
                                                                        {s.email}
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <p className={`text-red-500 text-xs mt-1 min-h-[16px] ${form.formState.errors.employees ? 'visible' : 'invisible'}`}>
                                            {form.formState.errors.employees?.message as string}
                                        </p>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="selectedEventDate"
                                render={({ field }) => {
                                    const datumError = form.formState.errors.selectedEventDate;
                                    return (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Datum <span className="text-red-400">*</span>
                                        </FormLabel>
                                        <div className={cn(!datumEnabled && "pointer-events-none select-none")}>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            disabled={!datumEnabled}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal rounded-xl mt-1 transition-colors",
                                                                datumEnabled
                                                                    ? cn("cursor-pointer bg-white text-gray-700", datumError ? "border-red-500" : "border-gray-200")
                                                                    : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                                                            )}
                                                        >
                                                            {toValidDate(field.value) ? (
                                                                format(toValidDate(field.value)!, "dd.MM.yyyy", { locale: de })
                                                            ) : (
                                                                <span>Datum auswählen</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                                    <Calendar
                                                        key={
                                                            toValidDate(field.value)?.getTime() ?? 'datum'
                                                        }
                                                        mode="single"
                                                        selected={toValidDate(field.value)}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < new Date(new Date().setHours(0, 0, 0, 0))
                                                        }
                                                        locale={de}
                                                        weekStartsOn={1}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <p className={`text-red-500 text-xs mt-1 min-h-[16px] ${datumError ? 'visible' : 'invisible'}`}>
                                            {datumError?.message as string}
                                        </p>
                                    </FormItem>
                                    );
                                }}
                            />
                        </div>

                        {/* Row 3: Dauer + Uhrzeit */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => {
                                    const dauerError = form.formState.errors.duration;
                                    return (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Dauer <span className="text-red-400">*</span>
                                        </FormLabel>
                                        <div className={cn(!dauerEnabled && "pointer-events-none select-none")}>
                                            <Select
                                                disabled={!dauerEnabled || durationOptions.length === 0}
                                                onValueChange={(value) =>
                                                    field.onChange(parseInt(value, 10) / 60)
                                                }
                                                value={(() => {
                                                    if (durationOptions.length === 0) return undefined;
                                                    if (!Number.isFinite(field.value)) return undefined;
                                                    const m = Math.round(field.value * 60);
                                                    const match = durationOptions.some((o) => o.minutes === m);
                                                    return String(match ? m : durationOptions[0]!.minutes);
                                                })()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className={cn(
                                                        "w-full rounded-xl mt-1 transition-colors",
                                                        dauerEnabled
                                                            ? cn("cursor-pointer bg-white text-gray-700", dauerError ? "border-red-500" : "border-gray-200")
                                                            : "cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200"
                                                    )}>
                                                        <SelectValue placeholder="Dauer wählen" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    {durationOptions.map((opt) => (
                                                        <SelectItem
                                                            key={opt.minutes}
                                                            value={String(opt.minutes)}
                                                            className="cursor-pointer rounded-lg"
                                                        >
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {(maxAppointmentDurationMinutes != null &&
                                            Number.isFinite(maxAppointmentDurationMinutes) &&
                                            maxAppointmentDurationMinutes > 0) ||
                                        (minAppointmentDurationMinutes != null &&
                                            Number.isFinite(minAppointmentDurationMinutes) &&
                                            minAppointmentDurationMinutes > 0) ? (
                                            <div className="mt-1 min-h-[28px] space-y-0.5">
                                                {maxAppointmentDurationMinutes != null &&
                                                    Number.isFinite(maxAppointmentDurationMinutes) &&
                                                    maxAppointmentDurationMinutes > 0 && (
                                                        <p className="text-[11px] text-gray-500">
                                                            Max. {maxAppointmentDurationMinutes} Min. pro Termin (Buchungsregeln).
                                                        </p>
                                                    )}
                                                {minAppointmentDurationMinutes != null &&
                                                    Number.isFinite(minAppointmentDurationMinutes) &&
                                                    minAppointmentDurationMinutes > 0 && (
                                                        <p className="text-[11px] text-gray-500">
                                                            Mind. {minAppointmentDurationMinutes} Min. pro Termin.
                                                        </p>
                                                    )}
                                            </div>
                                        ) : null}
                                        <p className={`text-red-500 text-xs mt-1 min-h-[16px] ${dauerError ? 'visible' : 'invisible'}`}>
                                            {dauerError?.message}
                                        </p>
                                    </FormItem>
                                    );
                                }}
                            />

                            <FormField
                                control={form.control}
                                name="uhrzeit"
                                render={({ field }) => {
                                    const uhrzeitError = form.formState.errors.uhrzeit;
                                    return (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                            Uhrzeit <span className="text-red-400">*</span>
                                            {slotsLoading && <Loader2 className="w-3 h-3 animate-spin text-[#61A07B]" />}
                                        </FormLabel>
                                        <div className={cn(!uhrzeitEnabled && "pointer-events-none select-none")}>
                                            {uhrzeitEnabled && !slotsLoading && availableSlots.length === 0 ? (
                                                <div className="mt-1 h-10 flex items-center px-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 text-sm">
                                                    Keine verfügbaren Zeiten gefunden
                                                </div>
                                            ) : (
                                                <Select
                                                    disabled={!uhrzeitEnabled || slotsLoading}
                                                    onValueChange={field.onChange}
                                                    value={field.value || ''}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className={cn(
                                                            "w-full rounded-xl mt-1 transition-colors",
                                                            uhrzeitEnabled && !slotsLoading
                                                                ? cn("cursor-pointer bg-white text-gray-700", uhrzeitError ? "border-red-500" : "border-gray-200")
                                                                : "cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200"
                                                        )}>
                                                            <SelectValue placeholder={
                                                                slotsLoading ? "Lade verfügbare Zeiten..." : "Uhrzeit wählen"
                                                            } />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl max-h-64">
                                                        {availableSlots.length > 0 ? (
                                                            (() => {
                                                                // Group by hour for readability
                                                                const byHour: Record<string, string[]> = {};
                                                                availableSlots.forEach(t => {
                                                                    const hour = t.split(':')[0];
                                                                    if (!byHour[hour]) byHour[hour] = [];
                                                                    byHour[hour].push(t);
                                                                });
                                                                return Object.entries(byHour).map(([hour, slots]) => (
                                                                    <React.Fragment key={hour}>
                                                                        <div className="px-2 pt-2 pb-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                                                                            {hour}:00 Uhr
                                                                        </div>
                                                                        {slots.map(t => (
                                                                            <SelectItem key={t} value={t} className="cursor-pointer rounded-lg pl-4">
                                                                                {t}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </React.Fragment>
                                                                ));
                                                            })()
                                                        ) : (
                                                            <div className="px-3 py-4 text-sm text-gray-400 text-center">
                                                                {slotsLoading ? "Lädt..." : "Keine Zeiten verfügbar"}
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                        <p className={`text-red-500 text-xs mt-1 min-h-[16px] ${uhrzeitError ? 'visible' : 'invisible'}`}>
                                            {uhrzeitError?.message}
                                        </p>
                                    </FormItem>
                                    );
                                }}
                            />
                        </div>

                        {/* Row 4: Raum + Erinnerung */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="appomnentRoom"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                            Raum (optional)
                                            {roomsLoading && <Loader2 className="w-3 h-3 animate-spin text-[#61A07B]" />}
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value || ''}
                                            disabled={roomsLoading}
                                        >
                                            <SelectTrigger className={cn(
                                                "w-full rounded-xl border-gray-200 mt-1",
                                                roomsLoading ? "cursor-not-allowed bg-gray-50" : "cursor-pointer"
                                            )}>
                                                <SelectValue placeholder={roomsLoading ? "Lädt..." : "Raum auswählen"} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {rooms.length > 0 ? (
                                                    rooms.map((name) => (
                                                        <SelectItem key={name} value={name} className="cursor-pointer rounded-lg">
                                                            {name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    !roomsLoading && (
                                                        <div className="px-3 py-3 text-sm text-gray-400 text-center">
                                                            Keine Räume verfügbar
                                                        </div>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reminder"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Erinnerung (optional)</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value === 'null' ? null : parseInt(value))}
                                            value={field.value === null || field.value === undefined ? 'null' : field.value.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="cursor-pointer w-full rounded-xl border-gray-200 mt-1">
                                                    <SelectValue placeholder="Erinnerung wählen" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl">
                                                {reminderOptions.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value === null ? 'null' : opt.value.toString()}
                                                        value={opt.value === null ? 'null' : opt.value.toString()}
                                                        className="cursor-pointer rounded-lg"
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="bemerk"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notiz (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Notizen zum Termin..."
                                            className="resize-none h-24 rounded-xl border-gray-200 mt-1 focus:border-[#61A07B] focus:ring-[#61A07B]/20"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-100">
                            {showDeleteButton && onDelete && (
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onDelete();
                                    }}
                                    className="bg-red-50 cursor-pointer hover:bg-red-100 text-red-600 border border-red-200 rounded-xl w-full sm:w-auto font-medium"
                                    variant="ghost"
                                >
                                    Löschen
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-700 rounded-xl w-full sm:w-auto font-medium"
                                variant="ghost"
                            >
                                Abbrechen
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#61A07B] cursor-pointer hover:bg-[#528c68] text-white rounded-xl disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto font-medium px-6"
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {submitting ? 'Bitte warten...' : buttonText}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
} 