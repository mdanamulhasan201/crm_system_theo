'use client'
import React, { useState, useEffect } from 'react'
import { Users, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { useEmployeeManagement, Employee } from '@/hooks/employee/useEmployeeManagement'
import AddUpdateEmployeeModal from '@/components/DashboardSettings/AddUpdateEmployeeModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import toast from 'react-hot-toast'

export default function EmployeeAccounts() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null)

  const {
    employees,
    isLoading,
    getAll,
    remove
  } = useEmployeeManagement()

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      await getAll(1, 20) // Load more employees at once
    } catch (error) {
      console.error('Failed to load employees:', error)
    }
  }

  const handleCreateEmployee = () => {
    setShowAddModal(true)
  }

  const handleModalSuccess = async () => {
    // Optimistic update - close modal first
    await loadEmployees()
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setShowEditModal(true)
    setOpenMenuIndex(null)
  }

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setShowDeleteModal(true)
    setOpenMenuIndex(null)
  }

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete?.id) return

    try {
      setShowDeleteModal(false)
      await remove(employeeToDelete.id)
      toast.success('Mitarbeiter erfolgreich gelöscht')
      setEmployeeToDelete(null)
      await loadEmployees()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Fehler beim Löschen des Mitarbeiters'
      toast.error(errorMessage)
      setShowDeleteModal(true) // Reopen if failed
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Mitarbeiterkonten</h2>
          <p className="text-xs text-gray-500 mt-0.5">Verwalten Sie Teammitglieder und deren Zugriffsberechtigungen</p>
        </div>
      </div>

      {/* Netflix-Style Employee Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {isLoading ? (
          // Skeleton Loaders
          <>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="aspect-square rounded-lg bg-gray-200"></div>
                <div className="mt-2 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
          {/* Employee Cards */}
          {employees.map((employee, index) => (
            <div
              key={employee.id || index}
              className="group relative"
            >
              <div className="relative cursor-pointer">
                {/* Avatar */}
                <div 
                  onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                  className="aspect-square rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl md:text-4xl hover:ring-4 hover:ring-green-400 transition-all duration-200 group-hover:scale-105"
                >
                  {getInitials(employee.employeeName)}
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <div className={`w-3 h-3 rounded-full border-2 border-white ${
                    employee.financialAccess ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>

                {/* Dropdown Menu */}
                {openMenuIndex === index && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setOpenMenuIndex(null)}
                    />
                    <div className="absolute top-0 right-0 mt-12 w-48 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-900">{employee.accountName}</p>
                        <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                      </div>
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Mitarbeiter bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeleteClick(employee)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Mitarbeiter löschen
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {/* Employee Name */}
              <div className="mt-2 text-center">
                <h3 className="text-sm font-medium text-gray-900 truncate">{employee.accountName}</h3>
                <p className="text-xs text-gray-500 truncate">{employee.employeeName}</p>
              </div>
            </div>
          ))}

          {/* Add Employee Card */}
          <div
            onClick={handleCreateEmployee}
            className="group cursor-pointer"
          >
            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center hover:border-green-500 hover:bg-green-50 transition-all duration-200 group-hover:scale-105">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-200 group-hover:bg-green-500 flex items-center justify-center transition-colors">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-500 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div className="mt-2 text-center">
              <h3 className="text-sm font-medium text-gray-600 group-hover:text-green-600">Mitarbeiter hinzufügen</h3>
            </div>
          </div>

            {/* Empty State */}
            {employees.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
              <p className="mb-2">Keine Mitarbeiter gefunden</p>
              <p className="text-sm">Klicken Sie auf "Mitarbeiter hinzufügen", um Ihr erstes Teammitglied hinzuzufügen</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Employee Modal */}
      <AddUpdateEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        mode="create"
        onSuccess={handleModalSuccess}
      />

      {/* Edit Employee Modal */}
      <AddUpdateEmployeeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingEmployee(null)
        }}
        mode="edit"
        employee={editingEmployee}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mitarbeiter löschen</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Sind Sie sicher, dass Sie <strong>{employeeToDelete?.employeeName}</strong> löschen möchten?
            </p>
            <p className="text-sm text-gray-500">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setEmployeeToDelete(null)
              }}
              className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleDeleteEmployee}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Löschen
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

