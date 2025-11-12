"use client";
// import  { useEffect, useState } from "react";
// import Image from "next/image";
// import gassImg from "@/public/images/gass.png";
// import { Button } from "@/components/ui/button";
// import { createSammelbestellung, getSammelbestellung } from "@/apis/sammelbestellungenApis";

// Progress bar data configuration
const progressBarData = {
    percentage: 60,
    color: '#60b4ff',
};

// Function to get progress bar color based on percentage
const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) {
        return '#22c55e';
    } else if (percentage >= 50) {
        return '#60b4ff';
    } else if (percentage >= 30) {
        return '#f59e0b';
    } else {
        return '#ef4444';
    }
};


export default function GroupOrders() {
    // const product = {
    //     id: "durospray-ortho3040",
    //     name: "DuroSpray® DS Ortho3040",
    //     intro: "Für schnelleres und sauberes Arbeiten – besonders bei Einlagenüberzügen und Materialverklebung.",
    //     beschreibung:
    //         "Toluolfreier Sprühkleber mit feinem Sprühbild, kurzer Ablüftzeit und hoher Ergiebigkeit – ideal für präzises und sauberes Arbeiten in der Einlagenfertigung. Entwickelt speziell für die Orthopädie-Schuhtechnik.",
    //     anwendung:
    //         "Zum Verkleben von Echtleder, EVA, Kork, Mikrofaser, Pelotten u.v.m. – perfekt für alte oder neue Decklagen, da auch wärmeaktivierbar.",
    //     ergiebigkeit: "Reicht für ca. 2.000 - 2.500 Einlagenpaare inkl. Überzug.",
    //     link: "#",
    //     price: "179,99€",
    //     minQty: 10,
    // };

    // Reservation state
    // const [showReservation, setShowReservation] = useState(false);
    // const [quantity, setQuantity] = useState(1);
    // const [confirmed, setConfirmed] = useState(false);
    // const [loading, setLoading] = useState(false);
    // const [currentNumber, setCurrentNumber] = useState(0);
    // const minQty = product.minQty;

    // Fetch current overview on mount
    // useEffect(() => {
    //     const fetchOverview = async () => {
    //         try {
    //             const res = await getSammelbestellung();
    //             // Expecting { success: true, data: { number: number, ... } }
    //             const num = res?.data?.number ?? 0;
    //             setCurrentNumber(num);
    //             if (typeof num === 'number' && num > 0) {
    //                 setQuantity(Math.max(1, Math.min(10, num)));
    //             }
    //         } catch (e) {
    //             // noop: keep 0 if failed
    //         }
    //     };
    //     fetchOverview();
    // }, []);

    // Handler for reservation confirmation
    // const handleConfirm = async () => {

    //     const clamped = Math.max(1, Math.min(10, quantity));
    //     if (clamped !== quantity) setQuantity(clamped);
    //     setLoading(true);
    //     try {
    //         await createSammelbestellung(clamped);
    //         setConfirmed(true);

    //         const res = await getSammelbestellung();
    //         const num = res?.data?.number ?? 0;
    //         setCurrentNumber(num);
    //     } catch (e) {

    //         setConfirmed(false);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <div className="mt-8 font-sans px-2 md:px-6">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">Sammelbestellungen</h1>
                <p className="mb-1 text-base md:text-lg">
                    Gemeinsam mit unseren Partnern bieten wir gebündelte Bestellungen an und nutzen die Stärke des gemeinsamen Netzwerks. So profitieren alle von reibungslosen Abläufen – und vor allem von besten Preisen.
                </p>
                <p className="text-base md:text-lg">
                    Du kannst Produkte ganz einfach vormerken – bestellt wird erst, wenn genügend Bestellungen eingegangen sind. Das voraussichtliche Lieferdatum wird bekanntgegeben, sobald die Mindestmenge erreicht ist.
                </p>
            </div>


            <div className='bg-black/90 h-full bg-opacity-50 backdrop-blur-sm flex items-center justify-center'>
                <div className="flex flex-col items-center justify-center text-center space-y-8 ">
                    {/* Main Title */}
                    <h1 className="lg:text-6xl text-4xl font-bold text-white uppercase tracking-wider leading-tight">
                        UNDER <br /> CONSTRUCTION
                    </h1>

                    {/* Subtitle */}
                    <p className="text-white uppercase text-sm tracking-widest mt-2">
                        SITE NEARLY READY
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full space-y-3 mt-8">
                        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                                style={{
                                    width: `${progressBarData.percentage}%`,
                                    backgroundColor: getProgressColor(progressBarData.percentage)
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-white font-medium">
                            <span>{progressBarData.percentage}%</span>
                            <span>100%</span>
                        </div>
                    </div>


                    <div className="flex justify-center">
                        {/* <Button variant="outline" className="cursor-pointer bg-gray-100 text-gray-500 " >OK</Button> */}
                    </div>
                </div>
            </div>

            {/* Product Card Section */}
            {/* <div className="flex flex-col lg:flex-row items-start gap-8 w-full">


           
                <div className="flex flex-col items-center w-full lg:w-1/4">
                    <Image
                        src={gassImg}
                        alt={product.name}
                        className="object-contain"
                        width={200}
                        height={200}
                        priority
                    />
                    <div className="w-full mt-4">
                        <div className="relative w-full h-7 md:h-8 bg-gray-200 rounded overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-7 md:h-8 bg-green-600 rounded flex items-center justify-center transition-all duration-300"
                                style={{
                                    width: `${Math.min(100, (currentNumber / minQty) * 100)}%`,
                                    minWidth: "80px",
                                }}
                            >
                                <span className="text-white text-xs md:text-sm font-medium w-full text-center px-2 truncate">
                                    {currentNumber} von {minQty} Bestellungen erreicht
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            
                <div className="flex-1 w-full flex flex-col lg:flex-row lg:items-stretch">

                    <div className="flex-1 pr-0 lg:pr-8 flex flex-col">
                        <div className="mb-2 text-base">{product.intro}</div>
                        <div className="text-3xl font-bold mb-2">{product.name}</div>
                        <div className="my-5">
                            <span className="font-bold">Beschreibung: </span>
                            {product.beschreibung}
                        </div>
                        <div className="mb-2">
                            <p> <span className="font-bold">Anwendung:</span>  Zum Verkleben von Echtleder, EVA, Kork, Mikrofaser, Pelotten u.v.m. – perfekt für alte oder neue Decklagen, da auch wärmeaktivierbar.</p>
                        </div>
                        <div className="mb-2 ">{product.ergiebigkeit}</div>
                        <p className="underline ">Mehr zum Produkt erfahren</p>
                        <div className="flex-1" />
                      
                        {!showReservation && !confirmed && (
                            <Button
                                variant="outline"
                                className="w-full cursor-pointer font-bold text-lg border-2 py-6 mt-2"
                                onClick={() => setShowReservation(true)}
                            >
                                Jetzt einschreiben
                            </Button>
                        )}
                        {showReservation && !confirmed && (
                            <div className="w-full mt-4 flex flex-col gap-2">
                                <div className="flex items-center gap-4">
                                    <label className="font-medium">Menge <span className="text-sm text-gray-500">(aktuell: {currentNumber})</span>:</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="w-8 h-8 cursor-pointer border rounded flex items-center justify-center text-lg font-bold disabled:opacity-50"
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            disabled={quantity <= 1}
                                            type="button"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={quantity}
                                            onChange={e => setQuantity(Math.max(1, Math.min(10, Number(e.target.value))))}
                                            className="w-16 text-center border rounded"
                                            disabled={confirmed}
                                        />
                                        <button
                                            className="w-8 h-8 cursor-pointer border rounded flex items-center justify-center text-lg font-bold"
                                            onClick={() => setQuantity(q => Math.min(10, q + 1))}
                                            type="button"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    className="w-full cursor-pointer font-bold text-lg border-2 py-5 mt-2"
                                    onClick={handleConfirm}
                                    disabled={confirmed || loading}
                                >
                                    {loading ? "Wird gespeichert…" : "Vormerkung abschließen"}
                                </Button>
                                <div className="text-xs text-muted-foreground mt-1 text-center">
                                    Wird mit deiner Balance verrechnet
                                </div>
                            </div>
                        )}
                        {confirmed && (
                            <Button
                                className="w-full cursor-pointer font-bold text-lg border-2 py-6 mt-2"
                                disabled
                                variant="outline"
                            >
                                Du hast dieses Produkt vorgemerkt
                            </Button>
                        )}
                    </div>
                
                    <div className="flex lg:flex-col items-end lg:justify-end justify-center min-w-[120px] lg:pl-4 pt-6 lg:pt-0">
                        <div className="text-3xl font-bold lg:self-end self-center">{product.price}</div>
                    </div>
                </div>
            </div> */}
        </div>
    );
}
