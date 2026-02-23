'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { setSecretPassword } from '@/apis/authApis'
import toast from 'react-hot-toast'

interface SecretPasswordFormData {
  password: string
  confirmPassword: string
}

export default function SecretPasswort() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SecretPasswordFormData>()

  const onSubmit = async (data: SecretPasswordFormData) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast.error('Passwörter stimmen nicht überein')
        return
      }

      setIsLoading(true)
      const response = await setSecretPassword(data.password)
      toast.success(response?.message || 'Secret Passwort erfolgreich gesetzt')
      reset()
    } catch (error) {
      console.error('Error setting secret password:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Setzen des Secret Passworts')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Secret Passwort
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register('password', {
              required: 'Secret Passwort ist erforderlich',
              minLength: {
                value: 6,
                message: 'Passwort muss mindestens 6 Zeichen lang sein'
              }
            })}
            className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61A175] focus:border-[#61A175]"
            placeholder="Secret Passwort eingeben"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Secret Passwort bestätigen
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register('confirmPassword', {
              required: 'Bitte bestätigen Sie das Secret Passwort'
            })}
            className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61A175] focus:border-[#61A175]"
            placeholder="Secret Passwort bestätigen"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto px-5 py-2 text-sm bg-[#61A175] text-white rounded-lg hover:bg-[#61A175]/90 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Wird gesetzt...
          </>
        ) : (
          'Secret Passwort setzen'
        )}
      </button>
    </form>
  )
}
