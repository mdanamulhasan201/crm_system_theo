import { useEffect, useState } from "react";
import { faCheck, faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConfirmationPopup from "./ConfirmationPopup";
import Image from "next/image";

// Function to generate a random European-style name
function generateRandomEuropeanNames() {
    const firstNames = [
        "Luca", "Sofia", "Marek", "Anna", "Jonas", "Elena", "Mateo", "Klara", "Nils", "Eva",
        "Pavel", "Isabelle", "Leon", "Marta", "Erik", "Sara", "Jan", "Petra", "David", "Laura",
    ];
    const lastNames = [
        "Schmidt", "Novak", "Rossi", "Kovacs", "Dubois", "Bianchi", "Popescu", "Horvat", "Nielsen", "Keller",
        "Martin", "Silva", "Fischer", "Kraus", "Varga", "Muller", "Ricci", "Dumont", "Santos", "Petrov",
    ];

    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
}

// Card data configuration
const cardsData = [
    {
        id: "leistenerstellung",
        image: "/spec-6.png",
        title: "Leistenerstellung",
        progressState: "inProgress1",
        tabIndex: 1, // "Leisten Erstellung" tab
    },
    {
        id: "bettungsherstellung",
        image: "/spec-5.png",
        title: "Bettungsherstellung",
        progressState: "inProgress2",
        tabIndex: 2, // "Bettungs Erstellung" tab
    },
    {
        id: "halbprobenerstellung",
        image: "/spec-4.png",
        title: "Halbprobenerstellung",
        progressState: "inProgress3",
        tabIndex: 3, // "Halbproben Erstellung" tab
        hasPdfButton: true,
    },
    {
        id: "schafterstellung",
        image: "/spec-3.png",
        title: "Schafterstellung",
        progressState: "inProgress5",
        tabIndex: 4, // "Schaft Erstellung" tab
        hasSpecialButtons: true,
    },
    {
        id: "bodenerstellung",
        image: "/spec-2.png",
        title: "Bodenerstellung",
        progressState: "inProgress4",
        tabIndex: 5, // "Boden Erstellung" tab
        hasBodenButtons: true,
    },
    {
        id: "geliefert",
        image: "/spec-1.png",
        title: "Geliefert",
        progressState: null,
        tabIndex: 6, // "Geliefert / Abgeschlossen" tab
        isWaiting: true,
    },
] as const;

export default function ChangesOrderProgress({
    onClick,
    onClick2,
    setTabClicked,
}: {
    onClick: () => void;
    onClick2: () => void;
    tabClicked: number;
    setTabClicked: (tab: number) => void;
}) {
    const [isButton1, setIsButton1] = useState(true);
    const [isButton2, setIsButton2] = useState(false);
    const [showPdf, setShowPdf] = useState(false);
    const [isBodenButton1, setIsBodenButton1] = useState(false);
    const [isBodenButton2, setIsBodenButton2] = useState(false);
    const [showBodenPdf, setShowBodenPdf] = useState(false);

    const [inProgress1, setInProgress1] = useState(false);
    const [inProgress2, setInProgress2] = useState(false);
    const [inProgress3, setInProgress3] = useState(false);
    const [inProgress4, setInProgress4] = useState(false);
    const [inProgress5, setInProgress5] = useState(false);

    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [pendingProgressAction, setPendingProgressAction] = useState<(() => void) | null>(null);

    const [currentDateTime, setCurrentDateTime] = useState("");

    useEffect(() => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear()).slice(-2);
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        const ampm = now.getHours() >= 12 ? "PM" : "AM";
        const formatted = `${day}.${month}.${year} ${hours}:${minutes}${ampm}`;

        setCurrentDateTime(formatted);
    }, []);

    const handleProgressToggle = (action: () => void) => {
        setPendingProgressAction(() => action);
        setShowConfirmPopup(true);
    };

    const handleConfirmToggle = () => {
        if (pendingProgressAction) {
            pendingProgressAction();
        }
        setShowConfirmPopup(false);
        setPendingProgressAction(null);
    };

    const handleCancelToggle = () => {
        setShowConfirmPopup(false);
        setPendingProgressAction(null);
    };

    useEffect(() => {
        if (showPdf) {
            const timer = setTimeout(() => {
                setIsBodenButton1(true);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [showPdf]);

    const getProgressState = (progressState: string | null) => {
        if (!progressState) return null;
        switch (progressState) {
            case "inProgress1":
                return inProgress1;
            case "inProgress2":
                return inProgress2;
            case "inProgress3":
                return inProgress3;
            case "inProgress4":
                return inProgress4;
            case "inProgress5":
                return inProgress5;
            default:
                return null;
        }
    };

    const toggleProgress = (progressState: string | null) => {
        if (!progressState) return;
        switch (progressState) {
            case "inProgress1":
                return () => handleProgressToggle(() => setInProgress1(!inProgress1));
            case "inProgress2":
                return () => handleProgressToggle(() => setInProgress2(!inProgress2));
            case "inProgress3":
                return () => handleProgressToggle(() => setInProgress3(!inProgress3));
            case "inProgress4":
                return () => handleProgressToggle(() => setInProgress4(!inProgress4));
            case "inProgress5":
                return () => handleProgressToggle(() => setInProgress5(!inProgress5));
            default:
                return () => { };
        }
    };

    const renderCard = (card: (typeof cardsData)[number]) => {
        const isInProgress = card.progressState ? getProgressState(card.progressState) : false;
        const isCompleted = card.progressState ? !getProgressState(card.progressState) : false;

        // Status circle logic
        const renderStatusCircle = () => {
            if (card.id === "geliefert") {
                return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                        <FontAwesomeIcon icon={faSpinner} />
                    </div>
                );
            }

            if (card.id === "schafterstellung") {
                if (isButton1 || inProgress5) {
                    return (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        </div>
                    );
                }
                return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <FontAwesomeIcon icon={faCheck} />
                    </div>
                );
            }

            if (card.id === "bodenerstellung") {
                if (isBodenButton1 || isBodenButton2 || showBodenPdf) {
                    if (showBodenPdf) {
                        return !inProgress4 ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <FontAwesomeIcon icon={faCheck} />
                            </div>
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            </div>
                        );
                    }
                    return (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        </div>
                    );
                }
                // Waiting state - show static spinner like Geliefert
                return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                        <FontAwesomeIcon icon={faSpinner} />
                    </div>
                );
            }

            // Default status circle for other cards
            return isCompleted ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <FontAwesomeIcon icon={faCheck} />
                </div>
            ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                </div>
            );
        };

        // Status text logic
        const renderStatusText = () => {
            if (card.id === "schafterstellung") {
                return isButton1 ? "IN BEARBEITUNG" : inProgress5 ? "IN BEARBEITUNG" : "ABGESCHLOSSEN";
            }
            if (card.id === "bodenerstellung") {
                if (isBodenButton1 || isBodenButton2) return "IN BEARBEITUNG";
                if (showBodenPdf) return "ABGESCHLOSSEN";
                return "WARTEND";
            }
            if (card.id === "geliefert") {
                return "WARTEND";
            }
            return isCompleted ? "ABGESCHLOSSEN" : "IN FERTIGUNG";
        };

        return (
            <div key={card.id} className="flex flex-col items-center px-2 py-4 text-center">
                <Image src={card.image} alt={card.title} width={200} height={800} className="mb-3 h-16 w-auto object-contain sm:h-20" />
                <div className="mb-4 flex items-center justify-center">{renderStatusCircle()}</div>
                <div className="mt-1 text-base font-semibold text-slate-900 md:text-lg">{card.title}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 md:text-sm">
                    {renderStatusText()}
                </div>

                {/* Date-time section for completed cards */}
                {isCompleted && card.id !== "geliefert" && card.id !== "schafterstellung" && card.id !== "bodenerstellung" && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600 md:text-sm">
                        <div>
                            <span className="font-medium text-slate-500">Started:</span> <span>10.04.25 16:43PM</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Finished:</span> <span>10.04.25 16:43PM</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Completed By:</span>{" "}
                            <span>{generateRandomEuropeanNames()}</span>
                        </div>
                    </div>
                )}

                {/* Special date-time for schafterstellung */}
                {card.id === "schafterstellung" && showPdf && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600 md:text-sm">
                        <div>
                            <span className="font-medium text-slate-500">Started:</span> <span>{currentDateTime}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Finished:</span> <span>{currentDateTime}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Completed By:</span>{" "}
                            <span>{generateRandomEuropeanNames()}</span>
                        </div>
                    </div>
                )}

                {/* Special date-time for bodenerstellung */}
                {card.id === "bodenerstellung" && showBodenPdf && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600 md:text-sm">
                        <div>
                            <span className="font-medium text-slate-500">Started:</span> <span>{currentDateTime}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Finished:</span> <span>{currentDateTime}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Completed By:</span>{" "}
                            <span>{generateRandomEuropeanNames()}</span>
                        </div>
                    </div>
                )}

                {/* PDF button for halbprobenerstellung */}
                {"hasPdfButton" in card && card.hasPdfButton && (
                    <button
                        type="button"
                        onClick={() => {
                            onClick();
                            setTabClicked(card.tabIndex);
                        }}
                        className="mt-4 cursor-pointer inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-2 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-50"
                    >
                        Pdf anzeigen
                    </button>
                )}

                {/* Special buttons for schafterstellung */}
                {"hasSpecialButtons" in card && card.hasSpecialButtons && (
                    <>
                        {isButton1 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsButton1(false);
                                    setIsButton2(true);
                                    setTabClicked(card.tabIndex);
                                }}
                                className="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-2 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-50"
                            >
                                In Fertigung markieren
                            </button>
                        )}
                        {isButton2 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsButton2(false);
                                    setShowPdf(true);
                                }}
                                className="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-2 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-50"
                            >
                                Als abgeschlossen markieren
                            </button>
                        )}
                        {showPdf && (
                            <button
                                type="button"
                                className="mt-3 inline-flex items-center text-sm font-medium text-emerald-500 hover:text-emerald-600"
                                onClick={() => handleProgressToggle(() => setInProgress5(!inProgress5))}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3 w-3" />
                            </button>
                        )}
                    </>
                )}

                {/* Special buttons for bodenerstellung */}
                {"hasBodenButtons" in card && card.hasBodenButtons && (
                    <>
                        {isBodenButton1 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsBodenButton1(false);
                                    setIsBodenButton2(true);
                                    setTabClicked(card.tabIndex);
                                }}
                                className="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-2 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-50"
                            >
                                Bodenkonfiguration starten
                            </button>
                        )}
                        {isBodenButton2 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsBodenButton2(false);
                                    setShowBodenPdf(true);
                                }}
                                className="mt-4 cursor-pointer inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-2 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-50"
                            >
                                Bodenerstellung abschließen
                            </button>
                        )}
                        {showBodenPdf && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClick2();
                                        setTabClicked(card.tabIndex);
                                    }}
                                    className="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-2 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-50"
                                >
                                    Details anzeigen
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 cursor-pointer inline-flex items-center text-sm font-medium text-emerald-500 hover:text-emerald-600"
                                    onClick={() => handleProgressToggle(() => setInProgress4(!inProgress4))}
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3 w-3" />
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* Back arrow button for standard cards */}
                {!("hasPdfButton" in card) && !("hasSpecialButtons" in card) && !("hasBodenButtons" in card) && !("isWaiting" in card) && (
                    <button
                        type="button"
                        className="mt-3 cursor-pointer inline-flex items-center text-sm font-medium text-emerald-500 hover:text-emerald-600"
                        onClick={toggleProgress(card.progressState)}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3 w-3" />
                    </button>
                )}

                {/* Back arrow for halbprobenerstellung */}
                {"hasPdfButton" in card && card.hasPdfButton && (
                    <button
                        type="button"
                        className="mt-3 cursor-pointer inline-flex items-center text-sm font-medium text-emerald-500 hover:text-emerald-600"
                        onClick={() => handleProgressToggle(() => setInProgress3(!inProgress3))}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3 w-3" />
                    </button>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Responsive grid for all progress cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 lg:grid-cols-4 xl:grid-cols-6 py-10">
                {cardsData.map((card) => renderCard(card))}
            </div>

            {showConfirmPopup && (
                <ConfirmationPopup
                    onClose={handleCancelToggle}
                    onConfirm={handleConfirmToggle}
                    title="Status ändern bestätigen"
                    message="Möchten Sie den Fortschrittsstatus dieser Produktionsphase wirklich ändern?"
                />
            )}
        </>
    );
}
