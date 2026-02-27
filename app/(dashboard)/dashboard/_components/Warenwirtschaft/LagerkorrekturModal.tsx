'use client'

import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Placeholder articles – replace with real data later
const MOCK_ARTICLES = [
  { id: '1', label: 'Artikel A' },
  { id: '2', label: 'Artikel B' },
  { id: '3', label: 'Artikel C' },
]

type Direction = 'zugang' | 'abgang'

interface LagerkorrekturModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LagerkorrekturModal({ open, onOpenChange }: LagerkorrekturModalProps) {
  const [articleId, setArticleId] = useState<string>('')
  const [direction, setDirection] = useState<Direction>('abgang')
  const [quantity, setQuantity] = useState<string>('1')
  const [reason, setReason] = useState<string>('')

  const handleClose = () => {
    onOpenChange(false)
    setArticleId('')
    setDirection('abgang')
    setQuantity('1')
    setReason('')
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: submit to API
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Manuelle Lagerkorrektur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="article">Artikel</Label>
            <Select value={articleId} onValueChange={setArticleId} required>
              <SelectTrigger id="article" className="w-full">
                <SelectValue placeholder="Artikel wählen..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_ARTICLES.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Richtung</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="default"
                className={cn(
                  'flex-1 cursor-pointer border-gray-300 bg-white hover:bg-gray-50',
                  direction === 'zugang' && 'border-[#62A17C] bg-[#62A17C] text-white hover:bg-[#62A17C]/80 hover:text-white'
                )}
                onClick={() => setDirection('zugang')}
              >
                <Plus className="size-4" />
                Zugang
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                className={cn(
                  'flex-1 cursor-pointer border-gray-300 bg-white hover:bg-gray-50',
                  direction === 'abgang' && 'border-[#62A17C] bg-[#62A17C] text-white hover:bg-[#62A17C]/80 hover:text-white'
                )}
                onClick={() => setDirection('abgang')}
              >
                <Minus className="size-4" />
                Abgang
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="menge">Menge</Label>
            <Input
              id="menge"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grund">Grund (optional)</Label>
            <Textarea
              id="grund"
              placeholder="z. B. Schwund, Inventurdifferenz, Beschädigung..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} className="border-gray-300 bg-white hover:bg-gray-50">
              Abbrechen
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
