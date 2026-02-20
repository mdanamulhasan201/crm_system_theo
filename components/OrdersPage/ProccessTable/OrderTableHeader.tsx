import { TableHead, TableRow } from "@/components/ui/table";

// Custom Checkbox Component with emerald/green border
function CustomCheckbox({
    checked,
    onChange,
    id,
    indeterminate
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
    indeterminate?: boolean;
}) {
    return (
        <div className="relative flex items-center justify-center">
            <input
                type="checkbox"
                id={id}
                className="sr-only"
                checked={checked}
                ref={(el) => {
                    if (el) el.indeterminate = indeterminate || false;
                }}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div
                className={`
                    w-4 h-4 rounded border-2 cursor-pointer transition-all
                    flex items-center justify-center
                    ${checked
                        ? 'bg-emerald-500 border-emerald-500'
                        : indeterminate
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-white border-emerald-300 hover:border-emerald-400'
                    }
                `}
                onClick={() => onChange(!checked)}
            >
                {checked && !indeterminate && (
                    <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
                {indeterminate && (
                    <div className="w-2 h-0.5 bg-white rounded" />
                )}
            </div>
        </div>
    );
}

interface OrderTableHeaderProps {
    isAllSelected: boolean;
    isSomeSelected: boolean;
    onSelectAll: () => void;
}

export default function OrderTableHeader({
    isAllSelected,
    isSomeSelected,
    onSelectAll,
}: OrderTableHeaderProps) {
    return (
        <TableRow className="bg-gray-50 border-b border-gray-200">
            <TableHead className="font-semibold text-gray-700 text-sm py-4 px-4 w-12">
                <CustomCheckbox
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    id="select-all"
                    indeterminate={isSomeSelected && !isAllSelected}
                />
            </TableHead>
            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 whitespace-nowrap text-center">Priorität</TableHead>
            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 whitespace-nowrap text-center">Bestellnummer</TableHead>
            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 whitespace-nowrap text-center">Kundenname</TableHead>
            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 whitespace-nowrap text-center">Status</TableHead>
            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 whitespace-nowrap text-center">Preis</TableHead>
            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 whitespace-nowrap text-center">Zahlung</TableHead>
            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 whitespace-nowrap text-center">Erstellt am</TableHead>
            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 whitespace-nowrap text-center">Geplantes Fertigstelldatum</TableHead>
            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 whitespace-nowrap text-center">Beschreibung</TableHead>
            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 whitespace-nowrap text-center">Historie</TableHead>
            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 whitespace-nowrap text-center">Aktionen</TableHead>
        </TableRow>
    );
}

