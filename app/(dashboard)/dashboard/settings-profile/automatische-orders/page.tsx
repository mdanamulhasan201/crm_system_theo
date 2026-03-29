'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { getAutomatischeOrders, getAllBrand, toggleBrand } from '@/apis/setting/automatischeordersApis'
import toast from 'react-hot-toast'

interface Manufacturer {
  id: string
  name: string
  enabled: boolean
}

interface BrandItem {
  brand: string
  isActive: boolean
  isPdf: boolean
}

/** API may send real booleans or strings; keep switch in sync with GET response */
function parseApiBool(v: unknown): boolean {
  if (v === true || v === 'true' || v === 1 || v === '1') return true
  if (v === false || v === 'false' || v === 0 || v === '0') return false
  return Boolean(v)
}

export default function AutomatischeOrdersPage() {
  const router = useRouter()
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([
    { id: 'orthotech', name: 'Orthotech', enabled: true },
    { id: 'opannrit', name: 'Springer', enabled: false },
  ])
  const [brands, setBrands] = useState<BrandItem[]>([])
  const [brandsLoading, setBrandsLoading] = useState(false)
  const [newLocation, setNewLocation] = useState('')
  const [locations, setLocations] = useState<string[]>([])

  // Load all brands once on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true)
        const res = await getAllBrand()
        // { success, data: { brand, isActive, isPdf }[] }
        const rawList = Array.isArray(res?.data) ? res.data : []
        const items: BrandItem[] = rawList.map((item: Record<string, unknown>) => ({
          brand: String(item?.brand ?? '').trim(),
          isActive: parseApiBool(item?.isActive),
          isPdf: parseApiBool(item?.isPdf),
        }))
        setBrands(items)
      } catch (error) {
        console.error('Error fetching brands:', error)
      } finally {
        setBrandsLoading(false)
      }
    }

    fetchBrands()
  }, [])

  const handleBrandFieldToggle = async (index: number, field: 'isActive' | 'isPdf') => {
    const item = brands[index]
    if (!item?.brand) return
    const previousBrands = [...brands]
    const nextValue = !item[field]
    setBrands(prev =>
      prev.map((it, i) =>
        i === index ? { ...it, [field]: nextValue } : it
      )
    )
    try {
      const res = await toggleBrand({
        brand: item.brand,
        isActive: field === 'isActive' ? nextValue : item.isActive,
        isPdf: field === 'isPdf' ? nextValue : item.isPdf,
      })
      const d = res?.data as Record<string, unknown> | undefined
      if (d && typeof d === 'object') {
        setBrands(prev =>
          prev.map((it, i) =>
            i === index
              ? {
                  ...it,
                  ...(d.isActive !== undefined && { isActive: parseApiBool(d.isActive) }),
                  ...(d.isPdf !== undefined && { isPdf: parseApiBool(d.isPdf) }),
                }
              : it
          )
        )
      }
      toast.success('Marke aktualisiert.')
    } catch (error) {
      console.error('Error toggling brand:', error)
      toast.error('Fehler beim Aktualisieren.')
      setBrands(previousBrands)
    }
  }

  const handleToggleManufacturer = async (id: string) => {
    const updatedManufacturers = manufacturers.map(m =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    )
    setManufacturers(updatedManufacturers)

    // Prepare the data to send to API
    const status = {
      orthotech: updatedManufacturers.find(m => m.id === 'orthotech')?.enabled || false,
      opannrit: updatedManufacturers.find(m => m.id === 'opannrit')?.enabled || false,
    }

    try {
      await getAutomatischeOrders(status)
      toast.success('Einstellung gespeichert.')
    } catch (error) {
      console.error('Error updating automatische orders:', error)
      toast.error('Fehler beim Speichern.')
      setManufacturers(manufacturers)
    }
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
    <div className="w-full ">
      {/* Header */}
      <div className="mb-2">
          <h1 className="text-xl md:text-2xl leading-tight font-bold mb-2 text-gray-900">
            Lagereinstellungen & Auto-Bestellungen
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Konfiguration der automatischen Nachbestellung und Lagerstandorte
          </p>
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
          {/* {manufacturers.map((manufacturer, index) => (
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
          ))} */}
          {/* get all brand */}
          <div className="mt-4 border-gray-200">
            {/* <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Marken mit Auto-Bestellung (aus Einstellungen)
            </h3> */}
            {brandsLoading && (
              <p className="text-sm text-gray-500">Marken werden geladen...</p>
            )}
            {!brandsLoading && brands.length === 0 && (
              <p className="text-sm text-gray-500">Keine Marken gefunden.</p>
            )}
            {!brandsLoading && brands.length > 0 && (
              <div className="divide-y divide-gray-200">
                {brands.map((item, index) => (
                  <div
                    key={`${item.brand}-${index}`}
                    className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {item.brand || 'Ohne Namen'}
                    </span>
                    <div className="flex flex-wrap items-center gap-6 sm:justify-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Auto-Bestellung</span>
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => handleBrandFieldToggle(index, 'isActive')}
                          className="cursor-pointer"
                          aria-label="Auto-Bestellung"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">PDF</span>
                        <Switch
                          checked={item.isPdf}
                          onCheckedChange={() => handleBrandFieldToggle(index, 'isPdf')}
                          className="cursor-pointer"
                          aria-label="PDF (isPdf)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>



    </div>
  )
}
