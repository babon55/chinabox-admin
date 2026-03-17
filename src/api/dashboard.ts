import { client } from './client'

export interface DashboardStats {
  revenue:   number
  orders:    number
  customers: number
  products:  number
}

export interface DashboardResponse {
  stats:          DashboardStats
  ordersByStatus: Record<string, number>
  recentOrders:   any[]
  topProducts:    any[]
}

export const dashboardApi = {
  get: () => client.get<DashboardResponse>('/dashboard'),
}
