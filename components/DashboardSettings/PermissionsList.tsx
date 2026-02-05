'use client'
import React from 'react'
import { Switch } from "@/components/ui/switch"
import { getIconForPath, getPermissionKeyForTitle } from '@/lib/routePermissionUtils'
import type { IconType } from 'react-icons'
import type { StaticImageData } from 'next/image'
import Image from 'next/image'

interface FeatureItem {
  title: string
  action: boolean
  path: string
  nested?: {
    title: string
    path: string
    action: boolean
  }[]
}

interface PermissionsListProps {
  features: FeatureItem[]
  permissions: Record<string, boolean>
  onPermissionToggle: (key: string, value: boolean) => void
  isLoading?: boolean
}

export default function PermissionsList({
  features,
  permissions,
  onPermissionToggle,
  isLoading = false
}: PermissionsListProps) {
  // Show ALL features (including action: false) - don't filter by action
  // Show only main routes, ignore nested items (don't show nested items)
  const allFeatures = features

  const renderIcon = (icon: IconType | StaticImageData, className?: string) => {
    if (typeof icon === 'function') {
      const IconComponent = icon as IconType
      return <IconComponent className={className || "w-5 h-5"} />
    } else {
      return (
        <Image
          src={icon as StaticImageData}
          alt=""
          width={20}
          height={20}
          className={className || "w-5 h-5 object-contain"}
        />
      )
    }
  }

  return (
    <div className="space-y-2">
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="animate-pulse flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="w-10 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : allFeatures.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Keine Routen verfügbar</p>
        </div>
      ) : (
        allFeatures.map((feature) => {
          const permissionKey = getPermissionKeyForTitle(feature.title)
          // Use feature.action directly (from API response) or fallback to permissions
          const isEnabled = permissions[permissionKey] ?? feature.action ?? false
          const icon = getIconForPath(feature.path)

          return (
            <div
              key={feature.path}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 text-gray-600">
                  {renderIcon(icon)}
                </div>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {feature.title}
                </span>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => onPermissionToggle(permissionKey, checked)}
                className="flex-shrink-0"
              />
            </div>
          )
        })
      )}
    </div>
  )
}

