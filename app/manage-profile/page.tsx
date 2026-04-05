'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User, Eye, EyeOff, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import logo from '@/public/images/logo.png'
import { getProfileList, logicalLogin } from '@/apis/authApis'
import { useAuth } from '@/contexts/AuthContext'
import { isNetworkError } from '@/lib/networkError'
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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
    dragFree: false,
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onEmblaSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onEmblaSelect()
    emblaApi.on('select', onEmblaSelect)
    return () => {
      emblaApi.off('select', onEmblaSelect)
    }
  }, [emblaApi, onEmblaSelect])

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
      if (isNetworkError(e) || (e && (e as { isNetworkError?: boolean }).isNetworkError)) {
        return
      }
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
  const isPartner = (p: ProfileItem) => p.role === 'PARTNER'

  // Partner(s) first, then others
  const sortedProfiles = [...profiles].sort((a, b) => (isPartner(a) ? 0 : 1) - (isPartner(b) ? 0 : 1))

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1219] bg-linear-to-b from-[#111827] via-[#0f1219] to-[#0b0e14] flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8 md:px-5 md:py-10 lg:px-6 lg:py-12 xl:px-8 xl:py-14 2xl:px-10 2xl:py-16 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-12 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute top-4 left-4 sm:top-5 sm:left-5 md:top-6 md:left-6 lg:top-8 lg:left-8 xl:top-10 xl:left-10 2xl:top-12 2xl:left-12">
        <Image
          src={logo}
          alt="Logo"
          width={100}
          height={100}
          className="h-12 w-auto sm:h-14 md:h-16 lg:h-18 xl:h-20 2xl:h-24"
          priority
        />
      </div>

      <div className="flex flex-col items-center justify-center text-center w-full max-w-[92vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl relative z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold tracking-tight text-white mb-2 sm:mb-3">
          Benutzer auswählen!
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-300/80 mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-14 2xl:mb-16">
          Bitte wählen Sie ein Profil, um fortzufahren
        </p>

        <div className="w-full mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-14 2xl:mb-16 px-1 sm:px-2 md:px-3 lg:px-4 xl:px-5 2xl:px-6 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm shadow-[0_12px_45px_rgba(0,0,0,0.25)] py-5 sm:py-6 md:py-7 lg:py-8">
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full bg-slate-900/80 border border-white/15 flex items-center justify-center text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 -translate-x-0.5 sm:-translate-x-1 md:-translate-x-1.5 lg:-translate-x-2 xl:-translate-x-2 2xl:-translate-x-3"
              aria-label="Vorherige Profile"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" strokeWidth={2} />
            </button>

            <div className="overflow-hidden flex-1 mx-7 sm:mx-9 md:mx-11 lg:mx-14 xl:mx-16 2xl:mx-20 min-w-0" ref={emblaRef}>
              <div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 2xl:gap-6 touch-pan-y">
                {sortedProfiles.map((profile) => {
                  const partner = isPartner(profile)
                  return (
                    <div
                      key={profile.id}
                      className={`min-w-0 flex flex-col items-center justify-center last:mr-2 sm:last:mr-3 md:last:mr-4 lg:last:mr-5 xl:last:mr-6 2xl:last:mr-6 ${partner
                        ? 'flex-[0_0_calc(1.4*(100%-0.5rem)/2)] sm:flex-[0_0_calc(1.4*(100%-0.75rem)/2)] md:flex-[0_0_calc(1.4*(100%-2rem)/3)] lg:flex-[0_0_calc(1.4*(100%-3.75rem)/4)] xl:flex-[0_0_calc(1.4*(100%-6rem)/5)] 2xl:flex-[0_0_calc(1.4*(100%-7.5rem)/6)]'
                        : 'flex-[0_0_calc((100%-0.5rem)/2)] sm:flex-[0_0_calc((100%-0.75rem)/2)] md:flex-[0_0_calc((100%-2rem)/3)] lg:flex-[0_0_calc((100%-3.75rem)/4)] xl:flex-[0_0_calc((100%-6rem)/5)] 2xl:flex-[0_0_calc((100%-7.5rem)/6)]'
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleProfileClick(profile)}
                        disabled={submitting}
                        className="group cursor-pointer flex flex-col items-center justify-center gap-2 sm:gap-2.5 md:gap-3 w-full max-w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] rounded-lg sm:rounded-xl lg:rounded-xl xl:rounded-2xl transition-all duration-200 hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed text-center"
                      >
                        <div className={`relative bg-slate-700/70 rounded-lg sm:rounded-xl lg:rounded-xl xl:rounded-2xl flex items-center justify-center text-white overflow-hidden border border-white/10 group-hover:border-white/50 group-hover:bg-slate-600/70 transition-all duration-200 shadow-lg md:shadow-xl w-full aspect-square ${partner ? 'ring-2 ring-white/40' : ''}`}>
                          {profile.image ? (
                            <Image
                              src={profile.image}
                              alt={displayName(profile)}
                              width={280}
                              height={280}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <User
                              className={`mx-auto block ${partner ? 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24' : 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14'}`}
                              strokeWidth={1.5}
                            />
                          )}
                          {profile.hasPassword && (
                            <span className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/45 border border-white/15">
                              <Lock className="h-3.5 w-3.5 text-white/90" strokeWidth={2} />
                            </span>
                          )}
                        </div>
                        <span className={`text-slate-300 group-hover:text-white transition-colors duration-200 w-full max-w-full truncate block text-center ${partner ? 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-semibold' : 'text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl'}`}>
                          {displayName(profile)}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full bg-slate-900/80 border border-white/15 flex items-center justify-center text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 translate-x-0.5 sm:translate-x-1 md:translate-x-1.5 lg:translate-x-2 xl:translate-x-2 2xl:translate-x-3"
              aria-label="Nächste Profile"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" strokeWidth={2} />
            </button>
          </div>
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
                  className="flex-1 cursor-pointer py-2 px-4 border border-gray-500 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-4 cursor-pointer bg-white text-black rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
