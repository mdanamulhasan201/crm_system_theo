'use client'
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogHeader,
    DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp'
import { forgotPassword, matchOTP, resetPassword } from '@/apis/authApis'
import { safeToastMessage } from '@/lib/toastUtils'
import { cn } from '@/lib/utils'

const inputClassName =
    'h-auto rounded-xl border-0 bg-gray-100 px-4 py-3.5 text-base shadow-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#4a9072]/25 md:text-sm'

const primaryButtonClass =
    'w-full cursor-pointer rounded-xl border-0 bg-[#4a9072] py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#3d7a61] focus-visible:ring-2 focus-visible:ring-[#4a9072] focus-visible:ring-offset-2 disabled:opacity-50'

const otpSlotClass =
    'h-11 w-10 rounded-lg border border-gray-200 bg-gray-50 text-base first:rounded-l-lg last:rounded-r-lg data-[active=true]:z-10 data-[active=true]:border-[#4a9072] data-[active=true]:ring-2 data-[active=true]:ring-[#4a9072]/25'

export default function SendEmailModal({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [resetEmail, setResetEmail] = useState('')
    const [showOTP, setShowOTP] = useState(false)
    const [showPasswordReset, setShowPasswordReset] = useState(false)
    const [otp, setOTP] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const step = showPasswordReset ? 3 : showOTP ? 2 : 1

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setResetEmail('')
            setShowOTP(false)
            setShowPasswordReset(false)
            setOTP('')
            setNewPassword('')
            setConfirmPassword('')
        }
        onOpenChange(newOpen)
    }

    const handleSendEmail = async () => {
        if (!resetEmail) {
            toast.error('Bitte E-Mail eingeben')
            return
        }
        setIsLoading(true)
        try {
            const response = await forgotPassword(resetEmail)
            if (response?.success) {
                toast.success('Code wurde an Ihre E-Mail gesendet')
                setShowOTP(true)
            } else {
                toast.error(
                    safeToastMessage(response?.message) || 'E-Mail konnte nicht gesendet werden'
                )
            }
        } catch (error: unknown) {
            const msg =
                error instanceof Error ? error.message : 'E-Mail konnte nicht gesendet werden'
            toast.error(safeToastMessage(msg))
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOTP = async () => {
        if (!otp) {
            toast.error('Bitte Code eingeben')
            return
        }
        setIsLoading(true)

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const response = await matchOTP(resetEmail, otp)
            if (response.success) {
                toast.success('Code bestätigt')
                setShowOTP(false)
                setShowPasswordReset(true)
            } else {
                toast.error(safeToastMessage(response.message) || 'Code ungültig')
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Verifizierung fehlgeschlagen'
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Bitte alle Felder ausfüllen')
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwörter stimmen nicht überein')
            return
        }
        if (newPassword.length < 6) {
            toast.error('Passwort muss mindestens 6 Zeichen haben')
            return
        }
        setIsLoading(true)

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const response = await resetPassword(resetEmail, newPassword)
            if (response.success) {
                toast.success('Passwort wurde zurückgesetzt')
                handleOpenChange(false)
            } else {
                toast.error(safeToastMessage(response.message) || 'Zurücksetzen fehlgeschlagen')
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Zurücksetzen fehlgeschlagen'
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Portal content is outside the DOM <form>, but React still bubbles submit to
        // ancestors in the React tree — would otherwise trigger the login form submit.
        e.stopPropagation()
        if (showPasswordReset) {
            handleResetPassword()
        } else if (showOTP) {
            handleVerifyOTP()
        } else {
            handleSendEmail()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="text-sm text-gray-500 underline-offset-2 transition-colors hover:text-[#4a9072] hover:underline"
                >
                    Passwort vergessen?
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md gap-0 rounded-2xl border-0 p-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:max-w-md">
                <div className="border-b border-gray-100 px-6 pt-6 pb-4">
                    <div className="mb-4 flex items-center justify-center gap-1.5" aria-hidden>
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                {s > 1 && (
                                    <div
                                        className={cn(
                                            'h-px w-6 transition-colors',
                                            step >= s ? 'bg-[#4a9072]' : 'bg-gray-200'
                                        )}
                                    />
                                )}
                                <div
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                                        step === s
                                            ? 'bg-[#4a9072] text-white shadow-sm'
                                            : step > s
                                              ? 'bg-[#4a9072]/15 text-[#4a9072]'
                                              : 'bg-gray-100 text-gray-400'
                                    )}
                                >
                                    {step > s ? '✓' : s}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                    <DialogHeader className="gap-1 text-center sm:text-center">
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {step === 1 && 'Passwort zurücksetzen'}
                            {step === 2 && 'Code eingeben'}
                            {step === 3 && 'Neues Passwort'}
                        </DialogTitle>
                        <DialogDescription className="text-center text-gray-500">
                            {step === 1 &&
                                'Wir senden Ihnen einen 6-stelligen Code an Ihre E-Mail-Adresse.'}
                            {step === 2 && `Code an ${resetEmail}`}
                            {step === 3 && 'Wählen Sie ein sicheres neues Passwort.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-4">
                    {!showOTP && !showPasswordReset && (
                        <>
                            <Input
                                type="email"
                                placeholder="Ihre E-Mail-Adresse"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                autoComplete="email"
                                className={inputClassName}
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={primaryButtonClass}
                            >
                                {isLoading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Wird gesendet…
                                    </span>
                                ) : (
                                    'Code senden'
                                )}
                            </button>
                        </>
                    )}

                    {showOTP && (
                        <div className="flex flex-col items-center gap-5">
                            <p className="text-center text-sm text-gray-500">
                                6-stelliger Code aus der E-Mail
                            </p>
                            <InputOTP value={otp} onChange={setOTP} maxLength={6}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className={otpSlotClass} />
                                    <InputOTPSlot index={1} className={otpSlotClass} />
                                    <InputOTPSlot index={2} className={otpSlotClass} />
                                </InputOTPGroup>
                                <InputOTPSeparator className="text-gray-300" />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} className={otpSlotClass} />
                                    <InputOTPSlot index={4} className={otpSlotClass} />
                                    <InputOTPSlot index={5} className={otpSlotClass} />
                                </InputOTPGroup>
                            </InputOTP>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={primaryButtonClass}
                            >
                                {isLoading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Wird geprüft…
                                    </span>
                                ) : (
                                    'Code bestätigen'
                                )}
                            </button>
                        </div>
                    )}

                    {showPasswordReset && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="Neues Passwort"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    className={cn(inputClassName, 'pr-11')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? (
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
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Passwort bestätigen"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    className={cn(inputClassName, 'pr-11')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? (
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
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={primaryButtonClass}
                            >
                                {isLoading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Wird gespeichert…
                                    </span>
                                ) : (
                                    'Passwort speichern'
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
