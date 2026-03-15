'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createDocumentsClaims } from '@/apis/warenwirtschaftApis';
import toast from 'react-hot-toast';

interface NeuerDokumenteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DocumentType = 'cost_estimate' | 'invoices' | 'delivery_notes';
type PaymentType = 'Open' | 'Paid';

export default function NeuerDokumenteModal({
  open,
  onOpenChange,
}: NeuerDokumenteModalProps) {
  const [type, setType] = useState<DocumentType | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [inTotal, setInTotal] = useState(''); // string for easier input handling
  const [paid, setPaid] = useState('');
  const [openAmount, setOpenAmount] = useState(''); // will be sent as "open"
  const [paymentType, setPaymentType] = useState<PaymentType | ''>('');
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [createdBy, setCreatedBy] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setType('');
    setCustomerName('');
    setRecipient('');
    setInTotal('');
    setPaid('');
    setOpenAmount('');
    setPaymentType('');
    setDate('');
    setCreatedBy('');
    setFile(null);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !customerName || !inTotal || !paymentType || !date) {
      toast.error('Bitte alle Pflichtfelder ausfüllen.');
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("type", type);
      formData.append("customerName", customerName);
      if (recipient) formData.append("recipient", recipient);
      formData.append("in_total", inTotal);
      if (paid) formData.append("paid", paid);
      if (openAmount) formData.append("open", openAmount);
      formData.append("payment_type", paymentType);
      formData.append("date", date);
      if (createdBy) formData.append("created_by", createdBy);
      if (file) formData.append("file", file);

      await createDocumentsClaims(formData);
      toast.success('Dokument wurde erfolgreich angelegt.');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error('Dokument konnte nicht angelegt werden.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Neuer Dokumente</DialogTitle>
          <DialogDescription>
            Neues Dokument mit allen relevanten Angaben und Datei erfassen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Typ*</Label>
              <Select
                value={type}
                onValueChange={(value: DocumentType) => setType(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bitte wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost_estimate">Kostenvoranschlag</SelectItem>
                  <SelectItem value="invoices">Rechnung</SelectItem>
                  <SelectItem value="delivery_notes">Lieferschein</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Kunde*</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Kundenname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Empfänger</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="z. B. Firma / Ansprechpartner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Datum*</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="in_total">Gesamtbetrag*</Label>
              <Input
                id="in_total"
                type="number"
                step="0.01"
                min="0"
                value={inTotal}
                onChange={(e) => setInTotal(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid">Bezahlt</Label>
              <Input
                id="paid"
                type="number"
                step="0.01"
                min="0"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="open">Offen</Label>
              <Input
                id="open"
                type="number"
                step="0.01"
                min="0"
                value={openAmount}
                onChange={(e) => setOpenAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label>Zahlungsstatus*</Label>
              <Select
                value={paymentType}
                onValueChange={(value: PaymentType) => setPaymentType(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bitte wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Offen</SelectItem>
                  <SelectItem value="Paid">Bezahlt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="created_by">Angelegt von</Label>
              <Input
                id="created_by"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="Mitarbeitername"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Datei</Label>
            <Input
              id="file"
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-500">
              PDF oder Bilddatei hochladen (z. B. Rechnung, Lieferschein).
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-[#62A17C] hover:bg-[#4A8A5F] cursor-pointer text-white"
              disabled={
                saving || !type || !customerName.trim() || !inTotal || !paymentType || !date
              }
            >
              {saving ? 'Wird gespeichert…' : 'Dokument anlegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
