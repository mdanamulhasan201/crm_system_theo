import React from 'react';

export default function EinmaligeVersorgungContent() {
    return (
        <div className="mb-6">
            <div className="mb-4">
                {/* <h3 className="text-base font-semibold text-gray-700 mb-3">Einmalige Versorgung konfigurieren</h3> */}
                <p className="text-sm text-gray-600">
                    Hier können Sie eine einmalige Versorgung für diesen speziellen Fall definieren.
                </p>
            </div>

            {/* Rohling / Fräsblock Selection */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rohling / Fräsblock
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent">
                    <option value="">Auswählen...</option>
                    <option value="rohling1">Rohling 1</option>
                    <option value="rohling2">Rohling 2</option>
                    <option value="rohling3">Rohling 3</option>
                </select>
            </div>

            {/* Versorgungsname */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Versorgungsname
                </label>
                <input
                    type="text"
                    placeholder="z.B. Sonderanfertigung für..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                />
            </div>

            {/* Menge */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menge
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent">
                    <option value="1">1 Paar</option>
                    <option value="2">2 Paar</option>
                    <option value="3">3 Paar</option>
                </select>
            </div>

            {/* Materialien */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materialien
                </label>
                <input
                    type="text"
                    placeholder="Enter oder Komma zum Hinzufügen"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Drücken Sie Enter, um mehrere Materialien hinzuzufügen</p>
            </div>
        </div>
    );
}
