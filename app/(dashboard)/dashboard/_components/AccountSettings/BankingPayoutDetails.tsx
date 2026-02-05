'use client'
import React, { useState } from 'react'
import { CreditCard, Shield, Save } from 'lucide-react'

export default function BankingPayoutDetails() {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    iban: '',
    bic: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveChanges = () => {
    console.log('Saving banking details:', formData)
    // Add your save logic here
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Bank- & Auszahlungsdetails</h2>
          <p className="text-xs text-gray-500 mt-0.5">Wird für Auszahlungen und Abrechnungen von FeetFirst verwendet.</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Kontoinhaber
          </label>
          <input
            type="text"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleChange}
            placeholder='Mustermann GmbH'
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            IBAN
          </label>
          <input
            type="text"
            name="iban"
            placeholder='DE00 0000 0000 0000 0000 00'
            value={formData.iban}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm font-mono bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            BIC <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            name="bic"
            value={formData.bic}
            placeholder='COBADEFFXXX'
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm font-mono bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
          <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-green-800">
            Ihre Bankdaten werden verschlüsselt und sicher gespeichert. Wir verwenden bankübliche Sicherheitsprotokolle zum Schutz Ihrer Finanzdaten.
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSaveChanges}
            className="w-full sm:w-auto px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Änderungen speichern
          </button>
        </div>
      </div>
    </div>
  )
}

