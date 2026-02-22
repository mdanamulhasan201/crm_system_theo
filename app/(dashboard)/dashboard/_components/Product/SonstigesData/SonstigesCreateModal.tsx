'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface SonstigesFormData {
    manufacturer: string
    delivery_business: string
    article: string
    ein: string
    quantity: number
    value: number
}

const INITIAL_FORM: SonstigesFormData = {
    manufacturer: '',
    delivery_business: '',
    article: '',
    ein: '',
    quantity: 0,
    value: 0,
}

interface SonstigesCreateModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit?: (data: SonstigesFormData) => void | Promise<void>
}

export default function SonstigesCreateModal({
    isOpen,
    onClose,
    onSubmit,
}: SonstigesCreateModalProps) {
    const [formData, setFormData] = useState<SonstigesFormData>(INITIAL_FORM)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) {
            setFormData(INITIAL_FORM)
        }
    }, [isOpen])

    const handleChange = (field: keyof SonstigesFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await onSubmit?.(formData)
            onClose()
        } catch (err) {
            console.error('Submit error:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:!max-w-xl p-0 gap-0 overflow-hidden rounded-xl border border-gray-200 shadow-xl">
                <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-b from-gray-50/80 to-white border-b border-gray-100">
                    <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">
                        Sonstiges erstellen
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Lieferdetails und Artikelinformationen eingeben
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="manufacturer" className="text-gray-700 font-medium">
                                    Hersteller
                                </Label>
                                <Input
                                    id="manufacturer"
                                    type="text"
                                    placeholder="z.B. ComfortStep Industries"
                                    value={formData.manufacturer}
                                    onChange={(e) => handleChange('manufacturer', e.target.value)}
                                    className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#61A178] focus-visible:border-[#61A178]"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="delivery_business" className="text-gray-700 font-medium">
                                    Liefergeschäft
                                </Label>
                                <Input
                                    id="delivery_business"
                                    type="text"
                                    placeholder="z.B. Rapid Express"
                                    value={formData.delivery_business}
                                    onChange={(e) => handleChange('delivery_business', e.target.value)}
                                    className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#61A178] focus-visible:border-[#61A178]"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="article" className="text-gray-700 font-medium">
                                Artikel
                            </Label>
                            <Input
                                id="article"
                                type="text"
                                placeholder="z.B. Orthopädische Einlage"
                                value={formData.article}
                                onChange={(e) => handleChange('article', e.target.value)}
                                className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#61A178] focus-visible:border-[#61A178]"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="ein" className="text-gray-700 font-medium">
                                    EIN
                                </Label>
                                <Input
                                    id="ein"
                                    type="text"
                                    placeholder="z.B. EIN-07890"
                                    value={formData.ein}
                                    onChange={(e) => handleChange('ein', e.target.value)}
                                    className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#61A178] focus-visible:border-[#61A178]"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-gray-700 font-medium">
                                    Menge
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min={0}
                                    placeholder="z.B. 100"
                                    value={formData.quantity || ''}
                                    onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                                    className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#61A178] focus-visible:border-[#61A178]"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="value" className="text-gray-700 font-medium">
                                Wert (€)
                            </Label>
                            <Input
                                id="value"
                                type="number"
                                step="0.01"
                                min={0}
                                placeholder="z.B. 29.75"
                                value={formData.value || ''}
                                onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
                                className="h-10 rounded-lg border-gray-300 focus-visible:ring-[#61A178] focus-visible:border-[#61A178]"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="cursor-pointer"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#61A178] hover:bg-[#61A178]/90 text-white cursor-pointer"
                        >
                            {isSubmitting ? 'Erstellen...' : 'Erstellen'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
