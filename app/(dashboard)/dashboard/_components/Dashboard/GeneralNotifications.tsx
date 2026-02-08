import React from 'react'
import { MessageSquare, RefreshCw, ArrowRight } from 'lucide-react'

interface Notification {
    id: string
    icon: 'message' | 'update'
    title: string
    time: string
    description: string
}

const dummyNotifications: Notification[] = [
    {
        id: '1',
        icon: 'message',
        title: 'Neue Nachricht',
        time: '10:04 Uhr',
        description: "Hallo John! Lass uns über unser Geschäft sprechen..."
    },
    {
        id: '2',
        icon: 'update',
        title: 'Systemupdate geplant',
        time: '24.04.2025',
        description: "Hallo John! Lass uns über unser Geschäft sprechen..."
    },
    {
        id: '3',
        icon: 'message',
        title: 'Neue Nachricht',
        time: '10:04 Uhr',
        description: "Hallo John! Lass uns über unser Geschäft sprechen..."
    },
    {
        id: '4',
        icon: 'message',
        title: 'Neue Nachricht',
        time: '10:04 Uhr',
        description: "Hallo John! Lass uns über unser Geschäft sprechen..."
    }
]

export default function GeneralNotifications() {
    const getIcon = (iconType: 'message' | 'update') => {
        if (iconType === 'message') {
            return <MessageSquare className="w-5 h-5" />
        }
        return <RefreshCw className="w-5 h-5" />
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 w-full md:w-1/2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Allgemeine Benachrichtigungen</h2>
            <div className="border-b border-gray-200 mb-4"></div>
            <div className="space-y-5">
                {dummyNotifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <div className="text-blue-600">
                                {getIcon(notification.icon)}
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-semibold text-gray-900">{notification.title}</h3>
                                        <span className="text-xs text-gray-500">{notification.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">{notification.description}</p>
                                </div>
                                <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1 shrink-0 mt-0.5">
                                    Mehr anzeigen
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
