import React from "react";
import { X, CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { UseFormReturn } from "react-hook-form";
import { Calendar } from "../ui/calendar";
import { useSearchCustomer } from "@/hooks/customer/useSearchCustomer";
import { useSearchEmployee } from "@/hooks/employee/useSearchEmployee";
import toast from "react-hot-toast";

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
}

export default function AppointmentModal({
    isOpen,
    onClose,
    form,
    onSubmit,
    title,
    buttonText,
    onDelete,
    showDeleteButton = false
}: AppointmentModalProps) {
    const [submitting, setSubmitting] = React.useState(false);
    const isClientEvent = form.watch('isClientEvent');
    const kundeContainerRef = React.useRef<HTMLDivElement | null>(null);
    const employeeContainerRef = React.useRef<HTMLDivElement | null>(null);
    const employees = form.watch('employees') || [];
    const [currentEmployeeSearch, setCurrentEmployeeSearch] = React.useState('');

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

    const durationOptions = [
        { value: 0.17, label: '10 Minuten' }, // 10/60 = 0.17 hours
        { value: 0.5, label: '30 Minuten' },  // 30/60 = 0.5 hours
        { value: 1, label: '60 Minuten' },    // 1 hour
        { value: 2, label: '2 Stunden' },     // 2 hours
        { value: 3, label: '3 Stunden' },     // 3 hours
        { value: 3.5, label: '3.5 Stunden' }, // 3.5 hours
        { value: 4, label: '4 Stunden' },      // 4 hours
        { value: 5, label: '5 Stunden' },      // 5 hours
    ];

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

    // Generate time slots in 5-minute intervals from 5:00 to 21:00
    const timeSlots = React.useMemo(() => {
        const slots = [];
        const startHour = 5;
        const endHour = 21;
        
        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 5) {
                // Skip times after 21:00
                if (hour === endHour && minute > 0) break;
                
                const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                slots.push({
                    value: timeString,
                    label: timeString
                });
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
        // Validate that at least one employee is selected
        if (!data.employees || data.employees.length === 0) {
            toast.error('Bitte wählen Sie mindestens einen Mitarbeiter aus');
            return;
        }
        
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
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="p-4 sm:p-6 space-y-4">
                        <FormField
                            control={form.control}
                            name="isClientEvent"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                    <FormLabel>Kundentyp <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    field.onChange(true);
                                                    // Switching to Kunde: prefill if we have a searched name
                                                    if (searchName) form.setValue('kunde', searchName);
                                                }}
                                                className={cn(
                                                    "cursor-pointer",
                                                    field.value 
                                                        ? "bg-[#61A07B] hover:bg-[#528c68] text-white" 
                                                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                                )}
                                            >
                                                Kundentermin
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    field.onChange(false);
                                                    // Switching to Andere: clear customer-related fields
                                                    clearSearch();
                                                    form.setValue('kunde', '');
                                                    form.setValue('customerId', undefined);
                                                }}
                                                className={cn(
                                                    "cursor-pointer",
                                                    !field.value 
                                                        ? "bg-[#61A07B] hover:bg-[#528c68] text-white" 
                                                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                                )}
                                            >
                                                Anderes
                                            </Button>
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {form.getValues('isClientEvent') && (
                            <FormField
                                control={form.control}
                                name="kunde"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kunde<span className="text-red-500">*</span></FormLabel>
                                        <div className="relative" ref={kundeContainerRef}>
                                            <Input
                                                ref={nameInputRef}
                                                placeholder="Kunde suchen"
                                                value={searchName}
                                                onChange={(e) => {
                                                    handleNameChange(e.target.value);
                                                    setSearchName(e.target.value);
                                                    form.setValue('kunde', e.target.value);
                                                    form.setValue('customerId', undefined);
                                                }}
                                            />
                                            {suggestionLoading && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</div>
                                            )}
                                            {showNameSuggestions && nameSuggestions.length > 0 && (
                                                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow">
                                                    {nameSuggestions.map((s) => (
                                                        <button
                                                            type="button"
                                                            key={s.id}
                                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => handleKundeSuggestionClick(s)}
                                                        >
                                                            <div className="font-medium">{s.name}</div>
                                                            <div className="text-xs text-gray-500">{s.phone || ''} {s.email ? `• ${s.email}` : ''}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="uhrzeit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Uhrzeit <span className="text-red-500">*</span></FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue placeholder="Uhrzeit wählen" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[300px] overflow-y-auto">
                                                {timeSlots.map((slot) => (
                                                    <SelectItem 
                                                        key={slot.value} 
                                                        value={slot.value} 
                                                        className="cursor-pointer"
                                                    >
                                                        {slot.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="selectedEventDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Datum <span className="text-red-500">*</span></FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 cursor-pointer text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(new Date(field.value), "dd.MM.yyyy")
                                                        ) : (
                                                            <span>Datum auswählen</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dauer <span className="text-red-500">*</span></FormLabel>
                                    <Select 
                                        onValueChange={(value) => field.onChange(parseFloat(value))} 
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue placeholder="Dauer wählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {durationOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value.toString()} className="cursor-pointer">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="termin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Grund <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue placeholder="Kundentermin wählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {(isClientEvent ? clientTerminOptions : otherTerminOptions).map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />



                        <FormField
                            control={form.control}
                            name="employees"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mitarbeiter <span className="text-red-500">*</span></FormLabel>
                                    <div className="space-y-2">
                                        {/* Selected Employees List */}
                                        {employees.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {employees.map((emp, index) => (
                                                    <div
                                                        key={`${emp.employeeId}-${index}`}
                                                        className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm"
                                                    >
                                                        <span className="font-medium">{emp.assignedTo}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeEmployee(index)}
                                                            className="text-red-500 hover:text-red-700 cursor-pointer"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Employee Search Input */}
                                        <div className="relative" ref={employeeContainerRef}>
                                            <Input
                                                ref={employeeInputRef}
                                                placeholder="Mitarbeiter suchen"
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
                                            />
                                            {employeeSuggestionLoading && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</div>
                                            )}
                                            {showEmployeeSuggestions && filteredEmployeeSuggestions.length > 0 && (
                                                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow max-h-60 overflow-y-auto">
                                                    {filteredEmployeeSuggestions.map((s) => (
                                                        <button
                                                            type="button"
                                                            key={s.id}
                                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => {
                                                                addEmployee(s);
                                                            }}
                                                        >
                                                            <div className="font-medium">{s.employeeName}</div>
                                                            <div className="text-xs text-gray-500">{s.email || ''}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bemerk"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notitz (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Notitz"
                                            className="resize-none h-24"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reminder"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Erinnerung (optional)</FormLabel>
                                    <Select 
                                        onValueChange={(value) => field.onChange(value === 'null' ? null : parseInt(value))} 
                                        value={field.value === null || field.value === undefined ? 'null' : field.value.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue placeholder="Erinnerung wählen" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {reminderOptions.map((opt) => (
                                                <SelectItem 
                                                    key={opt.value === null ? 'null' : opt.value.toString()} 
                                                    value={opt.value === null ? 'null' : opt.value.toString()} 
                                                    className="cursor-pointer"
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-center gap-3">
                            {showDeleteButton && onDelete && (
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onDelete();
                                    }}
                                    className="bg-red-600 cursor-pointer hover:bg-red-700 text-white rounded-3xl"
                                >
                                    Löschen
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#61A07B] cursor-pointer hover:bg-[#528c68] text-white rounded-3xl disabled:opacity-70 disabled:cursor-not-allowed"
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