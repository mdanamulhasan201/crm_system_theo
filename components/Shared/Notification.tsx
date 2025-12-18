"use client"
import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/card'
import { IoNotificationsOutline } from 'react-icons/io5'
import { HiCheck, HiX } from 'react-icons/hi'
import { useNotifications } from '@/contexts/NotificationContext'

// Badge component for notification count
const Badge = ({ count }: { count: number }) => {
    if (count === 0) return null

    return (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {count > 99 ? '99+' : count}
        </div>
    )
}

// Notification item component
const NotificationItem = ({
    notification,
    onMarkAsRead,
    onDelete
}: {
    // Keep the props inline here to avoid a hard dependency on context types.
    // The context maps the backend data into this shape.
    notification: {
        id: string
        title: string
        message: string
        time: string
        isRead: boolean
        type: 'info' | 'success' | 'warning' | 'error'
    }
    onMarkAsRead: (id: string) => void
    onDelete: (id: string) => void
}) => {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'border-l-green-500'
            case 'warning': return 'border-l-yellow-500'
            case 'error': return 'border-l-red-500'
            default: return 'border-l-blue-500'
        }
    }

    return (
        <Card className={`mb-3 border-l-4 ${getTypeColor(notification.type)} ${!notification.isRead ? 'bg-blue-50' : ''}`}>
            <CardContent className="px-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4 className={`font-medium text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                        {!notification.isRead && (
                            <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className="p-1 hover:bg-green-100 rounded-full transition-colors"
                                title="Mark as read"
                            >
                                <HiCheck className="w-3 h-3 text-green-600" />
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(notification.id)}
                            className="p-1 hover:bg-red-100 rounded-full transition-colors"
                            title="Delete notification"
                        >
                            <HiX className="w-3 h-3 text-red-600" />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
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
        markAsRead,
        deleteNotification,
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
            <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Benachrichtigungen</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Alle 
                            </button>
                        )}
                    </div>
                </div>

                <div className="max-h-96 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-sm text-gray-500">
                            Lädt Benachrichtigungen...
                        </div>
                    ) : notifications.length === 0 ? (
                                <div className="text-center py-8">
                                    <IoNotificationsOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Keine Benachrichtigungen</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={markAsRead}
                                        onDelete={deleteNotification}
                                    />
                                ))
                            )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                        <button className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium">
                            Alle Benachrichtigungen anzeigen
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
