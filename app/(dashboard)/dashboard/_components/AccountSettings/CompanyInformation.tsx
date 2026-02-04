'use client'
import React, { useState, useEffect } from 'react'
import { Building2, Save } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdatePartnerInfo } from '@/hooks/updatePartnerInfo/useUpdatePartnerInfo'
import ProfileImage from '@/components/DashboardSettings/ProfileImage'
import toast from 'react-hot-toast'

export default function CompanyInformation() {
  const { user, setUser } = useAuth()
  const { update, isLoading } = useUpdatePartnerInfo()

  const [formData, setFormData] = useState({
    companyName: '',
    accountName: '',
    vatNumber: '',
    vatCountry: 'Germany (DE)',
    phoneNumber: '',
    email: '',
    absenderEmail: ''
  })
  
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user?.busnessName ?? '',
        accountName: user?.name ?? '',
        vatNumber: user?.accountInfo?.vat_number ?? '',
        vatCountry: user?.accountInfo?.vat_country ?? '',
        phoneNumber: user?.phone ?? '',
        email: user?.email ?? '',
        absenderEmail: user?.email ?? ''
      })
      setPreviewImageUrl(user?.image ?? null)
    }
  }, [user])

  const handleImageChange = (file: File, dataUrl: string) => {
    setSelectedImageFile(file)
    setPreviewImageUrl(dataUrl)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveChanges = async () => {
    try {
      const res = await update({
        phone: formData.phoneNumber,
        busnessName: formData.companyName,
        vatNumber: formData.vatNumber,
        vatCountry: formData.vatCountry,
        image: selectedImageFile
      })
      
      if (user) {
        const newImage = (res?.user?.image as string) || previewImageUrl || user.image || null
        setUser({
          ...user,
          phone: formData.phoneNumber,
          busnessName: formData.companyName,
          image: newImage
        })
        setPreviewImageUrl(newImage)
      }
      
      toast.success('Unternehmensinformationen erfolgreich aktualisiert')
    } catch (e: any) {
      toast.error(e?.message || 'Aktualisierung fehlgeschlagen')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Unternehmensinformationen</h2>
          <p className="text-xs text-gray-500 mt-0.5">Ihre Geschäftsdaten für Rechnungen und rechtliche Dokumentation</p>
        </div>
      </div>

      {/* Company Logo/Image */}
      <div className="mb-6">
        <ProfileImage 
          src={previewImageUrl ?? user?.image ?? null} 
          editable={true} 
          onChange={handleImageChange}
        />
        <p className="text-xs text-gray-500 text-center mt-2">Firmenlogo / Geschäftsbild</p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Firmenname / Geschäftsname
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Wellness Studio GmbH"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              USt-IdNr. / MwSt-Nummer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vatNumber"
              value={formData.vatNumber}
              onChange={handleChange}
              placeholder="DE123456789"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-gray-500 mt-0.5">Erforderlich für Bestellungen und Abrechnung innerhalb der EU</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              MwSt-Land
            </label>
            <select
              name="vatCountry"
              value={formData.vatCountry}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option>Deutschland (DE)</option>
              <option>Österreich (AT)</option>
              <option>Schweiz (CH)</option>
              <option>Frankreich (FR)</option>
              <option>Niederlande (NL)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Geschäftstelefonnummer
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+49 30 1234567"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Standard-Geschäfts-E-Mail
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            placeholder="info@wellness-studio.de"
            className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSaveChanges}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Änderungen speichern
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

