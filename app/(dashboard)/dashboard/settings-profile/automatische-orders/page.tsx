'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface Manufacturer {
  id: string
  name: string
  enabled: boolean
}

export default function AutomatischeOrdersPage() {
  const router = useRouter()
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([
    { id: 'orthotech', name: 'Orthotech', enabled: true },
    { id: 'spannrit', name: 'Spannrit', enabled: false },
  ])
  const [newLocation, setNewLocation] = useState('')
  const [locations, setLocations] = useState<string[]>([])

  const handleToggleManufacturer = (id: string) => {
    setManufacturers(manufacturers.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ))
  }

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      setLocations([...locations, newLocation.trim()])
      setNewLocation('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddLocation()
    }
  }

  return (
    <div className="w-full px-5 py-6 space-y-6 mb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="flex items-center gap-2 cursor-pointer"
          size="icon"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Lagereinstellungen & Auto-Bestellungen
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Konfiguration der automatischen Nachbestellung und Lagerstandorte
          </p>
        </div>
      </div>

      {/* Automatic Ordering by Manufacturer Section */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Automatische Bestellung nach Hersteller
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Aktivieren Sie die automatische Nachbestellung für bestimmte Hersteller
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {manufacturers.map((manufacturer, index) => (
            <div key={manufacturer.id}>
              <div className="flex items-center justify-between py-4">
                <span className="text-base font-medium text-gray-900">
                  {manufacturer.name}
                </span>
                <Switch
                  checked={manufacturer.enabled}
                  onCheckedChange={() => handleToggleManufacturer(manufacturer.id)}
                  className="cursor-pointer"
                />
              </div>
              {index < manufacturers.length - 1 && (
                <hr className="border-gray-200" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Warehouse Locations Section */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Lagerstandorte
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Verwalten Sie Ihre Lagerstandorte und deren Status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Neuer Lagerstandort..."
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleAddLocation}
              className="bg-primary text-white hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
          
          {locations.length > 0 && (
            <div className="mt-4 space-y-2">
              {locations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <span className="text-sm text-gray-900">{location}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
