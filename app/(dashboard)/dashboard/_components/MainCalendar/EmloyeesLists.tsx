"use client"

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { getAllEmployees } from '@/apis/employeeaApis'

interface EmployeeItem {
    id: string
    name: string
    initial: string
}

interface EmloyeesListsProps {
    selectedEmployees: string[]
    onEmployeeToggle: (employeeId: string) => void
}

export default function EmloyeesLists({
    selectedEmployees,
    onEmployeeToggle
}: EmloyeesListsProps) {
    const [employees, setEmployees] = useState<EmployeeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await getAllEmployees(1, 100)
                type ApiEmployee = { id?: string; _id?: string; employeeName?: string; name?: string }
                const list = (res?.data || []).map((e: ApiEmployee) => ({
                    id: e.id || e._id || '',
                    name: e.employeeName || e.name || '—',
                    initial: (e.employeeName || e.name || '?').charAt(0).toUpperCase()
                })).filter((e: EmployeeItem) => e.id)
                setEmployees(list)
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to load employees')
            } finally {
                setLoading(false)
            }
        }
        fetchEmployees()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col gap-3 bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    MITARBEITER
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 rounded-full bg-gray-100 animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-3 bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    MITARBEITER
                </h3>
                <p className="text-sm text-red-600">{error}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3 bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                MITARBEITER
            </h3>

            <div className="grid grid-cols-2 gap-2">
                {employees.map((employee) => {
                    const isSelected = selectedEmployees.includes(employee.id)
                    const isDisabled = selectedEmployees.length >= 2 && !isSelected

                    return (
                        <button
                            key={employee.id}
                            onClick={() => !isDisabled && onEmployeeToggle(employee.id)}
                            className={cn(
                                "flex items-center gap-2 px-2 py-2 rounded-full text-sm font-medium transition-all duration-200 w-full justify-start",
                                isDisabled && "opacity-60 cursor-not-allowed",
                                !isDisabled && "cursor-pointer",
                                isSelected
                                    ? "bg-[#62A07C] text-white hover:bg-[#62A07C]/80"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                                    isSelected
                                        ? "bg-green-100 text-[#62A07C] border border-white/90"
                                        : "bg-gray-200/80 text-gray-700 border border-gray-200"
                                )}
                            >
                                {employee.initial}
                            </div>
                            <span className="truncate text-left">{employee.name}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
