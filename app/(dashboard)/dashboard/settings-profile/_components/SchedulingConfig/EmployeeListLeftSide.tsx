import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmployeeListItem {
  id: string;
  name: string;
  email?: string | null;
  image?: string | null;
}

interface EmployeeListLeftSideProps {
  loading: boolean;
  employees: EmployeeListItem[];
  selectedId: string | null;
  page: number;
  totalPages: number;
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;
}

export default function EmployeeListLeftSide({
  loading,
  employees,
  selectedId,
  page,
  totalPages,
  onSelect,
  onPageChange,
}: EmployeeListLeftSideProps) {
  return (
    <div className="md:col-span-1">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">
        Mitarbeiter
      </h3>
      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-6 text-center text-sm text-gray-500">
            Laden…
          </div>
        ) : employees.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 px-4 py-6 text-center text-sm text-gray-500">
            Keine Mitarbeiter vorhanden.
          </div>
        ) : (
          <>
            {employees.map((staff) => {
              const initial = (staff.name || "?").trim().charAt(0).toUpperCase();
              return (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => onSelect(staff.id)}
                  className={cn(
                    "w-full cursor-pointer text-left px-3 py-2.5 rounded-lg border transition-colors flex items-center gap-3",
                    selectedId === staff.id
                      ? "bg-[#61A07B] border-[#61A07B]/60 text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <div className="h-9 w-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                    {staff.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={staff.image}
                        alt={staff.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        "text-sm font-medium truncate",
                        selectedId === staff.id ? "text-white" : "text-gray-900"
                      )}
                    >
                      {staff.name}
                    </span>
                    {staff.email && staff.email !== "null" && (
                      <span
                        className={cn(
                          "text-xs truncate",
                          selectedId === staff.id ? "text-gray-100/80" : "text-gray-500"
                        )}
                      >
                        {staff.email}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 pt-2 mt-1 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={page <= 1}
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  aria-label="Vorherige Seite"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-500 px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  aria-label="Nächste Seite"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
