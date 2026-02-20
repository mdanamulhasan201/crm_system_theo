"use client"

import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarMainNavProps {
  onAddAppointment: () => void
}

export default function CalendarMainNav({
  onAddAppointment
}: CalendarMainNavProps) {
  return (
    <div className="flex items-center justify-between w-full px-6 py-4 bg-white border-b border-gray-200">
      {/* Left side - Title */}
      <h1 className="text-2xl font-semibold text-gray-900">Terminkalender</h1>

      {/* Right side - Add Appointment Button */}
      <Button
        onClick={onAddAppointment}
        className="bg-[#62A07C] hover:bg-[#62A07C]/80 cursor-pointer text-white rounded-md px-4 py-2 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span>Termin hinzufügen</span>
      </Button>
    </div>
  )
}
