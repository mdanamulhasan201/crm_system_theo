"use client"
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getFeatureAccess, setFeatureAccess } from '@/apis/employeeaApis'
import { getPermissionKeyForTitle } from '@/lib/routePermissionUtils'
import PermissionsList from './PermissionsList'
import toast from 'react-hot-toast'
import { Employee } from '@/hooks/employee/useEmployeeManagement'

interface FeatureItem {
  title: string
  action: boolean
  path: string
  nested?: {
    title: string
    path: string
    action: boolean
  }[]
}

interface UpdateEmployeePermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
  onSuccess: () => void
}

export default function UpdateEmployeePermissionsModal({
  isOpen,
  onClose,
  employee,
  onSuccess
}: UpdateEmployeePermissionsModalProps) {
  const [features, setFeatures] = useState<FeatureItem[]>([])
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [loadingFeatures, setLoadingFeatures] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load employee permissions when modal opens
  useEffect(() => {
    if (isOpen && employee?.id) {
      loadEmployeePermissions(employee.id)
    } else {
      // Reset when modal closes
      setPermissions({})
      setFeatures([])
    }
  }, [isOpen, employee?.id])

  // Load employee permissions
  const loadEmployeePermissions = async (employeeId: string) => {
    setLoadingFeatures(true)
    try {
      const response = await getFeatureAccess(employeeId)
      if (response?.success && response?.data && Array.isArray(response.data)) {
        // Response.data is an array of feature items with title, action, path, nested
        // Use the response data directly as features
        setFeatures(response.data)
        
        // Convert features array to permissions object format
        // Only include main routes (ignore nested items)
        const permissionsObj: Record<string, boolean> = {}
        response.data.forEach((feature: FeatureItem) => {
          // Add main route permission only (don't include nested items)
          const permissionKey = getPermissionKeyForTitle(feature.title)
          permissionsObj[permissionKey] = feature.action
        })
        
        setPermissions(permissionsObj)
      } else {
        // If no permissions found, initialize with empty
        setPermissions({})
        setFeatures([])
      }
    } catch (error: any) {
      console.error('Failed to load employee permissions:', error)
      toast.error('Fehler beim Laden der Berechtigungen')
      // Initialize with empty permissions if failed
      setPermissions({})
      setFeatures([])
    } finally {
      setLoadingFeatures(false)
    }
  }

  // Handle permission toggle
  const handlePermissionToggle = (key: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Handle save permissions
  const handleSavePermissions = async () => {
    if (!employee?.id) {
      toast.error('Keine Mitarbeiter-ID gefunden')
      return
    }

    setIsSaving(true)
    try {
      await setFeatureAccess(employee.id, permissions)
      toast.success('Berechtigungen erfolgreich aktualisiert')
      
      // Reset and close
      setPermissions({})
      setFeatures([])
      onSuccess()
      onClose()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Fehler beim Speichern der Berechtigungen'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Routen-Zugriff aktualisieren</DialogTitle>
          {employee && (
            <p className="text-sm text-gray-500 mt-1">
              {employee.accountName} - {employee.employeeName}
            </p>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Routen-Zugriff festlegen</h3>
            <p className="text-sm text-gray-500">Wählen Sie die Routen aus, auf die dieser Mitarbeiter zugreifen kann</p>
          </div>
          
          <div className="max-h-[50vh] overflow-y-auto">
            <PermissionsList
              features={features}
              permissions={permissions}
              onPermissionToggle={handlePermissionToggle}
              isLoading={loadingFeatures}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 cursor-pointer py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSavePermissions}
            disabled={isSaving || loadingFeatures}
            className="w-full sm:w-auto px-4 py-2 cursor-pointer rounded-md bg-zinc-900 text-white border-none hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Speichere...' : 'Berechtigungen speichern'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

