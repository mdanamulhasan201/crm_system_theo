'use client'

import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Loader2 } from 'lucide-react'
import { createInventorySupplier } from '@/apis/warenwirtschaftApis'
import toast from 'react-hot-toast'

interface NeuerLieferantSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after successful creation with the new supplier {id, name} */
  onCreated?: (supplier: { id: string; name: string }) => void
}

interface FormState {
  name: string
  contactName: string
  email: string
  phone: string
  street: string
  postalCode: string
  city: string
  country: string
  vatIdNumber: string
  paymentTargetDays: string
  notes: string
}

const EMPTY_FORM: FormState = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  street: '',
  postalCode: '',
  city: '',
  country: 'Deutschland',
  vatIdNumber: '',
  paymentTargetDays: '14',
  notes: '',
}

export default function NeuerLieferantSidebar({
  open,
  onOpenChange,
  onCreated,
}: NeuerLieferantSidebarProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = 'Firmenname ist erforderlich'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Ungültige E-Mail-Adresse'
    }
    if (form.paymentTargetDays && isNaN(Number(form.paymentTargetDays))) {
      next.paymentTargetDays = 'Muss eine Zahl sein'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload: Record<string, any> = {
        name: form.name.trim(),
      }
      if (form.contactName.trim()) payload.contactName = form.contactName.trim()
      if (form.email.trim()) payload.email = form.email.trim()
      if (form.phone.trim()) payload.phone = form.phone.trim()
      if (form.street.trim()) payload.street = form.street.trim()
      if (form.postalCode.trim()) payload.postalCode = form.postalCode.trim()
      if (form.city.trim()) payload.city = form.city.trim()
      if (form.country.trim()) payload.country = form.country.trim()
      if (form.vatIdNumber.trim()) payload.vatIdNumber = form.vatIdNumber.trim()
      if (form.paymentTargetDays) payload.paymentTargetDays = Number(form.paymentTargetDays)
      if (form.notes.trim()) payload.notes = form.notes.trim()

      const res = await createInventorySupplier(payload)
      const created = res?.data ?? res

      toast.success(`Lieferant "${form.name}" wurde erfolgreich angelegt!`)
      onCreated?.({ id: created?.id ?? created?._id ?? '', name: form.name.trim() })
      setForm(EMPTY_FORM)
      setErrors({})
      onOpenChange(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Fehler beim Anlegen des Lieferanten'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setForm(EMPTY_FORM)
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-gray-200 bg-white p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-gray-100 px-6 py-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#62A17C]/10">
              <Building2 className="size-5 text-[#62A17C]" />
            </div>
            <div>
              <SheetTitle className="text-xl font-semibold text-gray-900">
                Neuen Lieferanten anlegen
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-sm text-gray-500">
                Lieferantendaten erfassen und speichern
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Firmenname */}
            <div className="space-y-1.5">
              <Label htmlFor="lieferant-name" className="text-sm font-medium text-gray-700">
                Firmenname <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lieferant-name"
                value={form.name}
                onChange={set('name')}
                placeholder="z. B. Müller GmbH"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Ansprechpartner */}
            <div className="space-y-1.5">
              <Label htmlFor="lieferant-contact" className="text-sm font-medium text-gray-700">
                Ansprechpartner
              </Label>
              <Input
                id="lieferant-contact"
                value={form.contactName}
                onChange={set('contactName')}
                placeholder="Vor- und Nachname"
              />
            </div>

            {/* E-Mail */}
            <div className="space-y-1.5">
              <Label htmlFor="lieferant-email" className="text-sm font-medium text-gray-700">
                E-Mail
              </Label>
              <Input
                id="lieferant-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="info@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Telefon */}
            <div className="space-y-1.5">
              <Label htmlFor="lieferant-phone" className="text-sm font-medium text-gray-700">
                Telefon
              </Label>
              <Input
                id="lieferant-phone"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+49 123 456789"
              />
            </div>

            {/* Straße */}
            <div className="space-y-1.5">
              <Label htmlFor="lieferant-street" className="text-sm font-medium text-gray-700">
                Straße
              </Label>
              <Input
                id="lieferant-street"
                value={form.street}
                onChange={set('street')}
                placeholder="Musterstraße 1"
              />
            </div>

            {/* PLZ + Ort */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lieferant-plz" className="text-sm font-medium text-gray-700">
                  PLZ
                </Label>
                <Input
                  id="lieferant-plz"
                  value={form.postalCode}
                  onChange={set('postalCode')}
                  placeholder="12345"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lieferant-city" className="text-sm font-medium text-gray-700">
                  Ort
                </Label>
                <Input
                  id="lieferant-city"
                  value={form.city}
                  onChange={set('city')}
                  placeholder="Berlin"
                />
              </div>
            </div>

            {/* Land */}
            <div className="space-y-1.5">
              <Label htmlFor="lieferant-country" className="text-sm font-medium text-gray-700">
                Land
              </Label>
              <Input
                id="lieferant-country"
                value={form.country}
                onChange={set('country')}
                placeholder="Deutschland"
              />
            </div>

            {/* USt-IdNr. */}
            <div className="space-y-1.5">
              <Label htmlFor="lieferant-vat" className="text-sm font-medium text-gray-700">
                USt-IdNr.
              </Label>
              <Input
                id="lieferant-vat"
                value={form.vatIdNumber}
                onChange={set('vatIdNumber')}
                placeholder="DE123456789"
              />
            </div>

            {/* Zahlungsziel */}
            <div className="space-y-1.5">
              <Label htmlFor="lieferant-payment" className="text-sm font-medium text-gray-700">
                Zahlungsziel (Tage)
              </Label>
              <Input
                id="lieferant-payment"
                type="number"
                min={0}
                value={form.paymentTargetDays}
                onChange={set('paymentTargetDays')}
                placeholder="14"
                className={errors.paymentTargetDays ? 'border-red-500' : ''}
              />
              {errors.paymentTargetDays && (
                <p className="text-xs text-red-500">{errors.paymentTargetDays}</p>
              )}
            </div>

            {/* Notizen */}
            <div className="space-y-1.5">
              <Label htmlFor="lieferant-notes" className="text-sm font-medium text-gray-700">
                Notizen
              </Label>
              <Textarea
                id="lieferant-notes"
                value={form.notes}
                onChange={set('notes')}
                placeholder="Optionale Anmerkungen..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-900 hover:bg-gray-800 cursor-pointer text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
