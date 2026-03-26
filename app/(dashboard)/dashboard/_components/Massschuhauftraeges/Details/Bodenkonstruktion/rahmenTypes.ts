export type RahmenVerschalungHoehe = "15" | "20" | "25" | "30" | null
export type RahmenVerschalungAusfuehrung = "oberleder" | "gesamt" | null

export type RahmenData = {
  type: "eva" | "gummi" | "leder" | "verschalung" | null
  color?: string
  /** Nur bei type === "verschalung" */
  verschalungHoehe?: RahmenVerschalungHoehe
  verschalungAusfuehrung?: RahmenVerschalungAusfuehrung
}
