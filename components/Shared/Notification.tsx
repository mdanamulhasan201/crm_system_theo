"use client"
import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { IoNotificationsOutline } from 'react-icons/io5'
import { useNotifications } from '@/contexts/NotificationContext'

// Badge component for notification count
const Badge = ({ count }: { count: number }) => {
    if (count === 0) return null

    return (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg">
            {count > 99 ? '99+' : count}
        </div>
    )
}

// Notification item component
const NotificationItem = ({
    notification
}: {
    notification: {
        id: string
        title: string
        message: string
        time: string
        isRead: boolean
        type: 'info' | 'success' | 'warning' | 'error'
    }
}) => {
    return (
        <div className="py-2.5 px-4">
            <div className="flex items-start gap-3">
                {/* Simple blue bullet point */}
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function NotificationPage() {
    /**
     * Pulls live notifications from the NotificationContext.
     * - `notifications` are loaded once from the REST API and then updated via Socket.IO.
     * - `unreadCount` is derived in the context for convenience.
     * - Action handlers update the local UI state (and can later call backend APIs).
     */
    const {
        notifications,
        unreadCount,
        markAllAsRead,
        isLoading,
    } = useNotifications()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                    <IoNotificationsOutline className='text-2xl text-gray-600 hover:text-gray-800 transition-colors' />
                    <Badge count={unreadCount} />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 shadow-xl border-gray-200" align="end" sideOffset={8}>
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <IoNotificationsOutline className="w-5 h-5 text-gray-700" />
                            <h3 className="font-bold text-gray-900 text-base">Benachrichtigungen</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                    {unreadCount} neu
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
                            >
                                Alle markieren
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[28rem] overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-3"></div>
                            <p className="text-sm text-gray-500">Lädt Benachrichtigungen...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IoNotificationsOutline className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm font-medium">Keine Benachrichtigungen</p>
                            <p className="text-gray-400 text-xs mt-1">Sie haben derzeit keine neuen Benachrichtigungen</p>
                        </div>
                    ) : (
                        <div>
                            {notifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors py-2 rounded-md hover:bg-blue-50">
                            Alle Benachrichtigungen anzeigen
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
