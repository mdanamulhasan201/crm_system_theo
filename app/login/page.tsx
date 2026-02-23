"use client"
import React, { useState, useEffect } from 'react'
import logo from '@/public/images/logo.png'
import Image from 'next/image'
import { useForm } from 'react-hook-form'

import toast from 'react-hot-toast'
import { loginUser } from '@/apis/authApis'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import SendEmailModal from '@/components/ResetPassword/SendEmailModal'


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

    // Redirect: full auth -> dashboard; token but no role (first login) -> manage-profile
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
        formState: { errors }
    } = useForm<FormInputs>()

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

    return (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="max-w-md w-full p-6 space-y-8 bg-[#A19B9B38] rounded-lg shadow-md">
                <div className="flex flex-col items-center">
                    <Image
                        src={logo}
                        alt="logo"
                        width={60}
                        height={60}
                        className="mb-6"
                    />
                    <h1 className="text-2xl font-semibold">Willkommen zurück!</h1>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            E-Mail
                        </label>
                        <input
                            {...register("email", {
                                required: "E-Mail ist erforderlich",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Ungültige E-Mail-Adresse"
                                }
                            })}
                            type="email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Passwort
                        </label>
                        <div className="relative">
                            <input
                                {...register("password", {
                                    required: "Passwort ist erforderlich",
                                    minLength: {
                                        value: 6,
                                        message: "Passwort muss mindestens 6 Zeichen lang sein"
                                    }
                                })}
                                type={showPassword ? "text" : "password"}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
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
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#585C5B] transform duration-300 cursor-pointer hover:bg-gray-700 focus:outline-none  disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="inline-flex items-center">
                                <div className="w-4 h-4 border-2 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                                Wird geladen...
                            </div>
                        ) : (
                            'Anmelden'
                        )}
                    </button>
                </form>
                {/* reset code  */}
                <div className='flex justify-end items-center'>
                    <SendEmailModal  open={isResetModalOpen} onOpenChange={setIsResetModalOpen}/>
                    
                </div>
            </div>

        </div>
    )
}
