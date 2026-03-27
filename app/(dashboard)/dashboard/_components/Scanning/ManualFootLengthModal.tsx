'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ManualFootLengthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: string | null
  value: string
  onValueChange: (value: string) => void
  onSave: () => void
}

export default function ManualFootLengthModal({
  open,
  onOpenChange,
  message,
  value,
  onValueChange,
  onSave,
}: ManualFootLengthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fußlänge erforderlich</DialogTitle>
          <DialogDescription className="text-left text-gray-700">
            {message || 'Bitte geben Sie die Fußlänge ein (z. B. in mm).'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="manual-foot-length">Fußlänge</Label>
          <Input
            id="manual-foot-length"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="z. B. 265"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button type="button" className="cursor-pointer" onClick={onSave}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
