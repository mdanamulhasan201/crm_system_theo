import React from "react"
import { shoe2 } from "../ShoeData"
import type { OrderDataForPDF } from "../PDFPopup"

interface ProductHeaderProps {
    orderData: OrderDataForPDF
}

export default function ProductHeader({ orderData }: ProductHeaderProps) {
    return (
        <div className="my-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-black">FeetF1rst Massschuhpartner</h1>
            </div>

            <div className="bg-gray-100 rounded-2xl p-4">
                <div className="flex justify-center items-center gap-6">
                    <div className="bg-white rounded-lg p-4 flex-shrink-0">
                        <img
                            src={shoe2.imageUrl || "/placeholder.svg"}
                            alt={shoe2.name}
                            className="w-48 h-48 object-contain"
                        />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-black mb-2">
                            {orderData.productName || ""}
                        </h2>
                        <p className="text-lg text-black mb-2">
                            Kunde: <span className="font-medium">{orderData.customerName || ""}</span>
                        </p>
                        <p className="text-base text-black mb-4">
                            Voraussichtlicher Liefertermin: <span>{orderData.deliveryDate || ''}</span>
                        </p>
                        {/* <p className="text-sm text-black underline cursor-pointer">
                            Bild hier hochladen, wenn die Bodenkonstruktion nach Vorlage erfolgen soll.
                        </p> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

