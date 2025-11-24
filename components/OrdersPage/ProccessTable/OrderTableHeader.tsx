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
            <TableHead className="w-[50px] min-w-[50px] max-w-[50px] text-center">
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
            <TableHead className="w-[200px] min-w-[200px] max-w-[200px] text-center"></TableHead>
            <TableHead className="w-[120px] min-w-[120px] max-w-[120px] whitespace-normal break-words text-xs sm:text-sm text-center">Bestellnummer</TableHead>
            <TableHead className="w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words text-xs sm:text-sm text-center">Kundenname</TableHead>
            <TableHead className="w-[160px] min-w-[160px] max-w-[160px] whitespace-normal break-words text-xs sm:text-sm text-center">Status</TableHead>
            <TableHead className="w-[100px] min-w-[100px] max-w-[100px] whitespace-normal break-words text-xs sm:text-sm text-center">Preis</TableHead>
            <TableHead className="w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words text-xs sm:text-sm hidden md:table-cell text-center">Zahlung</TableHead>
            <TableHead className="w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words text-xs sm:text-sm hidden lg:table-cell text-center">Erstellt am</TableHead>
            <TableHead className="w-[160px] min-w-[160px] max-w-[160px] whitespace-normal break-words text-xs sm:text-sm hidden lg:table-cell text-center">Fertiggestellt am</TableHead>
            <TableHead className="w-[180px] min-w-[180px] max-w-[180px] whitespace-normal break-words text-xs sm:text-sm hidden xl:table-cell text-center">Beschreibung</TableHead>
            <TableHead className="w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words text-xs sm:text-sm text-center">Status aktualisieren</TableHead>
        </TableRow>
    );
}

