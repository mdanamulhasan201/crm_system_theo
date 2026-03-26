"use client"

import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-blue-700 transition-colors hover:bg-blue-100 hover:text-blue-900"
          aria-label="Info"
        >
          <Info className="h-4 w-4" strokeWidth={2} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
