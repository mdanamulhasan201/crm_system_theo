import React from "react"
import { User, CalendarDays } from "lucide-react"
import { shoe2 } from "../ShoeData"
import type { OrderDataForPDF } from "../PDFPopup"

interface ProductHeaderProps {
    orderData: OrderDataForPDF
    /** When coming from custom-shafts (product card), show this product image instead of default */
    productImageUrl?: string | null
}

export default function ProductHeader({ orderData }: ProductHeaderProps) {
    const hasDelivery = !!orderData.deliveryDate?.trim()
    const customerDisplay = orderData.customerName?.trim() || "—"
    const deliveryDisplay = orderData.deliveryDate?.trim() || "—"

    return (
        <div className="my-8">
            {/* Same card layout as bodenkonstruktion page header */}
            <section className="rounded-2xl bg-white ring-1 ring-gray-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                <div className="p-5 sm:p-6 md:p-7">
                    <h2 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl mb-5 md:mb-6">
                        {orderData.productName || shoe2.name || ""}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                                <User className="size-3.5" />
                                Kunde
                            </label>
                            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm font-medium text-gray-800">
                                {customerDisplay}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                                <CalendarDays className="size-3.5" />
                                Vorauss. Liefertermin
                            </label>
                            <div
                                className={`flex items-center rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium ${hasDelivery ? "bg-gray-50/80 text-gray-800" : "bg-gray-50/50 text-gray-400"}`}
                            >
                                {deliveryDisplay}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
