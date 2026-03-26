"use client"

import { Frame } from "lucide-react"
import ConfigCard from "./shared/ConfigCard"
import { RahmenOptionsContent } from "./RahmenOptionsContent"
import type { RahmenData } from "./rahmenTypes"

export default function RahmenUnifiedConfigCard({
  value,
  onChange,
  hidePrice = false,
}: {
  value: RahmenData | null
  onChange: (value: RahmenData | null) => void
  hidePrice?: boolean
}) {
  return (
    <ConfigCard
      title="Rahmen"
      subtitle="Rahmentyp – immer beidseitig identisch"
      icon={<Frame size={20} />}
    >
      <RahmenOptionsContent value={value} onChange={onChange} hidePrice={hidePrice} />
    </ConfigCard>
  )
}
