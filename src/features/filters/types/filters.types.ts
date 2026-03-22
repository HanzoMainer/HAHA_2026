export type EntityFilterType = "person" | "organization" | "event"

export interface DateRange {
  from: Date | null
  to: Date | null
}

export interface ActiveFilters {
  entityTypes: EntityFilterType[]
  clusters: string[]
  dateRange: DateRange
  depthLimit: number
}
