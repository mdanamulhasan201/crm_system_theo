'use client'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Employee } from '@/hooks/employee/useEmployeeManagement'

interface DeleteEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
  onConfirm: () => void
}

export default function DeleteEmployeeModal({
  isOpen,
  onClose,
  employee,
  onConfirm,
}: DeleteEmployeeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mitarbeiter löschen</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Sind Sie sicher, dass Sie <strong>{employee?.employeeName}</strong> löschen möchten?
          </p>
          <p className="text-sm text-gray-500">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Löschen
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

