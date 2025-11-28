import React from 'react'

type MaterialienInputProps = {
    materialien: string[]
    inputValue: string
    onInputChange: (value: string) => void
    onAdd: () => void
    onRemove: (index: number) => void
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function MaterialienInput({
    materialien,
    inputValue,
    onInputChange,
    onAdd,
    onRemove,
    onKeyDown,
}: MaterialienInputProps) {
    return (
        <div>
            <label className="font-bold mb-2 block">Materialien</label>

            {materialien.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {materialien.map((material, index) => (
                        <div
                            key={`${material}-${index}`}
                            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                        >
                            <span>{material}</span>
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="text-blue-600 hover:text-blue-900 font-bold"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Material eingeben (Enter oder Komma drücken zum Hinzufügen)"
                    className="border p-2 rounded flex-1"
                />
                <button
                    type="button"
                    onClick={onAdd}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                    Hinzufügen
                </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
                Drücken Sie Enter oder Komma nach jedem Material
            </p>
        </div>
    )
}

