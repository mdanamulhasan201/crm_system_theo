'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Package, Loader2 } from 'lucide-react'
import {
  createInventory,
  updateInventory,
  type CreateInventoryPayload,
  type InventoryItem,
  type InventoryType,
  type InventoryStatus,
  type PaymentStatus,
} from '@/apis/warenwirtschaftApis'
import toast from 'react-hot-toast'

const STATUS_OPTIONS: { value: InventoryStatus; label: string }[] = [
  { value: 'Ordered', label: 'Ordered' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Partially', label: 'Partially' },
]

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'Open', label: 'Open' },
  { value: 'Paid', label: 'Paid' },
]

const WE_LINKED_OPTIONS = [
  { value: 'false', label: 'Nein' },
  { value: 'true', label: 'Ja' },
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function dateToInput(iso: string) {
  if (!iso) return todayISO()
  return iso.slice(0, 10)
}

export interface LieferantOption {
  id: string
  name: string
}

interface ManuellSectionProps {
  inventoryType: InventoryType
  supplierName?: string
  lieferanten: LieferantOption[]
  onBack: () => void
  onSuccess?: () => void
  initialData?: InventoryItem
  editId?: string
}

export default function ManuellSection({
  inventoryType,
  supplierName,
  lieferanten,
  onBack,
  onSuccess,
  initialData,
  editId,
}: ManuellSectionProps) {
  const isEdit = Boolean(editId && initialData)
  const [supplierId, setSupplierId] = useState<string>(() => {
    if (initialData) return lieferanten.find((l) => l.name === initialData.supplier)?.id ?? ''
    return supplierName ? lieferanten.find((l) => l.name === supplierName)?.id ?? '' : ''
  })
  const [date, setDate] = useState<string>(() => (initialData ? dateToInput(initialData.date) : todayISO()))
  const [amount, setAmount] = useState<number>(initialData?.amount ?? 0)
  const [status, setStatus] = useState<InventoryStatus>(initialData?.status ?? 'Delivered')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialData?.payment_status ?? 'Paid')
  const [paymentDate, setPaymentDate] = useState<string>(() => (initialData ? dateToInput(initialData.payment_date) : todayISO()))
  const [weLinked, setWeLinked] = useState<boolean>(initialData?.we_linked ?? false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isInvoices = inventoryType === 'Invoices'
  const supplier = lieferanten.find((l) => l.id === supplierId)?.name ?? initialData?.supplier ?? ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!supplier) {
      setError('Bitte wählen Sie einen Lieferanten.')
      return
    }
    const payload: CreateInventoryPayload = {
      inventory_type: inventoryType,
      supplier,
      date,
      amount,
      status,
      payment_status: paymentStatus,
      payment_date: paymentDate,
      we_linked: weLinked,
    }
    setSubmitting(true)
    try {
      if (isEdit && editId) {
        await updateInventory(editId, payload)
        toast.success('Wareneingang erfolgreich aktualisiert.')
      } else {
        await createInventory(payload)
        toast.success('Wareneingang erfolgreich erstellt.')
      }
      onSuccess?.()
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : isEdit ? 'Fehler beim Aktualisieren.' : 'Fehler beim Erstellen.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 cursor-pointer text-gray-600 hover:bg-gray-100"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Bearbeiten' : 'Manuell'} – {isInvoices ? 'Rechnung' : 'Bestellung'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 space-y-4">
        {/* Lieferant: Dropdown für beide (Rechnung + Bestellung) */}
        <div className="space-y-2">
          <Label htmlFor="manuell-lieferant" className="text-sm font-medium text-gray-700">
            Lieferant <span className="text-red-500">*</span>
          </Label>
          <Select value={supplierId || undefined} onValueChange={setSupplierId} required>
            <SelectTrigger id="manuell-lieferant" className="w-full">
              <SelectValue placeholder="Lieferant auswählen..." />
            </SelectTrigger>
            <SelectContent>
              {lieferanten.map((l) => (
                <SelectItem key={l.id} value={l.id} className="focus:bg-[#62A17C]/10 focus:text-[#62A17C]">
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manuell-date" className="text-sm font-medium text-gray-700">
            Datum
          </Label>
          <Input
            id="manuell-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manuell-amount" className="text-sm font-medium text-gray-700">
            Betrag
          </Label>
          <Input
            id="manuell-amount"
            type="number"
            min={0}
            step={0.01}
            value={amount === 0 ? '' : amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            placeholder="0"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as InventoryStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="focus:bg-[#62A17C]/10 focus:text-[#62A17C]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Zahlungsstatus</Label>
          <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="focus:bg-[#62A17C]/10 focus:text-[#62A17C]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manuell-payment-date" className="text-sm font-medium text-gray-700">
            Zahlungsdatum
          </Label>
          <Input
            id="manuell-payment-date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">WE verknüpft</Label>
          <Select
            value={weLinked ? 'true' : 'false'}
            onValueChange={(v) => setWeLinked(v === 'true')}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WE_LINKED_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="focus:bg-[#62A17C]/10 focus:text-[#62A17C]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
            onClick={onBack}
            disabled={submitting}
          >
            Zurück
          </Button>
          <Button
            type="submit"
            size="default"
            className="bg-[#62A17C] hover:bg-[#62A17C]/80 text-white cursor-pointer"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Package className="size-4" />
            )}
            {isEdit ? 'Aktualisieren' : 'Ins Lager buchen'}
          </Button>
        </div>
      </form>
    </div>
  )
}
