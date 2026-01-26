'use client'
import React from 'react'
import { MapPin, Edit } from 'lucide-react'

export default function AddressesLocations() {
  const locations = [
    {
      name: 'Headquarters',
      address: 'Friedrichstraße 123, 10117 Berlin, Germany',
      isPrimary: true
    }
  ]

  const handleAddLocation = () => {
    console.log('Add new location')
    // Add your add location logic here
  }

  const handleEditLocation = (locationName: string) => {
    console.log('Edit location:', locationName)
    // Add your edit location logic here
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Adressen & Standorte</h2>
            <p className="text-xs text-gray-500 mt-0.5">Verwalten Sie Ihre Geschäftsstandorte und Lieferadressen</p>
          </div>
        </div>
        <button 
          onClick={handleAddLocation}
          className="w-full sm:w-auto px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <span className="text-lg">+</span>
            <span className="font-medium">Standort hinzufügen</span>
        </button>
      </div>

      <div className="space-y-2">
        {locations.map((location, index) => (
          <div 
            key={index}
            className="mt-3 p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-xs sm:text-sm text-gray-900">{location.name}</span>
                  {location.isPrimary && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      Hauptstandort
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 break-words">{location.address}</p>
              </div>
              <button 
                onClick={() => handleEditLocation(location.name)}
                className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

