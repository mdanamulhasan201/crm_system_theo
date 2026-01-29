'use client'
import React from 'react'
import { Users, MoreVertical, Copy } from 'lucide-react'
import Preferences from './Preferences'

export default function EmployeeSettings() {
  const employees = [
    {
      initials: 'AS',
      name: 'Anna Schmidt',
      email: 'anna@wellness-studio.de',
      role: 'Store Manager',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-700'
    },
    {
      initials: 'MW',
      name: 'Max Weber',
      email: 'max@wellness-studio.de',
      role: 'Sales Associate',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-700'
    },
    {
      initials: 'LM',
      name: 'Lisa Müller',
      email: 'lisa@wellness-studio.de',
      role: 'Inventory Manager',
      status: 'Pending',
      statusColor: 'bg-yellow-100 text-yellow-700'
    }
  ]

  const copyPartnerId = () => {
    navigator.clipboard.writeText('FF-BRU-001')
    // Add toast notification here if needed
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Employee Accounts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Employee Accounts</h2>
              <p className="text-xs text-gray-500">Manage team members and their access permissions</p>
            </div>
          </div>
          <button className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-lg">+</span>
            Create Employee
          </button>
        </div>

        {/* Employee List */}
        <div className="space-y-2">
          {employees.map((employee, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                  {employee.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{employee.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                </div>
                <div className="text-xs text-gray-600 min-w-[100px] hidden lg:block">
                  {employee.role}
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.statusColor}`}>
                  {employee.status}
                </div>
              </div>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors ml-1">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* Preferences Section */}
      <Preferences />
    </div>
  )
}