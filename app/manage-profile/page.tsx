'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User, Eye, EyeOff } from 'lucide-react'
import logo from '@/public/images/logo.png'
import { getProfileList, logicalLogin } from '@/apis/authApis'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export interface ProfileItem {
  id: string
  image: string | null
  role: string
  busnessName: string | null
  employeeName: string | null
  hasPassword: boolean
}

interface ProfileListResponse {
  success: boolean
  message: string
  data: ProfileItem[]
  busnessInfo?: { name: string; image: string | null }
}

export default function ManageProfilePage() {
  const router = useRouter()
  const { login } = useAuth()
  const [profiles, setProfiles] = useState<ProfileItem[]>([])
  const [busnessInfo, setBusnessInfo] = useState<{ name: string; image: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordModal, setPasswordModal] = useState<ProfileItem | null>(null)
  const [password, setPassword] = useState('')
  const [showPasswordInModal, setShowPasswordInModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.replace('/login')
      return
    }
    loadProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount when token exists
  }, [router])

  const loadProfiles = async () => {
    try {
      setLoading(true)
      const res = await getProfileList() as ProfileListResponse
      if (res.success && res.data) {
        setProfiles(res.data)
        if (res.busnessInfo) setBusnessInfo(res.busnessInfo)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load profiles'
      toast.error(msg)
      router.replace('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileClick = (profile: ProfileItem) => {
    if (profile.hasPassword) {
      setPasswordModal(profile)
      setPassword('')
    } else {
      doLogicalLogin(profile.id, profile.role)
    }
  }

  const doLogicalLogin = async (id: string, role: string, pwd?: string) => {
    setSubmitting(true)
    try {
      const res = await logicalLogin(id, role, pwd) as {
        success: boolean
        message?: string
        token?: string
        data?: unknown
      }
      if (res.success && res.token) {
        localStorage.setItem('token', res.token)
        setPasswordModal(null)
        setPassword('')
        setShowPasswordInModal(false)
        await login(res.token)
        toast.success(res.message || 'Login successful')
        router.push('/dashboard')
      } else {
        throw new Error(res.message || 'Login failed')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordModal) return
    doLogicalLogin(passwordModal.id, passwordModal.role, password)
  }

  const displayName = (p: ProfileItem) => p.busnessName || p.employeeName || p.role || 'Profile'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4 py-8 relative">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Image
          src={logo}
          alt="Logo"
          width={100}
          height={100}
          className="h-16 w-auto sm:h-16"
          priority
        />
      </div>

      <div className="flex flex-col items-center justify-center text-center max-w-4xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-10 sm:mb-14">
          Who&apos;s watching?
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => handleProfileClick(profile)}
              disabled={submitting}
              className="group cursor-pointer flex flex-col items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] rounded-lg transition-transform hover:scale-105 active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gray-700 rounded-lg flex items-center justify-center text-white overflow-hidden border-2 border-transparent group-hover:border-white transition-all duration-200 shadow-lg">
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt={displayName(profile)}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" strokeWidth={1.5} />
                )}
              </div>
              <span className="text-gray-400 text-sm sm:text-base group-hover:text-white transition-colors duration-200 text-center max-w-32 truncate">
                {displayName(profile)}
              </span>
              {profile.hasPassword && (
                <span className="text-xs text-gray-500">Passwort erforderlich</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Password modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-medium text-white mb-2">Profil auswählen</h2>
            <p className="text-gray-400 text-sm mb-4">
              {displayName(passwordModal)} – Passwort eingeben
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <div className="relative mb-4">
                <input
                  type={showPasswordInModal ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 pr-10 border border-gray-600 rounded-md bg-[#141414] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordInModal((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                  aria-label={showPasswordInModal ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPasswordInModal ? (
                    <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModal(null)
                    setPassword('')
                    setShowPasswordInModal(false)
                  }}
                  className="flex-1 py-2 px-4 border border-gray-500 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Wird geladen...' : 'Anmelden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
