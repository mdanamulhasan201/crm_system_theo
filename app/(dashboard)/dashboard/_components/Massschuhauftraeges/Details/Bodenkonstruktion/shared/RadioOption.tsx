"use client"

export function RadioOption({
  selected,
  onClick,
  label,
}: {
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-2.5 text-left text-sm text-gray-800 transition-colors hover:text-gray-950"
    >
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected
            ? "border-[#61A175] bg-[#61A175]"
            : "border-gray-300 bg-white group-hover:border-[#61A175]/55"
        }`}
      >
        {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
      </span>
      <span>{label}</span>
    </button>
  )
}
