import { TableHead, TableRow } from "@/components/ui/table";

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
        <TableRow className="bg-gray-50">
            <TableHead className="w-[36px] min-w-[36px] max-w-[36px] text-center font-semibold text-gray-600">
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                        if (input) {
                            input.indeterminate = isSomeSelected;
                        }
                    }}
                    onChange={onSelectAll}
                    className="w-4 h-4 cursor-pointer"
                    title={isAllSelected ? "Alle abwählen" : "Alle auswählen"}
                />
            </TableHead>
            <TableHead className="w-[120px] min-w-[120px] max-w-[120px] whitespace-normal break-words text-xs sm:text-sm text-center font-semibold text-gray-600">Priorität</TableHead>
            <TableHead className="w-[110px] min-w-[110px] max-w-[110px] whitespace-normal break-words text-xs sm:text-sm text-center font-semibold text-gray-600">Bestellnummer</TableHead>
            <TableHead className="w-[130px] min-w-[130px] max-w-[130px] whitespace-normal break-words text-xs sm:text-sm text-center font-semibold text-gray-600">Kundenname</TableHead>
            <TableHead className="w-[240px] min-w-[240px] max-w-[240px] whitespace-normal break-words text-xs sm:text-sm text-center font-semibold text-gray-600">Status</TableHead>
            <TableHead className="w-[90px] min-w-[90px] max-w-[90px] whitespace-normal break-words text-xs sm:text-sm text-center font-semibold text-gray-600">Preis</TableHead>
            <TableHead className="w-[200px] min-w-[200px] max-w-[200px] break-words text-xs sm:text-sm text-center font-semibold text-gray-600">Zahlung</TableHead>
            <TableHead className="w-[120px] min-w-[120px] max-w-[120px] whitespace-normal break-words text-xs sm:text-sm text-center font-semibold text-gray-600">Erstellt am</TableHead>
            <TableHead className="w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words text-xs sm:text-sm text-center font-semibold text-gray-600">Geplantes Fertigstelldatum</TableHead>
            <TableHead className="w-[150px] min-w-[150px] max-w-[150px] whitespace-normal break-words text-xs sm:text-sm text-center font-semibold text-gray-600">Beschreibung</TableHead>
            <TableHead className="w-[160px] min-w-[160px] max-w-[160px] text-center font-semibold text-gray-600">Historie</TableHead>
            <TableHead className="w-[160px] min-w-[160px] max-w-[160px] text-center font-semibold text-gray-600">Aktionen</TableHead>
        </TableRow>
    );
}

