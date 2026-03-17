import { client } from './client'
import type { OrderStatus } from './orders'

export interface CustomerOrder {
  id:        string
  total:     number
  status:    OrderStatus
  createdAt: string
}

export interface Customer {
  id:          string
  name:        string
  email:       string
  phone:       string
  address:     string
  status:      'ACTIVE' | 'BLOCKED'
  totalSpent:  number
  createdAt:   string
  updatedAt:   string
  _count?:     { orders: number }
  orders?:     CustomerOrder[]
}

export interface CustomersResponse {
  items:  Customer[]
  total:  number
  page:   number
  limit:  number
  pages:  number
}

export interface CustomerQuery {
  status?: 'ACTIVE' | 'BLOCKED'
  search?: string
  page?:   number
  limit?:  number
}

export interface CustomerForm {
  name:    string
  email:   string
  phone:   string
  address: string
  status?: 'ACTIVE' | 'BLOCKED'
}

export const customersApi = {
  list:   (params?: CustomerQuery)                  => client.get<CustomersResponse>('/customers', { params }),
  get:    (id: string)                              => client.get<Customer>(`/customers/${id}`),
  create: (data: CustomerForm)                      => client.post<Customer>('/customers', data),
  update: (id: string, data: Partial<CustomerForm>) => client.patch<Customer>(`/customers/${id}`, data),
  remove: (id: string)                              => client.delete(`/customers/${id}`),
}
