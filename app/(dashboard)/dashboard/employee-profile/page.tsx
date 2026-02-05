'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { RefreshCw, User, Mail, Shield, Camera, Edit2, Save, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { updateEmployee } from '@/apis/employeeaApis'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EmployeeData {
  id: string
  accountName: string
  employeeName: string
  email: string
  image: string | null
  jobPosition: string | null
  financialAccess: boolean
}

export default function EmployeeProfilePage() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [editedData, setEditedData] = useState<EmployeeData | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Redirect non-EMPLOYEE users immediately (silently, no error toast)
    if (user && user.role !== 'EMPLOYEE') {
      router.push('/dashboard')
      return
    }

    // Load employee data only if user is EMPLOYEE
    if (user && user.role === 'EMPLOYEE') {
      const data: EmployeeData = {
        id: user.id,
        accountName: user.accountName || '',
        employeeName: user.employeeName || '',
        email: user.email,
        image: user.image,
        jobPosition: user.jobPosition || null,
        financialAccess: user.financialAccess || false,
      }
      setEmployeeData(data)
      setEditedData(data)
      setImagePreview(user.image)
      setIsLoading(false)
    } else if (!user) {
      // User is still loading, keep loading state
      setIsLoading(true)
    }
  }, [user, router])

  const handleSwitchBackToMain = useCallback(() => {
    setShowConfirmModal(true)
  }, [])

  const confirmSwitchBack = useCallback(() => {
    localStorage.removeItem('employeeToken')
    localStorage.removeItem('currentEmployeeId')
    localStorage.removeItem('currentEmployeeData')
    
    toast.success('Zurück zum Hauptkonto', {
      icon: '↩️',
      duration: 2000,
    })
    
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }, [])

  const getInitials = useCallback((name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }, [])

  const handleEditClick = useCallback(() => {
    setIsEditing(true)
    if (employeeData) {
      setEditedData({ ...employeeData })
      setImagePreview(employeeData.image)
      setImageFile(null)
    }
  }, [employeeData])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    if (employeeData) {
      setEditedData({ ...employeeData })
      setImagePreview(employeeData.image)
      setImageFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [employeeData])

  const handleSave = useCallback(async () => {
    if (!editedData || !employeeData) return

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('accountName', editedData.accountName)
      formData.append('employeeName', editedData.employeeName)
      formData.append('email', editedData.email)
      // jobPosition is not editable, so don't send it
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await updateEmployee(employeeData.id, formData)

      // API response structure: { success: true, user: { image: "...", ... } }
      const updatedImage = response?.user?.image || response?.data?.image || response?.employee?.image || editedData.image

      const updatedData: EmployeeData = {
        ...editedData,
        image: updatedImage,
      }

      setEmployeeData(updatedData)
      setEditedData(updatedData)
      setImagePreview(updatedImage)
      
      // Update user context for real-time updates
      if (user && setUser) {
        setUser({
          ...user,
          accountName: updatedData.accountName,
          employeeName: updatedData.employeeName,
          email: updatedData.email,
          image: updatedImage,
        })
      }
      
      setIsEditing(false)
      setImageFile(null)
      toast.success('Profil erfolgreich aktualisiert')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Fehler beim Aktualisieren des Profils'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }, [editedData, employeeData, imageFile, user, setUser])

  const handleImageClick = useCallback(() => {
    if (isEditing) {
      fileInputRef.current?.click()
    }
  }, [isEditing])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Bitte wählen Sie eine Bilddatei aus')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Bildgröße darf maximal 5MB betragen')
      event.target.value = ''
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRemoveImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (editedData) {
      setEditedData({ ...editedData, image: null })
    }
  }, [editedData])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#61A175]" />
      </div>
    )
  }

  if (!employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Keine Mitarbeiterdaten gefunden</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mitarbeiterprofil</h1>
          <p className="text-sm text-gray-500 mt-1">Verwalten Sie Ihre Kontoinformationen</p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="px-5 py-2.5 cursor-pointer bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Edit2 className="w-4 h-4" />
              Bearbeiten
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-5 py-2.5 cursor-pointer bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 cursor-pointer bg-[#61A175] text-white rounded-lg text-sm font-medium hover:bg-[#519865] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Speichern...' : 'Speichern'}
              </button>
            </>
          )}
          <button
            onClick={handleSwitchBackToMain}
            className="px-5 py-2.5 cursor-pointer bg-[#61A175] text-white rounded-lg text-sm font-medium hover:bg-[#519865] transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Zurück zum Hauptkonto
          </button>
        </div>
      </div>

      {/* Single Card Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Image Section - Top */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-8 flex flex-col items-center border-b border-gray-200">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={!isEditing}
            />
            <div
              onClick={handleImageClick}
              className={`relative w-40 h-40 rounded-full overflow-hidden border-4 transition-all ${
                isEditing 
                  ? 'border-[#61A175] cursor-pointer hover:border-[#519865] hover:shadow-xl' 
                  : 'border-white shadow-lg'
              }`}
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt={editedData?.employeeName || employeeData.employeeName}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="w-12 h-12 text-white" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#61A175] via-[#519865] to-[#4a8a5a] flex items-center justify-center text-white text-5xl font-bold">
                  {getInitials(editedData?.employeeName || employeeData.employeeName)}
                </div>
              )}
            </div>
            
            {isEditing && imagePreview && (
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-red-600 transition-colors shadow-lg z-10"
                title="Bild entfernen"
              >
                ×
              </button>
            )}
          </div>
          
          {isEditing && (
            <button
              onClick={handleImageClick}
              className="mt-4 text-sm text-[#61A175] hover:text-[#519865] font-semibold transition-colors"
            >
              Bild ändern
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 lg:p-8">
          {/* Account Overview - Top Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rolle</span>
              </div>
              <p className="text-base font-semibold text-gray-900">Mitarbeiter</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
              </div>
              <p className="text-base font-semibold text-green-600">Aktiv</p>
            </div>
            <div className={`rounded-lg p-4 border ${employeeData.financialAccess ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Shield className={`w-4 h-4 ${employeeData.financialAccess ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Finanzzugriff</span>
              </div>
              <p className={`text-base font-semibold ${employeeData.financialAccess ? 'text-green-600' : 'text-gray-500'}`}>
                {employeeData.financialAccess ? 'Aktiviert' : 'Deaktiviert'}
              </p>
            </div>
          </div>

          {/* Employee Details */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Accountname
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.accountName || ''}
                    onChange={(e) => setEditedData({ ...editedData!, accountName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#61A175] focus:border-transparent transition-all"
                    placeholder="Accountname eingeben"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-900">{employeeData.accountName}</p>
                )}
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Mitarbeitername
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.employeeName || ''}
                    onChange={(e) => setEditedData({ ...editedData!, employeeName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#61A175] focus:border-transparent transition-all"
                    placeholder="Mitarbeitername eingeben"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-900">{employeeData.employeeName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-Mail-Adresse
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedData?.email || ''}
                  onChange={(e) => setEditedData({ ...editedData!, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#61A175] focus:border-transparent transition-all"
                  placeholder="E-Mail-Adresse eingeben"
                />
              ) : (
                <p className="text-sm text-gray-900">{employeeData.email}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Position
              </label>
              <p className="text-base text-gray-900">{employeeData.jobPosition || 'Nicht angegeben'}</p>
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">Position kann nicht bearbeitet werden</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Zurück zum Hauptkonto wechseln?</DialogTitle>
            <DialogDescription>
              Möchten Sie wirklich zum Hauptkonto zurückwechseln? Sie werden vom Mitarbeitermodus abgemeldet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 cursor-pointer bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Abbrechen
            </button>
            <button
              onClick={() => {
                setShowConfirmModal(false)
                confirmSwitchBack()
              }}
              className="px-4 py-2 cursor-pointer bg-[#61A175] text-white rounded-lg text-sm font-medium hover:bg-[#519865] transition-all"
            >
              Ja, zurückwechseln
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
