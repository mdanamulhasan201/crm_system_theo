import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Check } from "lucide-react";

const INPUT_ID = "cover-input";

interface CoverManagementProps {
    coverList: string[];
    onCoverListChange: (covers: string[]) => void;
}

export default function CoverManagement({ coverList, onCoverListChange }: CoverManagementProps) {
    const [newCover, setNewCover] = useState("");

    const focusInput = useCallback(() => {
        setTimeout(() => {
            const input = document.getElementById(INPUT_ID) as HTMLInputElement;
            input?.focus();
        }, 0);
    }, []);

    const handleCoverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewCover(value);

        // Auto-add if comma is detected while typing
        if (value.includes(",") && !value.endsWith(",")) {
            const parts = value.split(",");
            const lastPart = parts[parts.length - 1].trim();
            if (lastPart.length > 0 && parts.length > 1) {
                const itemsToAdd = parts
                    .slice(0, -1)
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0 && !coverList.includes(item));

                if (itemsToAdd.length > 0) {
                    onCoverListChange([...coverList, ...itemsToAdd]);
                    setNewCover(lastPart);
                }
            }
        }
    };

    const handleCoverInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || (e.key === "," && newCover.trim())) {
            e.preventDefault();
            addCoversFromInput();
        } else if (e.key === "Backspace" && newCover === "" && coverList.length > 0) {
            e.preventDefault();
            onCoverListChange(coverList.slice(0, -1));
        } else if (e.key === "Escape") {
            setNewCover("");
            const input = document.getElementById(INPUT_ID) as HTMLInputElement;
            input?.blur();
        }
    };

    const handleCoverInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text");
        const items = pastedText
            .split(/[,;\n]/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0 && !coverList.includes(item));

        if (items.length > 0) {
            onCoverListChange([...coverList, ...items]);
            setNewCover("");
        }
    };

    const handleCoverInputBlur = () => {
        if (newCover.trim()) {
            addCoversFromInput();
        }
    };

    const addCoversFromInput = useCallback(() => {
        if (!newCover.trim()) return;

        const newCovers = newCover
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0 && !coverList.includes(item));

        if (newCovers.length > 0) {
            onCoverListChange([...coverList, ...newCovers]);
            setNewCover("");
            focusInput();
        }
    }, [newCover, coverList, onCoverListChange, focusInput]);

    const removeCover = (coverToRemove: string) => {
        onCoverListChange(coverList.filter((item) => item !== coverToRemove));
        focusInput();
    };

    const clearAllCovers = () => {
        onCoverListChange([]);
        setNewCover("");
        focusInput();
    };

    return (
        <div className="mt-12">
            <h2 className="font-bold text-lg mb-4 text-black">
                Überzüge Verwalten
            </h2>

            <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                    <div
                        className="border border-gray-300 rounded-[5px] bg-white min-h-[44px] px-3 py-2 flex flex-wrap gap-2 items-center cursor-text focus-within:border-black focus-within:ring-2 focus-within:ring-black/20 transition-all hover:border-gray-400"
                        onClick={() => {
                            const input = document.getElementById(INPUT_ID) as HTMLInputElement;
                            input?.focus();
                        }}
                    >
                        {coverList.map((cover) => (
                            <div
                                key={cover}
                                className="px-3 py-1.5 rounded-full border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 text-xs font-semibold flex items-center gap-2 hover:from-blue-100 hover:to-blue-200 transition-all shadow-sm group"
                            >
                                <span>{cover}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeCover(cover);
                                    }}
                                    className="hover:bg-red-100 rounded-full p-0.5 cursor-pointer transition-colors opacity-70 group-hover:opacity-100 text-red-600 hover:text-red-700"
                                    aria-label={`${cover} entfernen`}
                                    type="button"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        <Input
                            id={INPUT_ID}
                            type="text"
                            placeholder={coverList.length === 0 ? "Neuen Überzug Eingeben (durch Komma getrennt für mehrere)....." : "Weiter eingeben..."}
                            value={newCover}
                            onChange={handleCoverInputChange}
                            onKeyDown={handleCoverInputKeyDown}
                            onPaste={handleCoverInputPaste}
                            onBlur={handleCoverInputBlur}
                            className="border-0 p-0 h-auto flex-1 min-w-[120px] focus-visible:ring-0 focus-visible:border-0 bg-transparent text-black placeholder:text-gray-400 outline-none"
                            autoComplete="off"
                        />

                        {coverList.length > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearAllCovers();
                                }}
                                className="ml-auto text-gray-400 hover:text-black transition-colors p-1"
                                aria-label="Alle entfernen"
                                type="button"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {coverList.length > 0 && (
                        <p className="text-xs text-gray-600 mt-2 ml-1 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-600" />
                            {coverList.length} {coverList.length === 1 ? "Überzug" : "Überzüge"} hinzugefügt
                        </p>
                    )}
                </div>
                <Button
                    onClick={addCoversFromInput}
                    disabled={!newCover.trim()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg px-6 py-2.5 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-md whitespace-nowrap flex items-center gap-2"
                    type="button"
                >
                    <Plus className="w-4 h-4" />
                    Hinzufügen
                </Button>
            </div>
        </div>
    );
}
