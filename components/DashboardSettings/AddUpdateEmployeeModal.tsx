"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEmployeeManagement, Employee } from '@/hooks/employee/useEmployeeManagement'
import { getAllDynamicRoutes } from '@/apis/dynamicApis'
import { setFeatureAccess, getEmployeeById } from '@/apis/employeeaApis'
import { getPermissionKeyForTitle } from '@/lib/routePermissionUtils'
import PermissionsList from './PermissionsList'
import toast from 'react-hot-toast'

// Validation schema
const createEmployeeSchema = z.object({
  accountName: z.string().min(1, "Account name is required").min(2, "Account name must be at least 2 characters"),
  employeeName: z.string().min(1, "Employee name is required").min(2, "Employee name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  financialAccess: z.boolean(),
})

const editEmployeeSchema = z.object({
  accountName: z.string().min(1, "Account name is required").min(2, "Account name must be at least 2 characters"),
  employeeName: z.string().min(1, "Employee name is required").min(2, "Employee name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().optional(),
  financialAccess: z.boolean(),
})

type EmployeeFormData = z.infer<typeof createEmployeeSchema>

interface AddUpdateEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  employee?: Employee | null
  onSuccess: () => void
}

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

export default function AddUpdateEmployeeModal({
  isOpen,
  onClose,
  mode,
  employee,
  onSuccess
}: AddUpdateEmployeeModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [features, setFeatures] = useState<FeatureItem[]>([])
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [loadingFeatures, setLoadingFeatures] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [currentStep, setCurrentStep] = useState<'account' | 'permissions'>(mode === 'create' ? 'account' : 'permissions')
  const [createdEmployeeId, setCreatedEmployeeId] = useState<string | null>(null)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [loadingEmployeeData, setLoadingEmployeeData] = useState(false)

  const { create, update } = useEmployeeManagement()

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(mode === 'create' ? createEmployeeSchema : editEmployeeSchema) as any,
    defaultValues: {
      accountName: "",
      employeeName: "",
      email: "",
      password: "",
      financialAccess: false,
    }
  })

  // Update resolver when mode changes
  useEffect(() => {
    form.clearErrors()
  }, [mode, form])

  // Load partner features
  const loadPartnerFeatures = async () => {
    setLoadingFeatures(true)
    try {
      const response = await getAllDynamicRoutes()
      if (response?.success && response?.data) {
        setFeatures(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load partner features:', error)
      toast.error('Fehler beim Laden der Routen')
    } finally {
      setLoadingFeatures(false)
    }
  }

  // Reset steps when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setCurrentStep('account')
        setCreatedEmployeeId(null)
        // Load partner features for create mode only
        loadPartnerFeatures()
      }
      // Edit mode: Only show account form, no permissions handling here
    } else {
      // Reset when modal closes
      setCurrentStep(mode === 'create' ? 'account' : 'account')
      setCreatedEmployeeId(null)
      setPermissions({})
      setHasUnsavedChanges(false)
      setFeatures([])
    }
  }, [isOpen, mode])

  // Initialize permissions when features are loaded - only for create mode
  // All action:true routes default to ON (true) in create mode
  // Only include main routes (ignore nested items)
  useEffect(() => {
    if (features.length > 0 && mode === 'create') {
      const initialPermissions: Record<string, boolean> = {}
      features.forEach(f => {
        // Add main route permission only (only if action is true)
        // Don't include nested items
        if (f.action) {
          initialPermissions[getPermissionKeyForTitle(f.title)] = true
        }
      })
      setPermissions(initialPermissions)
      setHasUnsavedChanges(false)
    }
  }, [features, mode])

  // Load employee data from API
  const loadEmployeeData = useCallback(async (employeeId: string) => {
    setLoadingEmployeeData(true)
    try {
      const response = await getEmployeeById(employeeId)
      if (response?.data || response) {
        const empData = response?.data || response
        // Populate form with fetched data
        form.reset({
          accountName: empData.accountName || '',
          employeeName: empData.employeeName || '',
          email: empData.email || '',
          password: '', // Don't populate password
          financialAccess: empData.financialAccess || false,
        })
      }
    } catch (error: any) {
      console.error('Failed to load employee data:', error)
      toast.error('Fehler beim Laden der Mitarbeiterdaten')
      // Fallback to employee prop if API fails
      if (employee) {
        form.reset({
          accountName: employee.accountName || '',
          employeeName: employee.employeeName || '',
          email: employee.email || '',
          password: '',
          financialAccess: employee.financialAccess || false,
        })
      }
    } finally {
      setLoadingEmployeeData(false)
    }
  }, [form, employee])

  // Load employee data when modal opens in edit mode
  useEffect(() => {
    if (isOpen && mode === 'edit' && employee?.id) {
      loadEmployeeData(employee.id)
    } else if (isOpen && mode === 'create') {
      // Reset form for create mode
      form.reset({
        accountName: "",
        employeeName: "",
        email: "",
        password: "",
        financialAccess: false,
      })
    }
  }, [isOpen, mode, employee?.id, loadEmployeeData, form])

  // Handle permission toggle
  const handlePermissionToggle = (key: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: value
    }))
    setHasUnsavedChanges(true)
  }

  // Handle account creation (Step 1)
  const handleAccountCreate = async (data: EmployeeFormData) => {
    setIsCreatingAccount(true)
    try {
      const response = await create(data)
      const employeeId = response?.data?.id || response?.id
      
      if (employeeId) {
        setCreatedEmployeeId(employeeId)
        toast.success('Konto erfolgreich erstellt')
        // Move to permissions step
        setCurrentStep('permissions')
      } else {
        throw new Error('Keine Mitarbeiter-ID erhalten')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Fehler beim Erstellen des Kontos'
      toast.error(errorMessage)
    } finally {
      setIsCreatingAccount(false)
    }
  }

  // Handle permissions save (Step 2)
  const handlePermissionsSave = async () => {
    try {
      const employeeId = createdEmployeeId || employee?.id
      
      if (!employeeId) {
        toast.error('Keine Mitarbeiter-ID gefunden')
        return
      }

      await setFeatureAccess(employeeId, permissions)
      toast.success('Berechtigungen erfolgreich gespeichert')
      
      // Reset and close
      form.reset()
      setPermissions({})
      setHasUnsavedChanges(false)
      setCreatedEmployeeId(null)
      onSuccess()
      onClose()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Fehler beim Speichern der Berechtigungen'
      toast.error(errorMessage)
    }
  }

  // Handle edit mode submission (only account info, no permissions)
  const handleEditSubmit = async (data: EmployeeFormData) => {
    try {
      if (!employee?.id) return

      // Remove password if empty in edit mode
      const updateData: any = { ...data }
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password
      }

      await update(employee.id, updateData)
      toast.success('Mitarbeiter erfolgreich aktualisiert')

      form.reset()
      onSuccess()
      onClose()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Fehler beim Aktualisieren des Mitarbeiters'
      toast.error(errorMessage)
    }
  }

  const isSubmitting = form.formState.isSubmitting || isCreatingAccount || loadingEmployeeData
  const title = mode === 'create' 
    ? (currentStep === 'account' ? 'Neuen Benutzer hinzufügen' : 'Routen-Zugriff festlegen')
    : 'Employee bearbeiten'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {mode === 'create' && (
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex-1 h-1 rounded-full ${currentStep === 'account' ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex-1 h-1 rounded-full ${currentStep === 'permissions' ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>
          )}
        </DialogHeader>
        <Form {...form}>
          {mode === 'create' && currentStep === 'account' ? (
            // Step 1: Account Creation Form
            <form
              onSubmit={form.handleSubmit(handleAccountCreate)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accountname</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mitarbeitername</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter employee name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail-Adresse</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="financialAccess"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Zugriff auf Finanzen</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        className='cursor-pointer'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 cursor-pointer py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2 cursor-pointer rounded-md bg-zinc-900 text-white border-none hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Erstelle...' : 'Weiter zu Berechtigungen'}
                </button>
              </DialogFooter>
            </form>
          ) : mode === 'create' && currentStep === 'permissions' ? (
            // Step 2: Permissions Page (Create Mode)
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
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('account')}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 cursor-pointer py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Zurück
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 cursor-pointer py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handlePermissionsSave}
                  disabled={isSubmitting || loadingFeatures}
                  className="w-full sm:w-auto px-4 py-2 cursor-pointer rounded-md bg-zinc-900 text-white border-none hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Speichere...' : 'Berechtigungen speichern'}
                </button>
              </DialogFooter>
            </div>
          ) : (
            // Edit Mode: Show only account form (no permissions)
            loadingEmployeeData ? (
              <div className="space-y-4 py-8">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form
                onSubmit={form.handleSubmit(handleEditSubmit)}
                className="space-y-4"
              >
              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accountname</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mitarbeitername</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter employee name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail-Adresse</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort <span className="text-gray-400 text-xs font-normal">(leer lassen, um nicht zu ändern)</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Leer lassen, um nicht zu ändern"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="financialAccess"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Zugriff auf Finanzen</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        className='cursor-pointer'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 cursor-pointer py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2 cursor-pointer rounded-md bg-zinc-900 text-white border-none hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Aktualisiere...' : 'Employee aktualisieren'}
                </button>
              </DialogFooter>
              </form>
            )
          )}
        </Form>
      </DialogContent>
    </Dialog>
  )
}
