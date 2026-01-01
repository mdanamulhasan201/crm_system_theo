import { useEffect, useState, useMemo } from "react";
import { faCheck, faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConfirmationPopup from "./ConfirmationPopup";
import Image from "next/image";
import { useGetSingleMassschuheOrder } from "@/hooks/massschuhe/useGetSingleMassschuheOrder";
import { useUpdateMassschuheOrderStatus } from "@/hooks/massschuhe/useUpdateMassschuheOrderStatus";

// Constants
const STATUS_ORDER = ["Leistenerstellung", "Bettungsherstellung", "Halbprobenerstellung", "Schafterstellung", "Bodenerstellung", "Geliefert"];
const CARD_ORDER = ["leistenerstellung", "bettungsherstellung", "halbprobenerstellung", "schafterstellung", "bodenerstellung", "geliefert"];

// Card data configuration
const cardsData = [
    {
        id: "leistenerstellung",
        image: "/spec-6.png",
        title: "Leistenerstellung",
        tabIndex: 1,
    },
    {
        id: "bettungsherstellung",
        image: "/spec-5.png",
        title: "Bettungsherstellung",
        tabIndex: 2,
    },
    {
        id: "halbprobenerstellung",
        image: "/spec-4.png",
        title: "Halbprobenerstellung",
        tabIndex: 3,
        hasPdfButton: true,
    },
    {
        id: "schafterstellung",
        image: "/spec-3.png",
        title: "Schafterstellung",
        tabIndex: 4,
        hasSpecialButtons: true,
    },
    {
        id: "bodenerstellung",
        image: "/spec-2.png",
        title: "Bodenerstellung",
        tabIndex: 5,
        hasBodenButtons: true,
    },
    {
        id: "geliefert",
        image: "/spec-1.png",
        title: "Geliefert",
        tabIndex: 6,
        isWaiting: true,
    },
] as const;

// Map status names to card IDs
const statusToCardIdMap: Record<string, string> = {
    "Leistenerstellung": "leistenerstellung",
    "Bettungsherstellung": "bettungsherstellung",
    "Halbprobenerstellung": "halbprobenerstellung",
    "Schafterstellung": "schafterstellung",
    "Bodenerstellung": "bodenerstellung",
    "Geliefert": "geliefert",
};

// Helper functions for status checking
const hasValue = (value: string | null | undefined): boolean => {
    return value !== null && value !== undefined && value !== "";
};

const hasStarted = (history: any): boolean => {
    return hasValue(history?.startedAt) || hasValue(history?.started);
};

const isFinished = (history: any): boolean => {
    return hasValue(history?.finished) || hasValue(history?.finishedAt);
};

export default function ChangesOrderProgress({
    onClick,
    onClick2,
    setTabClicked,
    selectedOrderId,
    onTabChange,
    onRefetchProductionView,
    onRefetchCardStatistik,
    onRefetchChart,
    onUpdateOrder,
    isSearchingOrders,
}: {
    onClick: () => void;
    onClick2: () => void;
    tabClicked: number;
    setTabClicked: (tab: number) => void;
    selectedOrderId: string | null;
    onTabChange?: (tab: number) => void;
    onRefetchProductionView?: () => void;
    onRefetchCardStatistik?: () => void;
    onRefetchChart?: () => void;
    onUpdateOrder?: (orderId: string, updatedData: any) => void;
    isSearchingOrders?: boolean;
}) {
    // ==================== Hooks & Data Fetching ====================
    const { order, refetch: refetchOrder, loading } = useGetSingleMassschuheOrder(selectedOrderId);
    const { updateStatus } = useUpdateMassschuheOrderStatus();

    // ==================== State Management ====================
    // Button states for schafterstellung card
    const [isButton1, setIsButton1] = useState(true);
    const [isButton2, setIsButton2] = useState(false);
    const [showPdf, setShowPdf] = useState(false);

    // Button states for bodenerstellung card
    const [isBodenButton1, setIsBodenButton1] = useState(false);
    const [isBodenButton2, setIsBodenButton2] = useState(false);
    const [showBodenPdf, setShowBodenPdf] = useState(false);

    // Confirmation popup state
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [pendingProgressAction, setPendingProgressAction] = useState<(() => void) | null>(null);

    // ==================== Status History & Completion Checks ====================
    
    /**
     * Get status history for a specific card
     * @param cardId - The card ID to get history for
     * @returns Status history object or null
     */
    const getStatusHistory = useMemo(() => {
        return (cardId: string) => {
            if (!order?.statusHistory) return null;

            const statusName = Object.keys(statusToCardIdMap).find(
                key => statusToCardIdMap[key] === cardId
            );

            if (!statusName) return null;
            return order.statusHistory.find(history => history.status === statusName) || null;
        };
    }, [order?.statusHistory]);

    /**
     * Check if a status is completed
     * @param cardId - The card ID to check
     * @returns True if status is completed, false otherwise
     */
    const isStatusCompleted = useMemo(() => {
        return (cardId: string) => {
            const history = getStatusHistory(cardId);
            return history ? isFinished(history) : false;
        };
    }, [getStatusHistory]);

    /**
     * Get current active status (IN FERTIGUNG)
     * Finds the status that is started but not finished
     * @returns Current active status name or null
     */
    const getCurrentActiveStatus = useMemo(() => {
        if (!order?.statusHistory || order.statusHistory.length === 0) {
            return "Leistenerstellung";
        }

        // Find status that is started but not finished
        for (const statusName of STATUS_ORDER) {
            const history = order.statusHistory.find(h => h.status === statusName);
            if (history && hasStarted(history) && !isFinished(history)) {
                return statusName;
            }
        }

        // Auto-advance: find next status after completed ones
        for (let i = 0; i < STATUS_ORDER.length; i++) {
            const statusName = STATUS_ORDER[i];
            const history = order.statusHistory.find(h => h.status === statusName);

            if (!isFinished(history)) {
                if (i === 0) {
                    return statusName;
                }

                const prevStatus = STATUS_ORDER[i - 1];
                const prevHistory = order.statusHistory.find(h => h.status === prevStatus);
                if (prevHistory && isFinished(prevHistory)) {
                    return statusName;
                }
            }
        }

        return null;
    }, [order?.statusHistory]);

    /**
     * Get next pending status (IN BEARBEITUNG)
     * Finds the next status that can be started
     * @returns Next pending status name or null
     */
    const getNextPendingStatus = useMemo(() => {
        const currentStatus = getCurrentActiveStatus;

        if (!currentStatus) {
            if (!order?.statusHistory || order.statusHistory.length === 0) {
                return "Leistenerstellung";
            }
            // Find first non-completed status
            for (let i = 0; i < STATUS_ORDER.length; i++) {
                const statusName = STATUS_ORDER[i];
                const history = order.statusHistory.find(h => h.status === statusName);

                if (!isFinished(history)) {
                    if (i === 0 || isFinished(order.statusHistory.find(h => h.status === STATUS_ORDER[i - 1]))) {
                        return statusName;
                    }
                }
            }
            return null;
        }

        // Find next status after current
        const currentIndex = STATUS_ORDER.indexOf(currentStatus);
        if (currentIndex >= 0 && currentIndex < STATUS_ORDER.length - 1) {
            const nextStatus = STATUS_ORDER[currentIndex + 1];
            const nextHistory = order?.statusHistory?.find(h => h.status === nextStatus);
            if (!nextHistory || (!hasStarted(nextHistory) && !isFinished(nextHistory))) {
                return nextStatus;
            }
        }

        return null;
    }, [getCurrentActiveStatus, order?.statusHistory]);

    /**
     * Status checker functions
     * These functions determine the state of each card in the progress flow
     */
    
    // Check if this card is the current active status (IN FERTIGUNG)
    const isCurrentStatus = (cardId: string) => {
        const currentStatus = getCurrentActiveStatus;
        if (!currentStatus) return false;
        return statusToCardIdMap[currentStatus] === cardId;
    };

    // Check if this card is before the current status (already completed)
    const isBeforeCurrentStatus = (cardId: string) => {
        const currentStatus = getCurrentActiveStatus;
        if (!currentStatus) return false;

        const currentCardId = statusToCardIdMap[currentStatus];
        if (!currentCardId) return false;

        const cardIndex = CARD_ORDER.indexOf(cardId);
        const currentIndex = CARD_ORDER.indexOf(currentCardId);
        return cardIndex < currentIndex;
    };

    // Check if this card is the next status (IN BEARBEITUNG)
    const isNextStatus = (cardId: string) => {
        const currentStatus = getCurrentActiveStatus;
        if (!currentStatus) return false;

        const currentCardId = statusToCardIdMap[currentStatus];
        if (!currentCardId) return false;

        const currentIndex = CARD_ORDER.indexOf(currentCardId);
        const cardIndex = CARD_ORDER.indexOf(cardId);

        if (cardIndex === currentIndex + 1) {
            const nextStatusName = Object.keys(statusToCardIdMap).find(
                key => statusToCardIdMap[key] === cardId
            );
            if (!nextStatusName) return false;

            const nextHistory = order?.statusHistory?.find(h => h.status === nextStatusName);
            if (nextHistory) {
                return !hasStarted(nextHistory) && !isFinished(nextHistory);
            }
            return true;
        }

        return false;
    };

    // Check if this card is pending to start (no current status, waiting to begin)
    const isPendingToStart = (cardId: string) => {
        const currentStatus = getCurrentActiveStatus;
        if (currentStatus) return false;

        const nextPendingStatus = getNextPendingStatus;
        if (!nextPendingStatus) return false;

        return statusToCardIdMap[nextPendingStatus] === cardId;
    };

    /**
     * Update button states based on order status history
     * Manages button visibility for schafterstellung and bodenerstellung cards
     */
    useEffect(() => {
        if (!order?.statusHistory) {
            setIsButton1(true);
            setIsButton2(false);
            setShowPdf(false);
            setIsBodenButton1(false);
            setIsBodenButton2(false);
            setShowBodenPdf(false);
            return;
        }

        const schafterHistory = order.statusHistory.find(h => h.status === "Schafterstellung");
        const bodenHistory = order.statusHistory.find(h => h.status === "Bodenerstellung");

        // Update schafterstellung button states
        if (schafterHistory && isFinished(schafterHistory)) {
            setIsButton1(false);
            setShowPdf(true);
        } else if (schafterHistory && hasStarted(schafterHistory)) {
            setIsButton1(false);
            setIsButton2(false);
        }

        // Update bodenerstellung button states
        if (bodenHistory && isFinished(bodenHistory)) {
            setIsBodenButton1(false);
            setIsBodenButton2(false);
            setShowBodenPdf(true);
        } else if (isFinished(schafterHistory) && !hasStarted(bodenHistory)) {
            setIsBodenButton1(true);
            setIsBodenButton2(false);
        }
    }, [order?.statusHistory]);

    // Enable bodenerstellung button after schafterstellung is completed
    useEffect(() => {
        if (showPdf) {
            const timer = setTimeout(() => {
                setIsBodenButton1(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [showPdf]);

    /**
     * Handle progress toggle with confirmation popup
     * @param action - Callback function to execute after status update
     * @param newStatus - New status to update to (optional)
     */
    const handleProgressToggle = (action: () => void, newStatus?: string) => {
        setPendingProgressAction(() => async () => {
            if (newStatus && selectedOrderId) {
                try {
                    // Update order status
                    await updateStatus([selectedOrderId], newStatus);
                    
                    // Small delay to ensure backend has processed the update
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Refetch updated order data
                    const updatedOrder = await refetchOrder();
                    
                    // Update only the specific order in ProductionView (no full reload)
                    if (updatedOrder && onUpdateOrder) {
                        onUpdateOrder(selectedOrderId, {
                            status: updatedOrder.status,
                            statusHistory: updatedOrder.statusHistory,
                        });
                    }
                    
                    // Refetch statistics and charts to update in real-time
                    onRefetchCardStatistik?.();
                    onRefetchChart?.();
                    
                    action();
                } catch (error) {
                    console.error("Failed to update status:", error);
                }
            } else {
                action();
            }
        });
        setShowConfirmPopup(true);
    };

    // ==================== Confirmation Popup Handlers ====================
    
    /**
     * Handle confirmation of progress toggle
     * Executes the pending action and closes popup
     */
    const handleConfirmToggle = async () => {
        if (pendingProgressAction) {
            await pendingProgressAction();
        }
        setShowConfirmPopup(false);
        setPendingProgressAction(null);
    };

    /**
     * Handle cancellation of progress toggle
     * Closes popup without executing action
     */
    const handleCancelToggle = () => {
        setShowConfirmPopup(false);
        setPendingProgressAction(null);
    };

    /**
     * Toggle progress for a card - shows confirmation popup before updating status
     * @param cardId - The card ID to toggle progress for
     * @returns Function to call on button click
     */
    const toggleProgress = (cardId: string) => {
        const statusName = Object.keys(statusToCardIdMap).find(
            key => statusToCardIdMap[key] === cardId
        );
        if (statusName) {
            return () => handleProgressToggle(() => { }, statusName);
        }
        return () => { };
    };

    /**
     * Render a single progress card
     * @param card - Card configuration data
     * @returns JSX element for the card
     */
    const renderCard = (card: (typeof cardsData)[number]) => {
        // Determine card state
        const isCompleted = isStatusCompleted(card.id);
        const statusHistory = getStatusHistory(card.id);
        const isCurrent = isCurrentStatus(card.id);
        const isNext = isNextStatus(card.id);
        const isPending = isPendingToStart(card.id);

        // Status circle
        const renderStatusCircle = () => {
            if (isCompleted) {
                return (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <FontAwesomeIcon icon={faCheck} className="h-5 w-5" />
                    </div>
                );
            }

            if (isCurrent || isPending) {
                return (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                        <FontAwesomeIcon icon={faSpinner} className="h-5 w-5 animate-spin" />
                    </div>
                );
            }

            if (isNext) {
                return (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                        <FontAwesomeIcon icon={faSpinner} className="h-5 w-5" />
                    </div>
                );
            }

            return (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                    <FontAwesomeIcon icon={faSpinner} className="h-5 w-5" />
                </div>
            );
        };

        // Status text
        const renderStatusText = () => {
            if (isCompleted) return "ABGESCHLOSSEN";
            if (isCurrent || isPending) return "IN FERTIGUNG";
            if (isNext) return "IN BEARBEITUNG";
            return "WARTEND";
        };

        return (
            <div key={card.id} className="flex flex-col items-center justify-start px-2 py-4 text-center">
                {/* Card Image */}
                <Image src={card.image} alt={card.title} width={200} height={800} className="mb-4 h-16 w-auto object-contain sm:h-20" />
                
                {/* Status Circle Indicator */}
                <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center">{renderStatusCircle()}</div>
                
                {/* Card Title */}
                <div className="mb-2 text-base font-semibold text-slate-900 md:text-lg">{card.title}</div>
                
                {/* Status Text (ABGESCHLOSSEN, IN FERTIGUNG, IN BEARBEITUNG, WARTEND) */}
                <div className="flex min-h-[24px] w-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-slate-500 md:text-sm">
                    <span className="whitespace-nowrap">{renderStatusText()}</span>
                </div>

                {/* Date-time section for IN FERTIGUNG cards (not completed yet) */}
                {!isCompleted && (isCurrent || isPending) && card.id !== "geliefert" && card.id !== "schafterstellung" && card.id !== "bodenerstellung" && statusHistory && hasStarted(statusHistory) && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600 md:text-sm">
                        <div>
                            <span className="font-medium text-slate-500">Started:</span> <span>{statusHistory.started || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Finished:</span> <span className="text-amber-500">Offen</span>
                        </div>
                    </div>
                )}

                {/* Date-time section for completed cards */}
                {isCompleted && card.id !== "geliefert" && card.id !== "schafterstellung" && card.id !== "bodenerstellung" && statusHistory && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600 md:text-sm">
                        <div>
                            <span className="font-medium text-slate-500">Started:</span> <span>{statusHistory.started || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Finished:</span> <span>{statusHistory.finished || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Completed By:</span>{" "}
                            <span>{(order as any)?.employee?.employeeName || order?.durchgeführt_von || "-"}</span>
                        </div>
                    </div>
                )}

                {/* Date-time for schafterstellung - IN FERTIGUNG */}
                {card.id === "schafterstellung" && !isCompleted && (isCurrent || isPending) && statusHistory && hasStarted(statusHistory) && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600 md:text-sm">
                        <div>
                            <span className="font-medium text-slate-500">Started:</span> <span>{statusHistory.started || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Finished:</span> <span className="text-amber-500">Offen</span>
                        </div>
                    </div>
                )}

                {/* Date-time for schafterstellung - Completed */}
                {card.id === "schafterstellung" && isCompleted && statusHistory && hasStarted(statusHistory) && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600 md:text-sm">
                        <div>
                            <span className="font-medium text-slate-500">Started:</span> <span>{statusHistory.started || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Finished:</span> <span>{statusHistory.finished || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Completed By:</span>{" "}
                            <span>{(order as any)?.employee?.employeeName || order?.durchgeführt_von || "-"}</span>
                        </div>
                    </div>
                )}

                {/* Date-time for bodenerstellung - IN FERTIGUNG */}
                {card.id === "bodenerstellung" && !isCompleted && (isCurrent || isPending) && statusHistory && hasStarted(statusHistory) && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600 md:text-sm">
                        <div>
                            <span className="font-medium text-slate-500">Started:</span> <span>{statusHistory.started || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Finished:</span> <span className="text-amber-500">Offen</span>
                        </div>
                    </div>
                )}

                {/* Date-time for bodenerstellung - Completed */}
                {card.id === "bodenerstellung" && isCompleted && statusHistory && hasStarted(statusHistory) && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600 md:text-sm">
                        <div>
                            <span className="font-medium text-slate-500">Started:</span> <span>{statusHistory.started || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Finished:</span> <span>{statusHistory.finished || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Completed By:</span>{" "}
                            <span>{(order as any)?.employee?.employeeName || order?.durchgeführt_von || "-"}</span>
                        </div>
                    </div>
                )}

                {/* Date-time for geliefert - IN FERTIGUNG */}
                {card.id === "geliefert" && !isCompleted && (isCurrent || isPending) && statusHistory && hasStarted(statusHistory) && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600 md:text-sm">
                        <div>
                            <span className="font-medium text-slate-500">Started:</span> <span>{statusHistory.started || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Finished:</span> <span className="text-amber-500">Offen</span>
                        </div>
                    </div>
                )}

                {/* Date-time for geliefert - Completed */}
                {card.id === "geliefert" && isCompleted && statusHistory && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600 md:text-sm">
                        <div>
                            <span className="font-medium text-slate-500">Started:</span> <span>{statusHistory.started || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Finished:</span> <span>{statusHistory.finished || "-"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-500">Completed By:</span>{" "}
                            <span>{(order as any)?.employee?.employeeName || order?.durchgeführt_von || "-"}</span>
                        </div>
                    </div>
                )}

                {/* ==================== Card-Specific Buttons ==================== */}
                
                {/* Halbprobenerstellung: PDF button was removed - now shows "In Fertigung" button instead (see below) */}

                {/* Schafterstellung: Special multi-step button flow */}
                {"hasSpecialButtons" in card && card.hasSpecialButtons && (
                    <>
                        {isButton1 && (
                            <button
                                type="button"
                                onClick={async () => {
                                    setIsButton1(false);
                                    setIsButton2(true);
                                    setTabClicked(card.tabIndex);
                                    if (selectedOrderId) {
                                        try {
                                            await updateStatus([selectedOrderId], "Schafterstellung");
                                            const updatedOrder = await refetchOrder();
                                            // Update only the specific order in ProductionView (no full reload)
                                            if (updatedOrder && onUpdateOrder) {
                                                onUpdateOrder(selectedOrderId, {
                                                    status: updatedOrder.status,
                                                    statusHistory: updatedOrder.statusHistory,
                                                });
                                            }
                                            // Refetch CardStatistik to update statistics in real-time
                                            onRefetchCardStatistik?.();
                                            // Refetch Chart to update revenue data in real-time
                                            onRefetchChart?.();
                                        } catch (error) {
                                            console.error("Failed to update status:", error);
                                        }
                                    }
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
                        {showPdf && (isCurrent || isNext) && (
                            <button
                                type="button"
                                className="mt-3 inline-flex items-center text-sm font-medium text-emerald-500 hover:text-emerald-600"
                                onClick={toggleProgress(card.id)}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3 w-3" />
                            </button>
                        )}
                    </>
                )}

                {/* Bodenerstellung: Special multi-step button flow */}
                {"hasBodenButtons" in card && card.hasBodenButtons && (
                    <>
                        {isBodenButton1 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsBodenButton1(false);
                                    setIsBodenButton2(true);
                                    setTabClicked(card.tabIndex);
                                    onTabChange?.(card.tabIndex);
                                }}
                                className="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-2 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-50"
                            >
                                Bodenkonfiguration starten
                            </button>
                        )}
                        {isBodenButton2 && (
                            <button
                                type="button"
                                onClick={async () => {
                                    setIsBodenButton2(false);
                                    setShowBodenPdf(true);
                                    if (selectedOrderId) {
                                        try {
                                            await updateStatus([selectedOrderId], "Bodenerstellung");
                                            const updatedOrder = await refetchOrder();
                                            // Update only the specific order in ProductionView (no full reload)
                                            if (updatedOrder && onUpdateOrder) {
                                                onUpdateOrder(selectedOrderId, {
                                                    status: updatedOrder.status,
                                                    statusHistory: updatedOrder.statusHistory,
                                                });
                                            }
                                            // Refetch CardStatistik to update statistics in real-time
                                            onRefetchCardStatistik?.();
                                            // Refetch Chart to update revenue data in real-time
                                            onRefetchChart?.();
                                        } catch (error) {
                                            console.error("Failed to update status:", error);
                                        }
                                    }
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
                                {showBodenPdf && (isCurrent || isNext) && (
                                    <button
                                        type="button"
                                        className="mt-3 cursor-pointer inline-flex items-center text-sm font-medium text-emerald-500 hover:text-emerald-600"
                                        onClick={toggleProgress(card.id)}
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3 w-3" />
                                    </button>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Standard cards (Leistenerstellung, Bettungsherstellung): Standard buttons */}
                {!("hasPdfButton" in card) && !("hasSpecialButtons" in card) && !("hasBodenButtons" in card) && !("isWaiting" in card) && !isCompleted && (isCurrent || isPending) && (
                    <div className="mt-4 space-y-3 w-full">
                        <button
                            type="button"
                            className="w-full rounded-xl border border-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-500 transition hover:bg-emerald-50 cursor-pointer"
                            onClick={toggleProgress(card.id)}
                        >
                            In Fertigung
                        </button>
                        {/* Hide bottom button if isByPartner_1 is true */}
                        {!(order as any)?.isByPartner_1 && (
                            <button
                                type="button"
                                className="w-full rounded-xl border border-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-500 transition hover:bg-emerald-50 cursor-pointer"
                                onClick={() => {
                                    onClick();
                                }}
                            >
                                Jetzt Leisten, Bettung, Halbprobe in einem bestellen
                            </button>
                        )}
                    </div>
                )}

                {/* Halbprobenerstellung: In Fertigung button (replaces removed PDF button) */}
                {"hasPdfButton" in card && card.hasPdfButton && !isCompleted && (isCurrent || isPending) && (
                    <button
                        type="button"
                        className="mt-4 w-full rounded-xl border border-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-500 transition hover:bg-emerald-50 cursor-pointer"
                        onClick={toggleProgress(card.id)}
                    >
                        In Fertigung
                    </button>
                )}

                {/* Geliefert: Arrow button for navigation */}
                {"isWaiting" in card && card.isWaiting && !isCompleted && (isCurrent || isNext) && (
                    <button
                        type="button"
                        className="mt-3 cursor-pointer inline-flex items-center text-sm font-medium text-emerald-500 hover:text-emerald-600"
                        onClick={toggleProgress(card.id)}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3 w-3" />
                    </button>
                )}
            </div>
        );
    };

    // ==================== Loading State Logic ====================
    /**
     * Determine if shimmer/loading state should be shown
     * Shows loading when:
     * 1. Searching for orders (isSearchingOrders), OR
     * 2. No selectedOrderId yet (customer selected but order not found/loaded), OR
     * 3. Order data is still loading
     * Once order is loaded, shows actual data (same as table click behavior)
     */
    const showShimmer = isSearchingOrders || !selectedOrderId || loading || !order;

    return (
        <>
            {showShimmer ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:grid-cols-3 xl:grid-cols-6 py-10 items-start">
                    {cardsData.map((card) => (
                        <div key={card.id} className="flex flex-col items-center justify-start px-2 py-4 text-center">
                            <div className="mb-4 h-16 w-20 bg-gray-200 animate-pulse rounded"></div>
                            <div className="mb-4 h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
                            <div className="mb-2 h-5 bg-gray-200 animate-pulse rounded w-24"></div>
                            <div className="h-4 bg-gray-200 animate-pulse rounded w-20 mb-3"></div>
                            <div className="mt-3 space-y-1">
                                <div className="h-3 bg-gray-200 animate-pulse rounded w-16"></div>
                                <div className="h-3 bg-gray-200 animate-pulse rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:grid-cols-3 xl:grid-cols-6 py-10 items-start">
                    {cardsData.map((card) => renderCard(card))}
                </div>
            )}

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