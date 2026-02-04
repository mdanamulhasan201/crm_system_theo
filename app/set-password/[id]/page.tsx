"use client"

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, Lock, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { setPassword } from '@/apis/setPassword'
import { useAuth } from '@/contexts/AuthContext'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Validation schema
const passwordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function UpdatePasswordPage() {
  const params = useParams()
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const id = params?.id as string
  const userEmail = "partner@example.com"

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: userEmail,
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Enable real-time validation
  })

  // Watch password fields for real-time validation
  const password = form.watch("password")
  const confirmPassword = form.watch("confirmPassword")

  // Password strength validation
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  }

  // Calculate password strength
  const getPasswordStrength = () => {
    const checksCount = Object.values(passwordChecks).filter(Boolean).length
    if (checksCount === 0) return { strength: "weak", color: "text-red-500", bgColor: "bg-red-500" }
    if (checksCount <= 2) return { strength: "weak", color: "text-red-500", bgColor: "bg-red-500" }
    if (checksCount <= 4) return { strength: "medium", color: "text-yellow-500", bgColor: "bg-yellow-500" }
    return { strength: "strong", color: "text-[#61A175]", bgColor: "bg-[#61A175]" }
  }

  const passwordStrength = password ? getPasswordStrength() : null
  const passwordsMatch = confirmPassword && password === confirmPassword
  const passwordsMismatch = confirmPassword && password !== confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (data: PasswordFormData) => {
    if (!id) {
      toast.error("Invalid link. Please check your email for the correct link.")
      return
    }

    try {
      // Call API with id and password only
      const response = await setPassword(id, { password: data.password })

      // Check if response has token
      if (response?.token) {
        // Login user with the token from API response
        await login(response.token)

        // Show success message from API response
        const successMessage = response?.message || "Password set successfully"
        toast.success(successMessage)

        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      } else {
        // If no token in response, show error
        toast.error("Failed to authenticate. Please try again.")
      }
    } catch (error: any) {
      console.error("Failed to set password:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to set password. Please try again."
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 space-y-8 bg-[#A19B9B38] rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#61A175]/10">
            <Lock className="h-6 w-6 text-[#61A175]" />
          </div>
          <h1 className="text-2xl font-semibold">Set Your Password</h1>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Please create a secure password for your partner account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-8 space-y-6">
            {/* <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    E-Mail
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#61A175] focus:border-[#61A175] pr-10 ${password && passwordStrength?.strength === "strong"
                            ? "border-[#61A175]"
                            : password && passwordStrength?.strength === "medium"
                              ? "border-yellow-500"
                              : password
                                ? "border-red-500"
                                : "border-gray-300"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength?.bgColor || "bg-gray-200"
                              }`}
                            style={{
                              width: passwordStrength
                                ? `${(Object.values(passwordChecks).filter(Boolean).length / 5) * 100}%`
                                : "0%",
                            }}
                          />
                        </div>
                        {passwordStrength && (
                          <span className={`text-xs font-medium ${passwordStrength.color}`}>
                            {passwordStrength.strength.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Password Requirements */}
                      <div className="space-y-1 mt-2">
                        <div className={`flex items-center gap-2 text-xs ${passwordChecks.minLength ? "text-[#61A175]" : "text-gray-500"}`}>
                          {passwordChecks.minLength ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordChecks.hasUpperCase ? "text-[#61A175]" : "text-gray-500"}`}>
                          {passwordChecks.hasUpperCase ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>One uppercase letter</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordChecks.hasLowerCase ? "text-[#61A175]" : "text-gray-500"}`}>
                          {passwordChecks.hasLowerCase ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>One lowercase letter</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordChecks.hasNumber ? "text-[#61A175]" : "text-gray-500"}`}>
                          {passwordChecks.hasNumber ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>One number</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordChecks.hasSpecialChar ? "text-[#61A175]" : "text-gray-500"}`}>
                          {passwordChecks.hasSpecialChar ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>One special character</span>
                        </div>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#61A175] focus:border-[#61A175] pr-10 ${passwordsMatch
                            ? "border-[#61A175]"
                            : passwordsMismatch
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-10">
                        {passwordsMatch && (
                          <Check className="h-5 w-5 text-[#61A175]" />
                        )}
                        {passwordsMismatch && (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  {confirmPassword && (
                    <div className="mt-1">
                      {passwordsMatch ? (
                        <div className="flex items-center gap-2 text-xs text-[#61A175]">
                          <Check className="h-3 w-3" />
                          <span>Passwords match</span>
                        </div>
                      ) : passwordsMismatch ? (
                        <div className="flex items-center gap-2 text-xs text-red-500">
                          <X className="h-3 w-3" />
                          <span>Passwords do not match</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#61A175] transform duration-300 cursor-pointer hover:bg-[#519165] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61A175] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {form.formState.isSubmitting ? (
                <div className="inline-flex items-center">
                  <div className="w-4 h-4 border-2 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Setting Password...
                </div>
              ) : (
                'Set Password'
              )}
            </button>
          </form>
        </Form>
      </div>
    </div>
  )
}