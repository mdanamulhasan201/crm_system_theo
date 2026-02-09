import React from 'react'
import { MessageSquare } from 'lucide-react'

export default function GeneralNotifications() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 w-full md:w-1/2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Allgemeine Benachrichtigungen</h2>
            <div className="border-b border-gray-200 mb-4"></div>

            <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                    <MessageSquare className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">Keine Benachrichtigungen gefunden</p>
                <p className="text-xs text-gray-500 mt-1">
                    Es sind derzeit keine allgemeinen Benachrichtigungen vorhanden.
                </p>
            </div>
        </div>
    )
}
