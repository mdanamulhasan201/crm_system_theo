import React from "react"
import { shoe2 } from "../ShoeData"
import type { OrderDataForPDF } from "../PDFPopup"
import { HiUser, HiCalendar } from "react-icons/hi2"

interface ProductHeaderProps {
    orderData: OrderDataForPDF
    /** When coming from custom-shafts (product card), show this product image instead of default */
    productImageUrl?: string | null
}

export default function ProductHeader({ orderData, productImageUrl }: ProductHeaderProps) {
    const hasDelivery = !!orderData.deliveryDate?.trim()
    const imageUrl = productImageUrl ?? shoe2.imageUrl ?? "/placeholder.svg"
    const imageAlt = orderData.productName || shoe2.name

    return (
        <div className="my-8">
            {/* Brand line */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">
                    FeetF1rst Massschuhpartner
                </h1>
            </div>

            {/* Product card: same pattern as Leistenkonfigurator sections */}
            <section className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white ">
                <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full " />

                <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:gap-8 md:p-8">
                    {/* Product image */}
                    <div className="shrink-0">
                        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm ring-1 ring-gray-100/80">
                            <img
                                src={imageUrl}
                                alt={imageAlt}
                                className="h-40 w-40 object-contain md:h-48 md:w-48"
                            />
                        </div>
                    </div>

                    {/* Product & order info */}
                    <div className="min-w-0 flex-1 space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
                                {orderData.productName || ""}
                            </h2>
                        </div>

                        <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <HiUser className="h-4 w-4 shrink-0 text-[#6B9B87]" aria-hidden />
                                <span>
                                    Kunde: <span className="font-medium text-gray-900">{orderData.customerName || "—"}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <HiCalendar className="h-4 w-4 shrink-0 text-[#6B9B87]" aria-hidden />
                                <span>
                                    Vorauss. Liefertermin:{" "}
                                    <span className={`font-medium ${hasDelivery ? "text-gray-900" : "text-gray-400"}`}>
                                        {orderData.deliveryDate || "—"}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
