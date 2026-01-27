'use client'
import { useState, useEffect, useCallback } from 'react'
import { MapPin, Edit, Trash2, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createLocation, getAllLocations, updateLocation, deleteLocation } from "@/apis/setting/locationManagementApis"
import toast from "react-hot-toast"

interface Location {
  id: string
  address: string
  description: string
  isPrimary: boolean
}

export default function AddressesLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    address: "",
    description: "",
    isPrimary: false,
  })

  // Fetch locations
  const fetchLocations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getAllLocations(1, 100)
      
      // Check if response indicates success
      if (response?.success === false) {
        const errorMessage = response?.message || response?.error || "Fehler beim Laden der Standorte"
        console.error("API Error:", response)
        toast.error(errorMessage)
        setError(errorMessage)
        setLocations([])
        return
      }
      
      // Handle different response structures
      if (response?.data) {
        // Check if data is an array
        if (Array.isArray(response.data)) {
          setLocations(response.data)
          setError(null)
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Handle nested data structure
          setLocations(response.data.data)
          setError(null)
        } else {
          console.warn("Unexpected response structure:", response)
          setLocations([])
        }
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        setLocations(response)
        setError(null)
      } else {
        console.warn("No data found in response:", response)
        setLocations([])
      }
    } catch (error: any) {
      console.error("Error fetching locations:", error)
      
      // Handle different error types
      let errorMessage = "Fehler beim Laden der Standorte"
      
      if (error?.response) {
        const status = error.response.status
        const data = error.response.data
        
        if (status === 500) {
          errorMessage = data?.message || data?.error || "Serverfehler. Bitte versuchen Sie es später erneut."
        } else if (status === 404) {
          errorMessage = "Endpoint nicht gefunden. Bitte kontaktieren Sie den Support."
        } else if (status === 403) {
          errorMessage = "Sie haben keine Berechtigung für diese Aktion."
        } else if (status === 401) {
          errorMessage = "Sie sind nicht autorisiert. Bitte melden Sie sich erneut an."
        } else {
          errorMessage = data?.message || data?.error || `Fehler (${status}): Beim Laden der Standorte ist ein Fehler aufgetreten.`
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      setError(errorMessage)
      setLocations([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  // Handle form input change
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      address: "",
      description: "",
      isPrimary: false,
    })
    setEditingLocation(null)
  }

  // Open add modal
  const handleAddLocation = () => {
    resetForm()
    setIsModalOpen(true)
  }

  // Open edit modal
  const handleEditLocation = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      address: location.address,
      description: location.description,
      isPrimary: location.isPrimary,
    })
    setIsModalOpen(true)
  }

  // Open delete modal
  const handleDeleteClick = (location: Location) => {
    setDeletingLocation(location)
    setIsDeleteModalOpen(true)
  }

  // Handle save (create or update)
  const handleSave = async () => {
    if (!formData.address.trim()) {
      toast.error("Adresse ist erforderlich")
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        address: formData.address.trim(),
        description: formData.description.trim(),
        isPrimary: formData.isPrimary,
      }

      if (editingLocation) {
        // Update existing location
        await updateLocation(editingLocation.id, payload)
        toast.success("Standort erfolgreich aktualisiert")
      } else {
        // Create new location
        await createLocation(payload)
        toast.success("Standort erfolgreich hinzugefügt")
      }

      setIsModalOpen(false)
      resetForm()
      await fetchLocations()
    } catch (error: any) {
      console.error("Error saving location:", error)
      let errorMessage = "Fehler beim Speichern"
      
      if (error?.response) {
        const status = error.response.status
        const data = error.response.data
        
        if (status === 500) {
          errorMessage = data?.message || data?.error || "Serverfehler. Bitte versuchen Sie es später erneut."
        } else {
          errorMessage = data?.message || data?.error || `Fehler beim Speichern (${status})`
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deletingLocation) return

    try {
      setIsDeleting(true)
      await deleteLocation(deletingLocation.id)
      toast.success("Standort erfolgreich gelöscht")
      setIsDeleteModalOpen(false)
      setDeletingLocation(null)
      await fetchLocations()
    } catch (error: any) {
      console.error("Error deleting location:", error)
      let errorMessage = "Fehler beim Löschen"
      
      if (error?.response) {
        const status = error.response.status
        const data = error.response.data
        
        if (status === 500) {
          errorMessage = data?.message || data?.error || "Serverfehler. Bitte versuchen Sie es später erneut."
        } else {
          errorMessage = data?.message || data?.error || `Fehler beim Löschen (${status})`
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
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
            <Plus className="w-4 h-4" />
            <span className="font-medium">Standort hinzufügen</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="mt-3 p-2.5 sm:p-3 border border-gray-200 rounded-lg animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error && locations.length === 0 ? (
          // Error State
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mt-3">
            <MapPin className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 font-medium mb-1 text-sm">Fehler beim Laden der Standorte</p>
            <p className="text-red-500 text-xs mb-3">{error}</p>
            <Button
              onClick={() => {
                setError(null)
                fetchLocations()
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 h-auto"
            >
              Erneut versuchen
            </Button>
          </div>
        ) : locations.length === 0 ? (
          // Empty State
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center mt-3">
            <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm mb-3">Noch keine Standorte hinzugefügt</p>
            <Button
              onClick={handleAddLocation}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 h-auto"
            >
              <Plus className="w-3 h-3 mr-1" />
              Ersten Standort hinzufügen
            </Button>
          </div>
        ) : (
          // Locations List
          <div className="space-y-2">
            {locations.map((location) => (
              <div 
                key={location.id}
                className="mt-3 p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-xs sm:text-sm text-gray-900">
                        {location.description || "Location"}
                      </span>
                      {location.isPrimary && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          Hauptstandort
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{location.address}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEditLocation(location)}
                      className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      aria-label="Edit location"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(location)}
                      className="p-1 sm:p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      aria-label="Delete location"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open)
        if (!open) {
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Location bearbeiten" : "Neuen Standort hinzufügen"}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? "Aktualisieren Sie die Standortinformationen"
                : "Fügen Sie einen neuen Geschäftsstandort oder Lieferadresse hinzu"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                placeholder="z.B. Friedrichstraße 123, 10117 Berlin, Germany"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="z.B. Headquarters, Munich Branch"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full min-h-[80px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={formData.isPrimary}
                onChange={(e) => handleInputChange("isPrimary", e.target.checked)}
              />
              <Label
                htmlFor="isPrimary"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Als primären Standort festlegen
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                resetForm()
              }}
              disabled={isSaving}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.address.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving
                ? editingLocation
                  ? "Speichern..."
                  : "Hinzufügen..."
                : editingLocation
                  ? "Aktualisieren"
                  : "Hinzufügen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Standort löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diesen Standort löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          {deletingLocation && (
            <div className="py-4">
              <p className="font-semibold text-black mb-1 text-sm">
                {deletingLocation.description || "Location"}
              </p>
              <p className="text-xs text-gray-600">{deletingLocation.address}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setDeletingLocation(null)
              }}
              disabled={isDeleting}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Löschen..." : "Ja, löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

