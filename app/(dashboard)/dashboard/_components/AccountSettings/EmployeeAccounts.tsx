'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Users, MoreVertical, Edit2, Trash2, RefreshCw, LogIn } from 'lucide-react'
import { useEmployeeManagement, Employee } from '@/hooks/employee/useEmployeeManagement'
import AddUpdateEmployeeModal from '@/components/DashboardSettings/AddUpdateEmployeeModal'
import UpdateEmployeePermissionsModal from '@/components/DashboardSettings/UpdateEmployeePermissionsModal'
import { employeeLoginWithId } from '@/apis/authApis'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import DeleteEmployeeModal from './DeleteEmployeeModal'
import SwitchAccountModal from './SwitchAccountModal'
import { Settings } from 'lucide-react'

export default function EmployeeAccounts() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [employeeForPermissions, setEmployeeForPermissions] = useState<Employee | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [employeeToSwitch, setEmployeeToSwitch] = useState<Employee | null>(null)
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null)
  const [switchingAccountId, setSwitchingAccountId] = useState<string | null>(null)

  const { isEmployeeMode } = useAuth()
  const {
    employees,
    isLoading,
    getAll,
    remove
  } = useEmployeeManagement()

  const loadEmployees = useCallback(async () => {
    try {
      await getAll(1, 20)
    } catch (error: any) {
      if (error.response?.status === 403) {
        return
      }
    }
  }, [getAll])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

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

  const handleEditPermissions = (employee: Employee) => {
    setEmployeeForPermissions(employee)
    setShowPermissionsModal(true)
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

  const handleSwitchClick = (employee: Employee) => {
    setEmployeeToSwitch(employee)
    setShowSwitchModal(true)
    setOpenMenuIndex(null)
  }

  const handleSwitchAccount = async () => {
    if (!employeeToSwitch?.id) return;
    
    setSwitchingAccountId(employeeToSwitch.id)
    setShowSwitchModal(false)
    
    try {
      const response = await employeeLoginWithId(employeeToSwitch.id)
      
      if (response?.token) {
        localStorage.setItem('employeeToken', response.token)
        localStorage.setItem('currentEmployeeId', employeeToSwitch.id)
        
        toast.success(`Zu ${employeeToSwitch.accountName} gewechselt`, {
          icon: '🔄',
          duration: 3000,
        })
        
        // Redirect to employee profile page
        setTimeout(() => {
          window.location.href = '/dashboard/employee-profile'
        }, 500)
      } else {
        throw new Error('Token nicht erhalten')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Fehler beim Wechseln des Accounts'
      toast.error(errorMessage)
    } finally {
      setSwitchingAccountId(null)
      setEmployeeToSwitch(null)
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
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
          {employees.map((employee, index) => {
            const isSwitching = switchingAccountId === employee.id
            
            return (
            <div
              key={employee.id || index}
              className="group relative"
            >
              <div className="relative">
                {/* Avatar - Now clickable for switching */}
                <div 
                  onClick={() => !isSwitching && handleSwitchClick(employee)}
                  className={`aspect-square rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-4xl transition-all duration-200 from-blue-400 to-blue-600 hover:ring-4 hover:ring-blue-300 group-hover:scale-105 cursor-pointer ${isSwitching ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {isSwitching ? (
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  ) : (
                    getInitials(employee.employeeName)
                  )}
                </div>

                {/* Menu Button - Only show for partner accounts */}
                {!isEmployeeMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenuIndex(openMenuIndex === index ? null : index)
                    }}
                    className="absolute top-2 left-2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors z-10"
                  >
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>
                )}
                
                {/* Status Badge */}
                <div className="absolute bottom-2 right-2 z-10">
                  <div className={`w-3 h-3 rounded-full border-2 border-white ${
                    employee.financialAccess ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>

                {/* Dropdown Menu - Only show for partner accounts */}
                {openMenuIndex === index && !isEmployeeMode && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setOpenMenuIndex(null)}
                    />
                    <div className="absolute top-12 left-0 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-900">{employee.accountName}</p>
                        <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                      </div>
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                        Konto bearbeiten
                      </button>
                      <button
                        onClick={() => handleEditPermissions(employee)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-4 h-4" />
                        Routen-Zugriff
                      </button>
                      <button
                        onClick={() => handleDeleteClick(employee)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Löschen
                      </button>
                    </div>
                  </>
                )}

                {/* Switch Overlay Hover Effect */}
                {!isSwitching && (
                  <div 
                    className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none"
                  >
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <p className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                        <LogIn className="w-3 h-3" />
                        Wechseln
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Employee Name */}
              <div className="mt-2 text-center">
                <h3 className="text-sm font-medium text-gray-900 truncate">{employee.accountName}</h3>
                <p className="text-xs text-gray-500 truncate">{employee.employeeName}</p>
              </div>
            </div>
          )})}


          {/* Add Employee Card - Only show for partner accounts */}
          {!isEmployeeMode && (
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
          )}

            {/* Empty State */}
            {employees.length === 0 && !isEmployeeMode && (
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
      <DeleteEmployeeModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setEmployeeToDelete(null)
        }}
        employee={employeeToDelete}
        onConfirm={handleDeleteEmployee}
      />

      {/* Switch Account Confirmation Modal */}
      <SwitchAccountModal
        isOpen={showSwitchModal}
        onClose={() => {
          setShowSwitchModal(false)
          setEmployeeToSwitch(null)
        }}
        employee={employeeToSwitch}
        onConfirm={handleSwitchAccount}
      />

      {/* Update Permissions Modal */}
      <UpdateEmployeePermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false)
          setEmployeeForPermissions(null)
        }}
        employee={employeeForPermissions}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

