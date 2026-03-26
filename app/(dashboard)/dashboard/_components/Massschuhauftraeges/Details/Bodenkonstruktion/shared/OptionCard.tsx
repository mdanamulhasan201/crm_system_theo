"use client"

export default function OptionCard({
  label,
  desc,
  price,
  selected,
  onClick,
}: {
  label: string
  desc?: string
  price?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[140px] flex-1 cursor-pointer rounded-lg border px-3 py-3 text-center text-sm font-medium transition-all sm:min-w-[120px] ${
        selected
          ? "border-[#61A175] bg-[#61A175]/15 text-gray-900 shadow-sm ring-1 ring-[#61A175]/25"
          : "border-gray-200 bg-gray-50/80 text-gray-900 hover:border-[#61A175]/55 hover:bg-[#61A175]/6"
      }`}
    >
      <span className="block font-semibold">{label}</span>
      {desc ? <span className="mt-0.5 block text-xs font-normal text-gray-500">{desc}</span> : null}
      {price ? <span className="mt-1 block text-xs font-semibold text-[#61A175]">{price}</span> : null}
    </button>
  )
}
