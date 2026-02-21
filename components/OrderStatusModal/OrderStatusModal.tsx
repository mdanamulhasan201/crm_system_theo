"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, Footprints, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSingleCustomerWiseOrder } from "@/apis/customerApis";
import { cn } from "@/lib/utils";

export interface OrderStatusItem {
  route: string;
  id: string;
  status: string;
}

export interface OrderStatusData {
  insole: OrderStatusItem[];
  shoe: OrderStatusItem[];
}

export interface OrderStatusResponse {
  success: boolean;
  message: string;
  totalInsole: number;
  totalShoes: number;
  data: OrderStatusData;
}

export interface OrderStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
}

export default function OrderStatusModal({
  open,
  onOpenChange,
  customerId,
}: OrderStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OrderStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderStatus = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = (await getSingleCustomerWiseOrder(id)) as any;
      const responseData = res?.data;
      const isObjectWithInsoleShoe =
        responseData &&
        typeof responseData === "object" &&
        !Array.isArray(responseData) &&
        ("insole" in responseData || "shoe" in responseData);
      const insoleList = Array.isArray(
        isObjectWithInsoleShoe && responseData?.insole
      )
        ? responseData.insole
        : [];
      const shoeList = Array.isArray(
        isObjectWithInsoleShoe && responseData?.shoe
      )
        ? responseData.shoe
        : [];
      setData({
        success: res?.success ?? true,
        message: res?.message ?? "",
        totalInsole: res?.totalInsole ?? insoleList.length,
        totalShoes: res?.totalShoes ?? shoeList.length,
        data: { insole: insoleList, shoe: shoeList },
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Fehler beim Laden der Aufträge."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && customerId) {
      fetchOrderStatus(customerId);
    }
    if (!open) {
      setData(null);
      setError(null);
    }
  }, [open, customerId, fetchOrderStatus]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setData(null);
        setError(null);
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  const formatStatus = (status: string) =>
    status?.replace(/_/g, " ") ?? status;

  const getStatusBadgeClass = (status: string) => {
    const s = status?.toLowerCase() ?? "";
    if (s.includes("warten") || s.includes("pending")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (s.includes("fertig") || s.includes("abgeschlossen") || s.includes("complete")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (s.includes("produktion") || s.includes("versorgung")) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const OrderRow = ({
    item,
    index,
  }: {
    item: OrderStatusItem;
    index: number;
  }) => (
    <li className="group relative flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition hover:border-[#62A07C]/40 hover:shadow-md">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 group-hover:bg-[#62A07C]/15 group-hover:text-[#62A07C]">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
            getStatusBadgeClass(item.status)
          )}
          title={item.status}
        >
          {formatStatus(item.status)}
        </span>
      </div>
      <Link
        href={item.route}
        className="flex shrink-0 items-center gap-1 rounded-lg bg-[#62A07C]/10 px-3 py-1.5 text-sm font-medium text-[#62A07C] transition hover:bg-[#62A07C]/20"
      >
        Öffnen
        <ChevronRight className="h-4 w-4" />
      </Link>
    </li>
  );

  const SummaryCard = ({
    icon: Icon,
    count,
    label,
    accent,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    label: string;
    accent: boolean;
  }) => (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-4 transition",
        accent
          ? "border-[#62A07C]/30 bg-gradient-to-br from-[#62A07C]/10 to-[#62A07C]/5"
          : "border-slate-200 bg-slate-50/80"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            accent ? "bg-[#62A07C]/20 text-[#62A07C]" : "bg-slate-200/80 text-slate-600"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{count}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col border-slate-200/80 shadow-xl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-lg font-semibold text-slate-800">
            Auftragsstatus – Scan & Versorgung
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-2 border-[#62A07C]/20" />
              <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-[#62A07C]" />
            </div>
            <p className="text-sm text-slate-500">Aufträge werden geladen…</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard
                icon={Footprints}
                count={data.totalInsole ?? 0}
                label="Einlagen"
                accent
              />
              <SummaryCard
                icon={Package}
                count={data.totalShoes ?? 0}
                label="Schuhe"
                accent={false}
              />
            </div>

            {(data.data?.insole?.length ?? 0) > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="flex h-6 w-1 rounded-full bg-[#62A07C]" />
                  Einlagen – Schritt für Schritt
                </h4>
                <ul className="space-y-2">
                  {(data.data?.insole ?? []).map((item, index) => (
                    <OrderRow key={item.id} item={item} index={index} />
                  ))}
                </ul>
              </div>
            )}

            {(data.data?.shoe?.length ?? 0) > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="flex h-6 w-1 rounded-full bg-slate-400" />
                  Schuhe – Schritt für Schritt
                </h4>
                <ul className="space-y-2">
                  {(data.data?.shoe ?? []).map((item, index) => (
                    <OrderRow key={item.id} item={item} index={index} />
                  ))}
                </ul>
              </div>
            )}

            {(data.data?.insole?.length ?? 0) === 0 &&
              (data.data?.shoe?.length ?? 0) === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
                  <Package className="mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">
                    Keine Aufträge für diesen Kunden
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Aufträge erscheinen hier nach der Erstellung
                  </p>
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
