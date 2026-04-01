import React from "react";
import { X, CalendarIcon, Loader2, CalendarDays, Search, Clock } from "lucide-react";
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
import { getAllActiveAppointmentRooms } from "@/apis/appoinmentApis";
import toast from "react-hot-toast";

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function TimePicker({
    value,
    onChange,
    hasError,
}: {
    value: string;
    onChange: (v: string) => void;
    hasError?: boolean;
}) {
    const [open, setOpen] = React.useState(false);
    const [h, m] = (value || "00:00").split(":").map((s) => s.padStart(2, "0"));
    const selH = h || "00";
    const selM = m || "00";

    const hourRef   = React.useRef<HTMLDivElement>(null);
    const minuteRef = React.useRef<HTMLDivElement>(null);

    const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, val: string, items: string[]) => {
        const idx = items.indexOf(val);
        if (idx < 0 || !ref.current) return;
        const child = ref.current.children[idx] as HTMLElement | undefined;
        if (child) {
            ref.current.scrollTo({ top: child.offsetTop - 8, behavior: "smooth" });
        }
    };

    React.useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => {
            scrollTo(hourRef, selH, HOURS);
            scrollTo(minuteRef, selM, MINUTES);
        }, 60);
        return () => clearTimeout(t);
    }, [open, selH, selM]);

    const commit = (nh: string, nm: string) => onChange(`${nh}:${nm}`);

    const triggerRef = React.useRef<HTMLButtonElement>(null);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                <button
                    ref={triggerRef}
                    type="button"
                    className={cn(
                        "flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-colors mt-1",
                        "hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#61A07B]/30",
                        hasError ? "border-red-500" : "border-gray-200",
                        open && "border-[#61A07B] ring-2 ring-[#61A07B]/20"
                    )}
                >
                    <span className={value ? "text-gray-700" : "text-gray-400"}>
                        {value || "Uhrzeit wählen"}
                    </span>
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[160px] p-0 rounded-xl border border-gray-200 shadow-lg overflow-hidden"
                align="start"
                sideOffset={6}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => {
                    if (triggerRef.current?.contains(e.target as Node)) return;
                    setOpen(false);
                }}
                onInteractOutside={(e) => {
                    if (triggerRef.current?.contains(e.target as Node)) return;
                    e.preventDefault();
                    setOpen(false);
                }}
            >
                {/* Header */}
                <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100 bg-[#EBF3EE]">
                    <div className="py-2 text-center text-sm font-semibold text-[#3d7a5a]">
                        {selH}
                    </div>
                    <div className="py-2 text-center text-sm font-semibold text-[#3d7a5a]">
                        {selM}
                    </div>
                </div>
                {/* Scroll columns */}
                <div className="grid grid-cols-2 divide-x divide-gray-100">
                    <div
                        ref={hourRef}
                        className="h-52 overflow-y-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {HOURS.map((hr) => (
                            <button
                                key={hr}
                                type="button"
                                onClick={() => { commit(hr, selM); scrollTo(hourRef, hr, HOURS); }}
                                className={cn(
                                    "w-full py-1.5 text-center text-sm transition-colors",
                                    hr === selH
                                        ? "bg-[#EBF3EE] font-semibold text-[#3d7a5a]"
                                        : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                {hr}
                            </button>
                        ))}
                    </div>
                    <div
                        ref={minuteRef}
                        className="h-52 overflow-y-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {MINUTES.map((mn) => (
                            <button
                                key={mn}
                                type="button"
                                onClick={() => { commit(selH, mn); scrollTo(minuteRef, mn, MINUTES); }}
                                className={cn(
                                    "w-full py-1.5 text-center text-sm transition-colors",
                                    mn === selM
                                        ? "bg-[#EBF3EE] font-semibold text-[#3d7a5a]"
                                        : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                {mn}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Done button */}
                <div className="border-t border-gray-100 p-2">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="w-full rounded-lg bg-[#61A07B] py-1.5 text-xs font-semibold text-white hover:bg-[#4f8a69] transition-colors"
                    >
                        OK
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
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
    allowOverlap?: boolean;
}

type AppointmentSubmitResult = {
    success?: boolean;
    message?: string;
    employeeOverlap?: boolean;
    roomOverlap?: boolean;
    data?: any;
}

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    form: UseFormReturn<AppointmentFormData>;
    onSubmit: (data: SubmittedAppointmentData) => Promise<AppointmentSubmitResult | boolean | void> | AppointmentSubmitResult | boolean | void;
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
    const [overlapConfirmOpen, setOverlapConfirmOpen] = React.useState(false);
    const [overlapMessage, setOverlapMessage] = React.useState('');
    const [pendingOverlapData, setPendingOverlapData] = React.useState<SubmittedAppointmentData | null>(null);
    const [confirmingOverlap, setConfirmingOverlap] = React.useState(false);
    const isClientEvent = form.watch('isClientEvent');
    const kundeContainerRef = React.useRef<HTMLDivElement | null>(null);
    const employeeContainerRef = React.useRef<HTMLDivElement | null>(null);
    const watchedEmployees = form.watch('employees');
    const employees = React.useMemo(() => watchedEmployees ?? [], [watchedEmployees]);
    const [currentEmployeeSearch, setCurrentEmployeeSearch] = React.useState('');
    const [datumOpen, setDatumOpen] = React.useState(false);

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

    // Auto-set API default duration when modal opens and field is empty
    React.useEffect(() => {
        if (!isOpen) return;
        if (
            maxAppointmentDurationMinutes != null &&
            Number.isFinite(maxAppointmentDurationMinutes) &&
            maxAppointmentDurationMinutes > 0
        ) {
            const cur = form.getValues("duration");
            if (!cur || !Number.isFinite(cur) || cur <= 0) {
                form.setValue("duration", maxAppointmentDurationMinutes / 60, {
                    shouldValidate: false,
                    shouldDirty: false,
                });
            }
        }
    }, [isOpen, maxAppointmentDurationMinutes, form]);

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

    const isOverlapResponse = (result: unknown): result is AppointmentSubmitResult => {
        if (!result || typeof result !== 'object') return false;
        const r = result as AppointmentSubmitResult;
        return r.success === false && (r.employeeOverlap === true || r.roomOverlap === true);
    };

    const handleFormSubmit = async (data: AppointmentFormData) => {
        const formattedData: SubmittedAppointmentData = {
            ...data,
            // send Date directly without ISO conversion
            selectedEventDate: data.selectedEventDate,
            employees: data.employees || []
        };
        try {
            setSubmitting(true);
            const result = await Promise.resolve(onSubmit(formattedData));
            if (isOverlapResponse(result)) {
                setPendingOverlapData(formattedData);
                setOverlapMessage(result.message || 'Es gibt eine Überschneidung. Termin trotzdem erstellen?');
                setOverlapConfirmOpen(true);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmCreateWithOverlap = async () => {
        if (!pendingOverlapData) return;
        try {
            setConfirmingOverlap(true);
            setOverlapConfirmOpen(false);
            await Promise.resolve(onSubmit({ ...pendingOverlapData, allowOverlap: true }));
        } finally {
            setConfirmingOverlap(false);
            setPendingOverlapData(null);
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
                                        <Popover open={datumOpen} onOpenChange={setDatumOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal rounded-xl mt-1 cursor-pointer bg-white text-gray-700 transition-colors",
                                                            datumError ? "border-red-500" : "border-gray-200"
                                                        )}
                                                    >
                                                        {toValidDate(field.value) ? (
                                                            format(toValidDate(field.value)!, "dd.MM.yyyy", { locale: de })
                                                        ) : (
                                                            <span className="text-gray-400">Datum auswählen</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0 rounded-xl"
                                                align="start"
                                                onOpenAutoFocus={(e) => e.preventDefault()}
                                                onCloseAutoFocus={(e) => e.preventDefault()}
                                                onInteractOutside={(e) => {
                                                    e.preventDefault();
                                                    setDatumOpen(false);
                                                }}
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={toValidDate(field.value)}
                                                    onSelect={(date) => {
                                                        field.onChange(date);
                                                        setDatumOpen(false);
                                                    }}
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                                    }
                                                    locale={de}
                                                    weekStartsOn={1}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
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
                                    const displayMinutes =
                                        Number.isFinite(field.value) && field.value > 0
                                            ? String(Math.round(field.value * 60))
                                            : '';
                                    return (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Dauer <span className="text-red-400">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative mt-1">
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder={
                                                        maxAppointmentDurationMinutes != null &&
                                                        Number.isFinite(maxAppointmentDurationMinutes) &&
                                                        maxAppointmentDurationMinutes > 0
                                                            ? String(maxAppointmentDurationMinutes)
                                                            : "z.B. 30"
                                                    }
                                                    value={displayMinutes}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        if (raw === '') {
                                                            field.onChange(undefined);
                                                            return;
                                                        }
                                                        const mins = parseInt(raw, 10);
                                                        if (!isNaN(mins) && mins > 0) {
                                                            field.onChange(mins / 60);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-full rounded-xl pr-12 bg-white text-gray-700 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                                                        dauerError ? "border-red-500" : "border-gray-200"
                                                    )}
                                                />
                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none">
                                                    Min.
                                                </span>
                                            </div>
                                        </FormControl>
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
                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Uhrzeit <span className="text-red-400">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <TimePicker
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                hasError={!!uhrzeitError}
                                            />
                                        </FormControl>
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
            {overlapConfirmOpen && (
                <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 p-5">
                        <h4 className="text-base font-semibold text-gray-900 mb-2">Überschneidung erkannt</h4>
                        <p className="text-sm text-gray-600 mb-5">{overlapMessage}</p>
                        <p className="text-sm font-medium text-gray-800 mb-5">Trotzdem mit Überschneidung erstellen?</p>
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setOverlapConfirmOpen(false);
                                    setPendingOverlapData(null);
                                }}
                                disabled={confirmingOverlap}
                            >
                                Nein
                            </Button>
                            <Button
                                type="button"
                                className="bg-[#61A07B] hover:bg-[#4f8a69] text-white"
                                onClick={handleConfirmCreateWithOverlap}
                                disabled={confirmingOverlap}
                            >
                                {confirmingOverlap ? 'Erstelle…' : 'Ja, erstellen'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 