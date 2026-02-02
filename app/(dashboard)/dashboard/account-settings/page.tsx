'use client'
import React from 'react'
import CompanyInformation from '../_components/AccountSettings/CompanyInformation'
import AddressesLocations from '../_components/AccountSettings/AddressesLocations'
import EmployeeAccounts from '../_components/AccountSettings/EmployeeAccounts'
import Preferences from '../_components/AccountSettings/Preferences'
import BankingPayoutDetails from '../_components/AccountSettings/BankingPayoutDetails'
import Security from '../_components/AccountSettings/Security'
import TaxSettings from '../_components/AccountSettings/TaxSettings'
import { Copy } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AccountSettingsPage() {
  const { user } = useAuth()
  
  const copyPartnerId = () => {
    const partnerId = user?.accountInfo?.barcodeLabel ?? user?.id ?? 'N/A'
    navigator.clipboard.writeText(partnerId)
    toast.success('Partner-ID in Zwischenablage kopiert')
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4'>
            <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Kontoeinstellungen</h1>
              <span className='px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm rounded-full font-medium whitespace-nowrap'>
                ⓘ Hauptgeschäftskonto
              </span>
            </div>
            {user?.accountInfo?.barcodeLabel && (
              <div className='flex items-center gap-1.5 sm:gap-2'>
                <span className='text-xs sm:text-sm text-gray-500'>Partner-ID</span>
                <span className='font-mono text-sm sm:text-base font-semibold text-gray-900'>
                  {user.accountInfo.barcodeLabel}
                </span>
                <button
                  onClick={copyPartnerId}
                  className="p-1 sm:p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="Copy Partner ID"
                >
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
          <p className='mt-2 text-xs sm:text-sm text-gray-600 max-w-2xl'>
            Sie haben volle Kontrolle über Ihr Geschäftskonto, einschließlich Unternehmenseinstellungen, Abrechnung, Mitarbeiterverwaltung und Sicherheitseinstellungen.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
          {/* Left Column */}
          <div className='space-y-4 sm:space-y-6'>
            <CompanyInformation />
            <AddressesLocations />
            <BankingPayoutDetails />
            <TaxSettings />
          </div>
          
          {/* Right Column */}
          <div className='space-y-4 sm:space-y-6'>
            <EmployeeAccounts />
            <Preferences />
            <Security />
          </div>
        </div>
      </div>
    </div>
  )
}
