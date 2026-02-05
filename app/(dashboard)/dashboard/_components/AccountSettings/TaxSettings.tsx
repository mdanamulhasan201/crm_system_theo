'use client'
import React, { useState, useEffect } from 'react'
import { Percent, Plus, Edit2, Trash2, Save, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface TaxRate {
  id: string
  name: string
  rate: number
  description: string
  isDefault: boolean
}

// Tax rates configuration by country
const getTaxRatesByCountry = (country: string | null | undefined): TaxRate[] | null => {
  if (!country) return null

  // Germany (Deutschland)
  if (country.includes('Deutschland') || country.includes('Germany') || country.includes('(DE)')) {
    return [
      {
        id: '1',
        name: 'Standard VAT',
        rate: 19,
        description: 'Standard German VAT rate',
        isDefault: true
      },
      {
        id: '2',
        name: 'Reduced VAT',
        rate: 7,
        description: 'Reduced VAT rate for specific goods',
        isDefault: false
      },
      {
        id: '3',
        name: 'Tax Free',
        rate: 0,
        description: 'No VAT applied',
        isDefault: false
      }
    ]
  }

  // Austria (Österreich)
  if (country.includes('Österreich') || country.includes('Austria') || country.includes('(AT)')) {
    return [
      {
        id: '1',
        name: 'Umsatzsteuer (USt)',
        rate: 20,
        description: 'Normalsteuersatz',
        isDefault: true
      }
    ]
  }

  // Italy (Italien)
  if (country.includes('Italien') || country.includes('Italy') || country.includes('(IT)')) {
    return [
      {
        id: '1',
        name: 'Mehrwertsteuer (IVA)',
        rate: 22,
        description: 'Standard',
        isDefault: true
      },
      {
        id: '2',
        name: 'Ermäßigt',
        rate: 10,
        description: 'Ermäßigt',
        isDefault: false
      },
      {
        id: '3',
        name: 'Stark ermäßigt',
        rate: 4,
        description: 'Stark ermäßigt',
        isDefault: false
      }
    ]
  }

  // Country not configured
  return null
}

export default function TaxSettings() {
  const { user } = useAuth()
  const vatCountry = user?.accountInfo?.vat_country
  
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [hasData, setHasData] = useState(true)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaxRate, setNewTaxRate] = useState({
    name: '',
    rate: '',
    description: ''
  })

  // Update tax rates when vat_country changes
  useEffect(() => {
    const rates = getTaxRatesByCountry(vatCountry)
    if (rates) {
      setTaxRates(rates)
      setHasData(true)
    } else {
      setTaxRates([])
      setHasData(false)
    }
  }, [vatCountry])

  const handleAddTaxRate = () => {
    if (newTaxRate.name && newTaxRate.rate) {
      const newRate: TaxRate = {
        id: Date.now().toString(),
        name: newTaxRate.name,
        rate: parseFloat(newTaxRate.rate),
        description: newTaxRate.description,
        isDefault: false
      }
      setTaxRates([...taxRates, newRate])
      setNewTaxRate({ name: '', rate: '', description: '' })
      setShowAddForm(false)
    }
  }

  const handleDeleteTaxRate = (id: string) => {
    setTaxRates(taxRates.filter(rate => rate.id !== id))
  }

  const handleSetDefault = (id: string) => {
    setTaxRates(taxRates.map(rate => ({
      ...rate,
      isDefault: rate.id === id
    })))
  }

  const handleSaveSettings = () => {
    console.log('Saving tax settings:', taxRates)
    // Add your save logic here
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">UST und Steuersätze</h2>
            <p className="text-xs text-gray-500 mt-0.5">Verwalten Sie Ihre Mehrwertsteuersätze</p>
          </div>
        </div>
        {/* <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Steuersatz hinzufügen
        </button> */}
      </div>

      {/* Add Tax Rate Form */}
      {showAddForm && (
        <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Neuer Steuersatz</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={newTaxRate.name}
                onChange={(e) => setNewTaxRate({ ...newTaxRate, name: e.target.value })}
                placeholder="z.B. Standard VAT"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Steuersatz (%)
              </label>
              <input
                type="number"
                value={newTaxRate.rate}
                onChange={(e) => setNewTaxRate({ ...newTaxRate, rate: e.target.value })}
                placeholder="19"
                step="0.01"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Beschreibung
            </label>
            <input
              type="text"
              value={newTaxRate.description}
              onChange={(e) => setNewTaxRate({ ...newTaxRate, description: e.target.value })}
              placeholder="Beschreibung des Steuersatzes"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddTaxRate}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Hinzufügen
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewTaxRate({ name: '', rate: '', description: '' })
              }}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Tax Rates List */}
      {hasData ? (
        <div className="space-y-2">
          {taxRates.map((rate) => (
            <div
              key={rate.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-gray-900">{rate.name}</h3>
                  {rate.isDefault && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Standard
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{rate.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{rate.rate}%</div>
                </div>
                <div className="flex items-center gap-1">
                  {!rate.isDefault && (
                    <button
                      onClick={() => handleSetDefault(rate.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Als Standard festlegen"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTaxRate(rate.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    title="Löschen"
                    disabled={rate.isDefault}
                  >
                    <Trash2 className={`w-4 h-4 ${rate.isDefault ? 'text-gray-300' : 'text-red-500'}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 border border-gray-200 rounded-lg bg-gray-50">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">Daten nicht gefunden</p>
          <p className="text-xs text-gray-500 text-center">
            Für das ausgewählte Land ({vatCountry || 'Nicht festgelegt'}) sind keine Steuersätze konfiguriert.
          </p>
        </div>
      )}

      {hasData && (
        <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
          <button
            onClick={handleSaveSettings}
            className="w-full sm:w-auto px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Einstellungen speichern
          </button>
        </div>
      )}
    </div>
  )
}

