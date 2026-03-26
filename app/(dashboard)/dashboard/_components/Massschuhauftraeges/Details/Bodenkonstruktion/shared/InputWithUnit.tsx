"use client"

export default function InputWithUnit({
  value,
  onChange,
  unit,
  placeholder,
  className = "",
}: {
  value: string
  onChange: (v: string) => void
  unit: string
  placeholder?: string
  className?: string
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-sm ${className}`}
    >
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-900 outline-none focus:ring-0"
      />
      <span className="shrink-0 text-xs font-medium text-gray-500">{unit}</span>
    </div>
  )
}
