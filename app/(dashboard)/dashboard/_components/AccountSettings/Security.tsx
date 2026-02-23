'use client'

import React, { useState } from 'react'
import { Lock, Monitor, Smartphone } from 'lucide-react'
import toast from 'react-hot-toast'
import ChnagesPassword from './ChnagesPassword'
import SecretPasswort from './SecretPasswort'

type SecurityTab = 'change-password' | 'secret-password'

export default function Security() {
  const [activeTab, setActiveTab] = useState<SecurityTab>('change-password')

  const activeSessions = [
    {
      device: 'Desktop',
      location: 'Berlin, Germany',
      browser: 'Chrome on Windows',
      lastActive: '5 minutes ago',
      current: true,
      icon: Monitor
    },
    {
      device: 'Mobile',
      location: 'Munich, Germany',
      browser: 'Safari on iPhone',
      lastActive: '2 hours ago',
      current: false,
      icon: Smartphone
    }
  ]

  const handleTerminateSession = (device: string) => {
    console.log('Terminating session:', device)
    toast.success(`Sitzung beendet: ${device}`)
    // Add your terminate session logic here
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-[#61A175]" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Sicherheit</h2>
          <p className="text-xs text-gray-500 mt-0.5">Verwalten Sie Ihr Passwort und Ihre Sicherheitseinstellungen</p>
        </div>
      </div>



      {/* Tab buttons: Change Password / Secret Password */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('change-password')}
          className={`px-4 cursor-pointer py-2 text-sm rounded-lg transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            activeTab === 'change-password'
              ? 'bg-[#61A175] text-white hover:bg-[#61A175]/90'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Passwort ändern
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('secret-password')}
          className={`px-4 cursor-pointer py-2 text-sm rounded-lg transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            activeTab === 'secret-password'
              ? 'bg-[#61A175] text-white hover:bg-[#61A175]/90'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Secret Passwort setzen
        </button>
      </div>

      {/* Content: Change Password or Secret Password form */}
      <div className="space-y-6">
        {activeTab === 'change-password' && <ChnagesPassword />}
        {activeTab === 'secret-password' && <SecretPasswort />}

        {/* Two-Factor Authentication */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">Zwei-Faktor-Authentifizierung</h3>
              <p className="text-xs text-gray-500 mt-0.5">Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsebene hinzu</p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium whitespace-nowrap">
              Demnächst verfügbar
            </span>
          </div>
        </div>

        {/* Active Sessions */}
        {/* <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Aktive Sitzungen</h3>
          <div className="space-y-2">
            {activeSessions.map((session, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <session.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900">{session.device}</h4>
                      {session.current && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Aktuell
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{session.browser}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{session.location} • {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <button
                    onClick={() => handleTerminateSession(session.device)}
                    className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors whitespace-nowrap ml-2"
                  >
                    Beenden
                  </button>
                )}
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  )
}

