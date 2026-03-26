"use client"

export function RadioOption({
  selected,
  onClick,
  label,
  disabled = false,
}: {
  selected: boolean
  onClick: () => void
  label: string
  /** When true, not interactive; shows inactive radio styling */
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) onClick()
      }}
      className={`group flex items-center gap-2.5 text-left text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed text-gray-400"
          : "cursor-pointer text-gray-800 hover:text-gray-950"
      }`}
    >
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          disabled
            ? "border-gray-200 bg-gray-50"
            : selected
              ? "border-[#61A175] bg-[#61A175]"
              : "border-gray-300 bg-white group-hover:border-[#61A175]/55"
        }`}
      >
        {!disabled && selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
      </span>
      <span>{label}</span>
    </button>
  )
}
