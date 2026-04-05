import { client } from './client'
import type { Product } from './products'

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface OrderLine {
  id:        string
  productId: string
  product:   Product
  qty:       number
  unitPrice: number
  options?:  Record<string, string>  // optionId → selected value
}

export interface OrderCustomer {
  id:      string
  name:    string
  email:   string
  phone:   string
  address: string
}

export interface Order {
  id:         string
  customerId: string
  customer:   OrderCustomer
  lines:      OrderLine[]
  total:      number
  status:     OrderStatus
  note?:      string
  createdAt:  string
  updatedAt:  string
}

export interface OrdersResponse {
  items:  Order[]
  total:  number
  page:   number
  limit:  number
  pages:  number
}

export interface OrderQuery {
  status?: OrderStatus
  search?: string
  page?:   number
  limit?:  number
}

export const ordersApi = {
  list:   (params?: OrderQuery)                          => client.get<OrdersResponse>('/orders', { params }),
  get:    (id: string)                                   => client.get<Order>(`/orders/${id}`),
  create: (data: { customerId: string; lines: { productId: string; qty: number; unitPrice: number; options?: { name: string; value: string }[] }[]; note?: string }) => client.post<Order>('/orders', data),
  update: (id: string, data: { status: OrderStatus; note?: string }) => client.patch<Order>(`/orders/${id}`, data),
  remove: (id: string)                                   => client.delete(`/orders/${id}`),
}
