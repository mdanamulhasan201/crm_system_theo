'use client'
import { FaPen, FaEraser } from 'react-icons/fa'

interface DrawingToolbarProps {
    drawingMode: 'pen' | 'eraser'
    setDrawingMode: (mode: 'pen' | 'eraser') => void
    brushSize: number
    setBrushSize: (size: number) => void
    brushColor: string
    setBrushColor: (color: string) => void
    onExitZoom: () => void
}

export default function DrawingToolbar({
    drawingMode,
    setDrawingMode,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    onExitZoom
}: DrawingToolbarProps) {
    return (
        <div className="py-4">
            <div className="flex flex-wrap justify-center items-center gap-3 lg:gap-4">
                {/* Exit Zoom Button */}
                <button
                    onClick={onExitZoom}
                    className="bg-gradient-to-r cursor-pointer from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2 py-2 rounded-lg transition-all flex items-center gap-2 text-sm shadow transform"
                    title="Zoom-Modus beenden"
                >
                    <span className="text-sm">✕</span>
                    <span className="hidden sm:inline">Zoom beenden</span>
                </button>
                
                {/* Divider */}
                <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                
                {/* Drawing Tools */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => setDrawingMode('pen')}
                        className={`px-2 py-2 cursor-pointer rounded-md transition-all flex items-center gap-2 text-sm ${
                            drawingMode === 'pen' 
                                ? 'bg-[#4A8A5F] text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                        title="Stiftwerkzeug"
                    >
                        <FaPen />
                        <span className="hidden sm:inline">Stift</span>
                    </button>
                    
                    <button
                        onClick={() => setDrawingMode('eraser')}
                        className={`px-2 py-2 cursor-pointer rounded-md transition-all flex items-center gap-2 text-sm ${
                            drawingMode === 'eraser' 
                                ? 'bg-[#4A8A5F] text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                        title="Radiergummi-Werkzeug"
                    >
                        <FaEraser />
                        <span className="hidden sm:inline">Radiergummi</span>
                    </button>
                </div>
                
                {/* Divider */}
                <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                
                {/* Brush Size Control */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-2 border border-gray-200">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Größe:</label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-24 lg:w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 w-8 text-center bg-white px-2 py-1 rounded border border-gray-200">
                        {brushSize}
                    </span>
                </div>
                
                {/* Color Picker - Only show for pen mode */}
                {drawingMode === 'pen' && (
                    <>
                        <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-2 border border-gray-200">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Farbe:</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={brushColor}
                                    onChange={(e) => setBrushColor(e.target.value)}
                                    className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                    title="Pinselfarbe auswählen"
                                />
                                <div 
                                    className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm"
                                    style={{ backgroundColor: brushColor }}
                                    title={`Aktuelle Farbe: ${brushColor}`}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

