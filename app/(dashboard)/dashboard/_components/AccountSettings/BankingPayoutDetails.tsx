'use client'
import React, { useEffect, useState } from 'react'
import { CreditCard, Shield, Save } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdatePartnerInfo } from '@/hooks/updatePartnerInfo/useUpdatePartnerInfo'
import toast from 'react-hot-toast'

export default function BankingPayoutDetails() {
  const { user, setUser } = useAuth()
  const { update, isLoading } = useUpdatePartnerInfo()

  const [formData, setFormData] = useState({
    bankName: '',
    bankNumber: '',
    bic: ''
  })

  useEffect(() => {
    if (user?.accountInfo?.bankInfo) {
      const bank = user.accountInfo.bankInfo
      setFormData({
        bankName: bank.bankName ?? '',
        bankNumber: bank.bankNumber ?? '',
        bic: bank.bic ?? ''
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveChanges = async () => {
    try {
      const res = await update({
        name: user?.name ?? undefined,
        bankName: formData.bankName,
        bankNumber: formData.bankNumber,
        bic: formData.bic
      })

      if (user && res?.user) {
        const updatedUser = res.user
        setUser({
          ...user,
          name: updatedUser.name ?? user.name,
          accountInfo: {
            ...user.accountInfo,
            bankInfo: {
              bankName: updatedUser.accountInfo?.bankInfo?.bankName ?? formData.bankName,
              bankNumber: updatedUser.accountInfo?.bankInfo?.bankNumber ?? formData.bankNumber,
              bic: updatedUser.accountInfo?.bankInfo?.bic ?? formData.bic
            },
            ...updatedUser.accountInfo
          }
        })
        setFormData({
          bankName: updatedUser.accountInfo?.bankInfo?.bankName ?? formData.bankName,
          bankNumber: updatedUser.accountInfo?.bankInfo?.bankNumber ?? formData.bankNumber,
          bic: updatedUser.accountInfo?.bankInfo?.bic ?? formData.bic
        })
      } else if (user) {
        setUser({
          ...user,
          accountInfo: {
            ...user.accountInfo,
            bankInfo: {
              bankName: formData.bankName,
              bankNumber: formData.bankNumber,
              bic: formData.bic
            }
          }
        })
      }

      toast.success('Bank- & Auszahlungsdetails erfolgreich aktualisiert')
    } catch (e: any) {
      toast.error(e?.message || 'Aktualisierung fehlgeschlagen')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-5 h-5 text-[#61A175]" />
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
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            placeholder='Mustermann GmbH'
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61A175] focus:border-[#61A175]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            IBAN
          </label>
          <input
            type="text"
            name="bankNumber"
            placeholder='DE00 0000 0000 0000 0000 00'
            value={formData.bankNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm font-mono bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61A175] focus:border-[#61A175]"
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
            className="w-full px-3 py-2 text-sm font-mono bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61A175] focus:border-[#61A175]"
          />
        </div>

        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
          <Shield className="w-4 h-4 text-[#61A175] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#61A175]">
            Ihre Bankdaten werden verschlüsselt und sicher gespeichert. Wir verwenden bankübliche Sicherheitsprotokolle zum Schutz Ihrer Finanzdaten.
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSaveChanges}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2 text-sm bg-[#61A175] text-white rounded-lg hover:bg-[#61A175]/90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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

