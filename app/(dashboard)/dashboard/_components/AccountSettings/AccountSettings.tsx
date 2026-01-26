'use client'
import React, { useState } from 'react'
import { Building2 } from 'lucide-react'
import AddressesLocations from './AddressesLocations'

export default function AccountSettings() {
  const [formData, setFormData] = useState({
    companyName: 'Wellness Studio GmbH',
    vatNumber: 'DE123456789',
    vatCountry: 'Germany (DE)',
    phoneNumber: '+49 30 1234567',
    email: 'info@wellness-studio.de'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveChanges = () => {
    console.log('Saving changes:', formData)
    // Add your save logic here
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Company Information Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
            <p className="text-xs text-gray-500">Your business details used for invoicing and legal documentation</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Company / Business Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                VAT / IVA Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-0.5">Required for orders and billing within the EU</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                VAT Country
              </label>
              <select
                name="vatCountry"
                value={formData.vatCountry}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Germany (DE)</option>
                <option>Austria (AT)</option>
                <option>Switzerland (CH)</option>
                <option>France (FR)</option>
                <option>Netherlands (NL)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Business Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Default Business Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveChanges}
              className="px-5 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              💾 Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Addresses & Locations Section */}
      <AddressesLocations />
    </div>
  )
}
