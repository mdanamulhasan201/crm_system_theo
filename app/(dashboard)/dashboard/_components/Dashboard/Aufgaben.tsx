import React from 'react'
import { Package, ArrowRight } from 'lucide-react'

interface Task {
    id: string
    orderNumber: string
    dueDate: string
    status: 'due-tomorrow' | 'due-today' | 'overdue'
}

const dummyTasks: Task[] = [
    {
        id: '1',
        orderNumber: 'Auftrag#1241413',
        dueDate: 'Fällig morgen',
        status: 'due-tomorrow'
    },
    {
        id: '2',
        orderNumber: 'Auftrag#1241413',
        dueDate: 'Fällig morgen',
        status: 'due-tomorrow'
    },
    {
        id: '3',
        orderNumber: 'Auftrag#1241413',
        dueDate: 'Fällig morgen',
        status: 'due-tomorrow'
    },
    {
        id: '4',
        orderNumber: 'Auftrag#1241413',
        dueDate: 'Fällig morgen',
        status: 'due-tomorrow'
    }
]

export default function Aufgaben() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 w-full md:w-1/2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aufgaben</h2>
            <div className="border-b border-gray-200 mb-4"></div>
            <div className="space-y-5">
                {dummyTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-green-600" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium text-gray-900">{task.orderNumber}</span>
                                <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-md whitespace-nowrap">
                                    {task.dueDate}
                                </span>
                                <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1 whitespace-nowrap">
                                    Verwalten
                                    <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
