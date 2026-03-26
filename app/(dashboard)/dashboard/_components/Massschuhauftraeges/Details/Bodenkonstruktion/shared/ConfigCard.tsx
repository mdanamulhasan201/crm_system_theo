"use client"

import React from "react"

export default function ConfigCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] sm:p-6">
      <div className="mb-5 flex gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#61A175]/12 text-[#61A175]">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-0">{children}</div>
    </section>
  )
}
