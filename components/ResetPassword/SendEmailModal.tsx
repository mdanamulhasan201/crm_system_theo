'use client'
import React from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { forgotPassword, matchOTP, resetPassword } from '@/apis/authApis';
import { safeToastMessage } from '@/lib/toastUtils';

export default function SendEmailModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [resetEmail, setResetEmail] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [otp, setOTP] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setResetEmail('');
            setShowOTP(false);
            setShowPasswordReset(false);
            setOTP('');
            setNewPassword('');
            setConfirmPassword('');
        }
        onOpenChange(newOpen);
    };


    // send email with 
    const handleSendEmail = async () => {
        if (!resetEmail) {
            toast.error('Please enter email');
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await forgotPassword(resetEmail);
        if (response.success) {
            setIsLoading(false);
            toast.success('OTP sent to your email');
            setShowOTP(true);
        } else {
            setIsLoading(false);
            toast.error(safeToastMessage(response.message) || 'Failed to send email');
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            toast.error('Please enter OTP');
            return;
        }
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const response = await matchOTP(resetEmail, otp);
            if (response.success) {
                toast.success('OTP verified successfully');
                setShowOTP(false);
                setShowPasswordReset(true);
            } else {
                toast.error(safeToastMessage(response.message) || 'Failed to verify OTP');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 4) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const response = await resetPassword(resetEmail, newPassword);
            if (response.success) {
                toast.success('Password reset successfully');
                handleOpenChange(false);
            } else {
                toast.error(safeToastMessage(response.message) || 'Failed to reset password');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (showPasswordReset) {
            handleResetPassword();
        } else if (showOTP) {
            handleVerifyOTP();
        } else {
            handleSendEmail();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <p className='text-sm text-[#585C5B] cursor-pointer'>Passwort vergessen?</p>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Passwort zurücksetzen</DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!showOTP && !showPasswordReset && (
                        <>
                            <Input
                                type="email"
                                placeholder="Ihre E-Mail-Adresse"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                            />
                            <Button
                                type="submit"
                                className="w-full cursor-pointer"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        <span>Sending...</span>
                                    </div>
                                ) : (
                                    'Senden'
                                )}
                            </Button>
                        </>
                    )}

                    {showOTP && (
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your email</p>
                            <InputOTP
                                value={otp}
                                onChange={setOTP}
                                maxLength={6}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />

                                </InputOTPGroup>
                            </InputOTP>
                            <Button
                                type="submit"
                                className="w-full cursor-pointer"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    'Verify OTP'
                                )}
                            </Button>
                        </div>
                    )}

                    {showPasswordReset && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
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
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
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
                            <Button
                                type="submit"
                                className="w-full cursor-pointer"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        <span>Resetting...</span>
                                    </div>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
