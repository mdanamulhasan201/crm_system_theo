"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { IoNotificationsOutline } from "react-icons/io5"
import { HiOutlineTrash, HiChevronRight } from "react-icons/hi2"
import { useNotifications } from "@/contexts/NotificationContext"
import { getNotificationClickRoute } from "@/lib/notificationRoutes"

const Badge = ({ count }: { count: number }) => {
    if (count === 0) return null
    return (
        <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 text-white text-[10px] leading-5 rounded-full flex items-center justify-center font-bold shadow-md tabular-nums">
            {count > 99 ? "99+" : count}
        </div>
    )
}

function NotificationRow({
    notification,
    clickable,
    onActivate,
    onDelete,
    isDeleting,
}: {
    notification: {
        id: string
        title: string
        time: string
        deepRead: boolean
    }
    clickable: boolean
    onActivate: () => void | Promise<void>
    onDelete: () => void | Promise<void>
    isDeleting: boolean
}) {
    const unreadStyle = !notification.deepRead

    const content = (
        <div className="min-w-0 flex-1">
            <p
                className={[
                    "text-[13px] leading-snug transition-colors",
                    unreadStyle
                        ? "font-semibold text-slate-900"
                        : "font-normal text-slate-600",
                    clickable && "group-hover:text-blue-600",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {notification.title}
            </p>
            <p className="mt-1 text-[11px] tabular-nums text-slate-400">
                {notification.time}
            </p>
        </div>
    )

    const rowShell = (child: React.ReactNode) => (
        <div className="group/item relative flex items-stretch border-b border-slate-100/80 last:border-b-0">
            {child}
            <div className="flex shrink-0 items-center pe-2">
                <button
                    type="button"
                    disabled={isDeleting}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        void onDelete()
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover/item:opacity-100 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Benachrichtigung löschen"
                    title="Löschen"
                >
                    {isDeleting ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-rose-500" />
                    ) : (
                        <HiOutlineTrash className="text-lg" />
                    )}
                </button>
            </div>
        </div>
    )

    if (clickable) {
        return rowShell(
            <button
                type="button"
                className="flex min-w-0 flex-1 items-start gap-2 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/95"
                onClick={() => void onActivate()}
            >
                {content}
                <HiChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover/item:text-blue-500" />
            </button>
        )
    }

    return rowShell(
        <div className="flex min-w-0 flex-1 items-start px-4 py-3.5">{content}</div>
    )
}

export default function NotificationPage() {
    const {
        notifications,
        unreadCount,
        markAllAsRead,
        onOpenNotificationPanel,
        markNotificationDeepRead,
        deleteNotifications,
        isLoading,
        isLoadingMore,
        hasMoreNotifications,
        loadMoreNotifications,
    } = useNotifications()

    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDeleteOne = async (id: string) => {
        setDeletingId(id)
        try {
            await deleteNotifications([id])
        } catch {
            /* keep row; optional: toast */
        } finally {
            setDeletingId(null)
        }
    }

    const handleNotificationActivate = async (
        notificationId: string,
        targetRoute: string,
        alreadyDeepRead: boolean
    ) => {
        try {
            if (!alreadyDeepRead) {
                await markNotificationDeepRead(notificationId)
            }
        } catch {
            return
        }
        setOpen(false)
        router.push(targetRoute)
    }

    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen)
                if (nextOpen) void onOpenNotificationPanel()
            }}
        >
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="relative rounded-lg p-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Benachrichtigungen"
                >
                    <IoNotificationsOutline className="text-2xl" />
                    <Badge count={unreadCount} />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[min(100vw-1.25rem,24rem)] overflow-hidden rounded-2xl border border-slate-200/90 p-0 shadow-2xl shadow-slate-300/25"
                align="end"
                sideOffset={10}
            >
                <header className="border-b border-slate-100 bg-white px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                                <IoNotificationsOutline className="text-xl opacity-90" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
                                    Benachrichtigungen
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {unreadCount > 0
                                        ? `${unreadCount} ungelesen`
                                        : "Sie sind auf dem neuesten Stand"}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() => void markAllAsRead()}
                                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
                            >
                                Alle gelesen
                            </button>
                        )}
                    </div>
                </header>

                <div className="max-h-112 overflow-y-auto bg-white">
                    {isLoading ? (
                        <div className="flex flex-col items-center py-16">
                            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-100 border-t-slate-800" />
                            <p className="text-sm text-slate-500">Wird geladen…</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                                <IoNotificationsOutline className="text-2xl text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-800">
                                Keine Benachrichtigungen
                            </p>
                            <p className="mx-auto mt-1 max-w-[220px] text-xs leading-relaxed text-slate-500">
                                Neue Meldungen zu Terminen und Bestellungen erscheinen hier.
                            </p>
                        </div>
                    ) : (
                        <div>
                            {notifications.map((notification) => {
                                const targetRoute = getNotificationClickRoute(
                                    notification.backendType
                                )
                                const clickable = targetRoute !== null
                                return (
                                    <NotificationRow
                                        key={notification.id}
                                        notification={notification}
                                        clickable={clickable}
                                        isDeleting={deletingId === notification.id}
                                        onDelete={() => handleDeleteOne(notification.id)}
                                        onActivate={() =>
                                            targetRoute
                                                ? handleNotificationActivate(
                                                      notification.id,
                                                      targetRoute,
                                                      notification.deepRead
                                                  )
                                                : undefined
                                        }
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && hasMoreNotifications && (
                    <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2.5">
                        <button
                            type="button"
                            disabled={isLoadingMore}
                            onClick={() => void loadMoreNotifications()}
                            className="w-full rounded-xl py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-white hover:text-slate-900 disabled:opacity-50"
                        >
                            {isLoadingMore ? "Wird geladen…" : "Weitere laden"}
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
