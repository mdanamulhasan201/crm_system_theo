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
        <TableRow>
            <TableHead className="w-[36px] min-w-[36px] max-w-[36px] text-center">
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
            <TableHead className="w-[120px] min-w-[120px] max-w-[120px] whitespace-normal break-words text-xs sm:text-sm text-center">Priorität</TableHead>
            <TableHead className="w-[110px] min-w-[110px] max-w-[110px] whitespace-normal break-words text-xs sm:text-sm text-center">Bestellnummer</TableHead>
            <TableHead className="w-[130px] min-w-[130px] max-w-[130px] whitespace-normal break-words text-xs sm:text-sm text-center">Kundenname</TableHead>
            <TableHead className="w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words text-xs sm:text-sm text-center">Status</TableHead>
            <TableHead className="w-[90px] min-w-[90px] max-w-[90px] whitespace-normal break-words text-xs sm:text-sm text-center">Preis</TableHead>
            <TableHead className="w-[120px] min-w-[120px] max-w-[120px] whitespace-normal break-words text-xs sm:text-sm hidden md:table-cell text-center">Zahlung</TableHead>
            <TableHead className="w-[120px] min-w-[120px] max-w-[120px] whitespace-normal break-words text-xs sm:text-sm hidden lg:table-cell text-center">Erstellt am</TableHead>
            <TableHead className="w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words text-xs sm:text-sm hidden lg:table-cell text-center">Geplantes Fertigstelldatum</TableHead>
            <TableHead className="w-[150px] min-w-[150px] max-w-[150px] whitespace-normal break-words text-xs sm:text-sm hidden xl:table-cell text-center">Beschreibung</TableHead>
            <TableHead className="w-[160px] min-w-[160px] max-w-[160px] text-center">Historie</TableHead>
            <TableHead className="w-[160px] min-w-[160px] max-w-[160px] text-center">Aktionen</TableHead>
        </TableRow>
    );
}

