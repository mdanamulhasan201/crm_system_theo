'use client'
import React, { useEffect, useState } from 'react'
import { balanceMassschuheOrder, requestPayoutToAdmin } from '@/apis/MassschuheManagemantApis'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

interface BalanceResponse {
    success: boolean
    message: string
    data: {
        totalPrice: number
    }
}

interface AktuelleBalanceProps {
    onPayoutRequested?: () => void
}

export default function AktuelleBalance({ onPayoutRequested }: AktuelleBalanceProps) {
    const [balance, setBalance] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [amount, setAmount] = useState('')
    const [submitLoading, setSubmitLoading] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                setLoading(true)
                const response = await balanceMassschuheOrder() as BalanceResponse
                
                const totalPrice = response?.data?.totalPrice
                const parsed = 
                    totalPrice === null || totalPrice === undefined
                        ? null
                        : typeof totalPrice === 'number'
                            ? totalPrice
                            : Number(totalPrice)

                setBalance(typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null)
            } catch (error) {
                console.error('Failed to fetch balance:', error)
                setBalance(null)
            } finally {
                setLoading(false)
            }
        }
        fetchBalance()
    }, [])

    const formatCurrency = (value: number) => {
        const absValue = Math.abs(value);
        return absValue.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleOpenModal = () => {
        setModalOpen(true)
        setAmount('')
        setSubmitError(null)
    }

    const handleAnfordernClick = () => {
        const num = Number(amount)
        if (!Number.isFinite(num) || num <= 0) {
            setSubmitError('Bitte einen gültigen Betrag eingeben.')
            return
        }
        setSubmitError(null)
        setConfirmOpen(true)
    }

    const handleConfirmPayout = async () => {
        const num = Number(amount)
        setSubmitLoading(true)
        try {
            await requestPayoutToAdmin(num)
            setConfirmOpen(false)
            setModalOpen(false)
            setAmount('')
            onPayoutRequested?.()
            toast.success('Auszahlung erfolgreich angefragt.')
            const response = await balanceMassschuheOrder() as BalanceResponse
            const totalPrice = response?.data?.totalPrice
            const parsed = totalPrice != null ? (typeof totalPrice === 'number' ? totalPrice : Number(totalPrice)) : null
            setBalance(typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null)
        } catch (error: unknown) {
            const msg = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : 'Anfrage fehlgeschlagen.'
            toast.error(msg || 'Anfrage fehlgeschlagen.')
        } finally {
            setSubmitLoading(false)
        }
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-between">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Aktuelle Balance</h2>

                <div className="flex-1 flex flex-col justify-center">
                    <div className="md:text-xl lg:text-2xl xl:text-4xl font-bold text-red-500 mb-6">
                        {loading
                            ? 'Lädt...'
                            : balance === null
                                ? '---'
                                : `-${formatCurrency(Math.abs(balance))}€`}
                    </div>

                    <div className="space-y-1 text-sm text-gray-500 italic mb-4">
                        <p>+ "Betrag wird Ende des Monats gutgeschrieben"</p>
                        <p>- "Betrag wird Ende des Monats abgezogen"</p>
                    </div>

                    <Button
                        type="button"
                        onClick={handleOpenModal}
                        className="w-full bg-[#61A175] hover:bg-[#4d8a5f] text-white"
                    >
                        Auszahlung anfordern
                    </Button>
                </div>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Auszahlung an Admin anfordern</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="payout-amount">Betrag (€)</Label>
                            <Input
                                id="payout-amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="z.B. 10"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        {submitError && (
                            <p className="text-sm text-red-500">{submitError}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalOpen(false)}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAnfordernClick}
                            disabled={submitLoading}
                            className="bg-[#61A175] hover:bg-[#4d8a5f]"
                        >
                            Anfordern
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm modal: Are you sure? */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Sind Sie sicher?</DialogTitle>
                        <DialogDescription>
                            Möchten Sie wirklich eine Auszahlung von{' '}
                            <strong>{Number(amount)?.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong>{' '}
                            an Admin anfordern?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                            disabled={submitLoading}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmPayout}
                            disabled={submitLoading}
                            className="bg-[#61A175] hover:bg-[#4d8a5f]"
                        >
                            {submitLoading ? 'Wird gesendet...' : 'Ja, anfordern'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
