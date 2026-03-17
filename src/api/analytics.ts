import { client } from './client'

export type AnalyticsRange = '7d' | '30d' | '12m'

export interface KpiMetric  { value: number; change: number }
export interface TimePoint  { label: string; revenue: number; orders: number }

export interface AnalyticsResponse {
  kpis: {
    revenue:   KpiMetric
    orders:    KpiMetric
    customers: KpiMetric
    aov:       KpiMetric
  }
  timeSeries:  TimePoint[]
  topProducts: any[]
}

export const analyticsApi = {
  get: (range: AnalyticsRange = '30d') => client.get<AnalyticsResponse>('/analytics', { params: { range } }),
}
