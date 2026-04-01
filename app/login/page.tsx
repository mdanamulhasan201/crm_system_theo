"use client"
import React, { useState, useEffect, useLayoutEffect } from 'react'
import logo from '@/public/images/logo.png'
import Image from 'next/image'
import { useForm } from 'react-hook-form'

import toast from 'react-hot-toast'
import { loginUser } from '@/apis/authApis'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import SendEmailModal from '@/components/ResetPassword/SendEmailModal'


const accent = "#4a9072"

const fieldShell =
    "relative min-h-[52px] rounded-2xl border-2 bg-[#f7faf8] transition-all duration-200"

/** When browser autofill fills the field, RHF often has not received the value yet — float label + padding */
const autofillEmailShell =
    "[&:has(#login-email:-webkit-autofill)]:border-[#4a9072] [&:has(#login-email:-webkit-autofill)]:shadow-[0_0_0_4px_rgba(74,144,114,0.14)] [&:has(#login-email:-webkit-autofill)_label]:top-2 [&:has(#login-email:-webkit-autofill)_label]:translate-y-0 [&:has(#login-email:-webkit-autofill)_label]:text-xs [&:has(#login-email:-webkit-autofill)_label]:font-medium [&:has(#login-email:-webkit-autofill)_label]:text-[#4a9072] [&:has(#login-email:-webkit-autofill)_input]:pt-5 [&:has(#login-email:-webkit-autofill)_input]:pb-2.5"

const autofillPasswordShell =
    "[&:has(#login-password:-webkit-autofill)]:border-[#4a9072] [&:has(#login-password:-webkit-autofill)]:shadow-[0_0_0_4px_rgba(74,144,114,0.14)] [&:has(#login-password:-webkit-autofill)_label]:top-2 [&:has(#login-password:-webkit-autofill)_label]:translate-y-0 [&:has(#login-password:-webkit-autofill)_label]:text-xs [&:has(#login-password:-webkit-autofill)_label]:font-medium [&:has(#login-password:-webkit-autofill)_label]:text-[#4a9072] [&:has(#login-password:-webkit-autofill)_input]:pt-5 [&:has(#login-password:-webkit-autofill)_input]:pb-2.5 [&:has(#login-password:-webkit-autofill)_button]:top-[26px]"

type FormInputs = {
    email: string;
    password: string;
}

export default function Login() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [showPassword, setShowPassword] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard')
            return
        }
        if (typeof window !== 'undefined' && localStorage.getItem('token')) {
            router.push('/manage-profile')
        }
    }, [isAuthenticated, router])

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<FormInputs>()

    // Browser autofill does not always fire input/change before paint — sync DOM → RHF so labels float
    useLayoutEffect(() => {
        const syncFromDom = () => {
            const emailEl = document.getElementById('login-email') as HTMLInputElement | null
            const passEl = document.getElementById('login-password') as HTMLInputElement | null
            const email = emailEl?.value ?? ''
            const pass = passEl?.value ?? ''
            if (email && getValues('email') !== email) {
                setValue('email', email, { shouldDirty: true, shouldValidate: false })
            }
            if (pass && getValues('password') !== pass) {
                setValue('password', pass, { shouldDirty: true, shouldValidate: false })
            }
        }
        syncFromDom()
        const timeouts = [0, 50, 100, 200, 400, 800, 1500, 2500].map((ms) =>
            setTimeout(syncFromDom, ms)
        )
        const interval = setInterval(syncFromDom, 300)
        const stopInterval = setTimeout(() => clearInterval(interval), 4000)
        return () => {
            timeouts.forEach(clearTimeout)
            clearInterval(interval)
            clearTimeout(stopInterval)
        }
    }, [setValue, getValues])

    const emailValue = watch("email")
    const passwordValue = watch("password")
    const floatEmail = emailFocused || !!String(emailValue ?? "").trim()
    const floatPassword = passwordFocused || !!String(passwordValue ?? "").length

    const emailReg = register("email", {
        required: "E-Mail ist erforderlich",
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Ungültige E-Mail-Adresse"
        }
    })

    const passwordReg = register("password", {
        required: "Passwort ist erforderlich",
        minLength: {
            value: 6,
            message: "Passwort muss mindestens 6 Zeichen lang sein"
        }
    })

    const onSubmit = async (data: FormInputs) => {
        setIsLoading(true)
        try {
            const response = await loginUser(data.email, data.password)
            if (response.success && response.token) {
                localStorage.setItem('token', response.token)
                toast.success('Login successful')
                router.push('/manage-profile')
            } else {
                throw new Error('Invalid response')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false)
        }
    }

    const labelBase =
        "pointer-events-none absolute left-4 z-10 origin-left transition-all duration-200 ease-out"
    const labelIdle = "top-1/2 -translate-y-1/2 text-base text-gray-500"
    const labelFloat = "top-2 translate-y-0 text-xs font-medium"
    const labelFloatColor = { color: accent } as const

    const inputBase =
        "w-full rounded-2xl border-0 bg-transparent text-gray-900 outline-none ring-0 transition-[padding] duration-200"

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-10"
            style={{ backgroundColor: "#f0f2f4" }}
        >
            <div
                className="max-w-md w-full rounded-2xl bg-white p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="mb-5">
                        <Image
                            src={logo}
                            alt="Logo"
                            width={60}
                            height={60}
                            className="object-contain"
                            style={{ filter: `saturate(1.1)` }}
                        />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Willkommen zurück!
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Melden Sie sich in Ihrem Konto an
                    </p>
                </div>

                <div className="mt-10 flex flex-col gap-5">
                <form id="login-form" className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <div
                            className={`${fieldShell} ${autofillEmailShell} ${
                                emailFocused
                                    ? "border-[#4a9072] shadow-[0_0_0_4px_rgba(74,144,114,0.14)]"
                                    : "border-gray-200"
                            }`}
                        >
                            <label
                                htmlFor="login-email"
                                className={`${labelBase} ${floatEmail ? `${labelFloat}` : labelIdle}`}
                                style={floatEmail ? labelFloatColor : undefined}
                            >
                                E-Mail
                            </label>
                            <input
                                id="login-email"
                                {...emailReg}
                                type="email"
                                autoComplete="email"
                                onFocus={() => setEmailFocused(true)}
                                onInput={(e) => {
                                    const v = (e.target as HTMLInputElement).value
                                    setValue('email', v, { shouldDirty: true, shouldValidate: false })
                                }}
                                onBlur={(e) => {
                                    setEmailFocused(false)
                                    void emailReg.onBlur(e)
                                }}
                                className={`${inputBase} pl-4 pr-4 ${
                                    floatEmail ? "pb-2.5 pt-5" : "py-3.5"
                                }`}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <div
                            className={`${fieldShell} ${autofillPasswordShell} ${
                                passwordFocused
                                    ? "border-[#4a9072] shadow-[0_0_0_4px_rgba(74,144,114,0.14)]"
                                    : "border-gray-200"
                            }`}
                        >
                            <label
                                htmlFor="login-password"
                                className={`${labelBase} ${floatPassword ? `${labelFloat}` : labelIdle}`}
                                style={floatPassword ? labelFloatColor : undefined}
                            >
                                Passwort
                            </label>
                            <input
                                id="login-password"
                                {...passwordReg}
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                onFocus={() => setPasswordFocused(true)}
                                onInput={(e) => {
                                    const v = (e.target as HTMLInputElement).value
                                    setValue('password', v, { shouldDirty: true, shouldValidate: false })
                                }}
                                onBlur={(e) => {
                                    setPasswordFocused(false)
                                    void passwordReg.onBlur(e)
                                }}
                                className={`${inputBase} pl-4 pr-11 ${
                                    floatPassword ? "pb-2.5 pt-5" : "py-3.5"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute cursor-pointer right-3 h-5 w-5 text-gray-400 transition-all duration-200 hover:text-gray-600 ${
                                    floatPassword
                                        ? "top-[26px] cursor-pointer"
                                        : "top-1/2 -translate-y-1/2 cursor-pointer"
                                }`}
                                aria-label={showPassword ? "Passwort anzeigen" : "Passwort verbergen"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>
                </form>

                    <div className="-mt-1 flex justify-end">
                        <SendEmailModal open={isResetModalOpen} onOpenChange={setIsResetModalOpen} />
                    </div>

                    <button
                        type="submit"
                        form="login-form"
                        disabled={isLoading}
                        className="w-full cursor-pointer rounded-xl py-3.5 text-base font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a9072] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: accent }}
                    >
                        {isLoading ? (
                            <span className="inline-flex items-center justify-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Wird geladen...
                            </span>
                        ) : (
                            "Anmelden"
                        )}
                    </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    <span>Verschlüsselte Verbindung</span>
                </div>
            </div>
        </div>
    )
}
