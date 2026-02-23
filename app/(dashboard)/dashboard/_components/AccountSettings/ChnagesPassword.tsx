'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { changePassword } from '@/apis/authApis'
import toast from 'react-hot-toast'

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ChnagesPassword() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormData>()

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        toast.error('Neue Passwörter stimmen nicht überein')
        return
      }

      setIsPasswordLoading(true)
      const response = await changePassword(data.currentPassword, data.newPassword)

      if (response.success) {
        toast.success('Passwort erfolgreich geändert')
        reset()
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Ändern des Passworts')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Aktuelles Passwort
        </label>
        <div className="relative">
          <input
            type={showCurrentPassword ? "text" : "password"}
            {...register('currentPassword', {
              required: 'Aktuelles Passwort ist erforderlich'
            })}
            className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61A175] focus:border-[#61A175]"
            placeholder="Aktuelles Passwort eingeben"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {showCurrentPassword ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Neues Passwort
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            {...register('newPassword', {
              required: 'Neues Passwort ist erforderlich',
              minLength: {
                value: 6,
                message: 'Passwort muss mindestens 6 Zeichen lang sein'
              }
            })}
            className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61A175] focus:border-[#61A175]"
            placeholder="Neues Passwort eingeben"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {showNewPassword ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Neues Passwort bestätigen
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register('confirmPassword', {
              required: 'Bitte bestätigen Sie Ihr neues Passwort'
            })}
            className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61A175] focus:border-[#61A175]"
            placeholder="Neues Passwort bestätigen"
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
        disabled={isPasswordLoading}
        className="w-full sm:w-auto px-5 py-2 text-sm bg-[#61A175] text-white rounded-lg hover:bg-[#61A175]/90 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPasswordLoading ? (
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
            Aktualisieren...
          </>
        ) : (
          'Passwort aktualisieren'
        )}
      </button>
    </form>
  )
}
