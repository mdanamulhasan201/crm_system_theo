"use client"

export default function VerschalungAusfuehrungCard({
  imageSrc,
  title,
  description,
  selected,
  onClick,
  imageAlt,
}: {
  imageSrc: string
  title: string
  description: string
  selected: boolean
  onClick: () => void
  imageAlt: string
}) {
  const src = imageSrc.startsWith("/") ? encodeURI(imageSrc) : encodeURI(`/${imageSrc}`)
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
        selected
          ? "border-[#61A175] bg-[#61A175]/8 shadow-sm ring-1 ring-[#61A175]/25"
          : "border-gray-200 bg-gray-50/80 hover:border-[#61A175]/45"
      }`}
    >
      <div className="relative h-[120px] w-[120px] shrink-0">
        <img
          src={src}
          alt={imageAlt}
          width={120}
          height={120}
          loading="lazy"
          className="h-[120px] w-[120px] object-contain"
        />
      </div>
      <span className="text-sm font-semibold text-gray-900">{title}</span>
      <span className="text-xs leading-tight text-gray-500">{description}</span>
    </button>
  )
}
