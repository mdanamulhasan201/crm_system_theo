'use client'
import React, { useState } from 'react'
import { Globe, Save } from 'lucide-react'

export default function Preferences() {
  const [language, setLanguage] = useState('Deutsch')
  const [applyToAll, setApplyToAll] = useState(false)

  const languages = [
    'Deutsch',
    'English',
    'Français',
    'Español',
    'Italiano'
  ]

  const handleSavePreferences = () => {
    console.log('Saving preferences:', { language, applyToAll })
    // Add your save logic here
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Globe className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Einstellungen</h2>
          <p className="text-xs text-gray-500 mt-0.5">Passen Sie Ihre Plattformerfahrung an</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Software-Sprache
            </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
                <div className="text-sm font-medium text-gray-900">Sprache auf alle Mitarbeiterkonten anwenden</div>
                <div className="text-xs text-gray-500">Dies aktualisiert die Spracheinstellung für alle Teammitglieder</div>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSavePreferences}
            className="w-full sm:w-auto px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Einstellungen speichern
          </button>
        </div>
      </div>
    </div>
  )
}

