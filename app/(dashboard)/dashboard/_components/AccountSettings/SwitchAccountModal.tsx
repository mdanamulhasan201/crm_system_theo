'use client'
import React from 'react'
import { LogIn, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Employee } from '@/hooks/employee/useEmployeeManagement'

interface SwitchAccountModalProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
  onConfirm: () => void
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export default function SwitchAccountModal({
  isOpen,
  onClose,
  employee,
  onConfirm,
}: SwitchAccountModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <LogIn className="w-5 h-5 text-blue-600" />
            </div>
            Account wechseln
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {employee && getInitials(employee.employeeName)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{employee?.accountName}</p>
                <p className="text-sm text-gray-600">{employee?.employeeName}</p>
                <p className="text-xs text-gray-500">{employee?.email}</p>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            Möchten Sie zu diesem Mitarbeiter-Account wechseln?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Hinweis:</strong> Sie werden als dieser Mitarbeiter angemeldet. Ihre aktuelle Sitzung bleibt gespeichert.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Wechseln
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

