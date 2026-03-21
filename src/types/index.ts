// ─── Language ─────────────────────────────────────────────────────────────────
export type Lang = 'tk' | 'ru'

// ─── Nav ──────────────────────────────────────────────────────────────────────
export interface NavItem {
  key:    string
  label:  Record<Lang, string>
  icon:   string
  path:   string
  badge?: number
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface StatCard {
  key:    string
  label:  Record<Lang, string>
  value:  string
  change: number
  icon:   string
  color:  string
}

export interface ChartPoint {
  label: string
  value: number
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

// Slim shape used on Dashboard
export interface Order {
  id:       string
  customer: string
  items:    number
  total:    number
  status:   OrderStatus
  date:     string
}

// Full shape used in Orders view
export interface OrderLine {
  productId:   string
  name:        Record<Lang, string>
  image:       string
  qty:         number
  unitPrice:   number
}

export interface OrderItem {
  id:          string
  customer:    string
  email:       string
  phone:       string
  address:     string
  lines:       OrderLine[]
  total:       number
  status:      OrderStatus
  date:        string
  note?:       string
}

// Used on Dashboard top-products widget
export interface Product {
  id:      string
  name:    Record<Lang, string>
  image:   string
  sold:    number
  revenue: number
  stock:   number
}

// ─── Products view ────────────────────────────────────────────────────────────
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED'

export interface ProductItem {
  id:         string
  name:       Record<Lang, string>
  category:   Record<Lang, string>
  image:      string       // emoji for now, URL later
  price:      number
  stock:      number
  sold:       number
  status:     ProductStatus
  createdAt:  string
}

// Empty form shape used by the add/edit modal
export type ProductForm = Omit<ProductItem, 'id' | 'sold' | 'createdAt'>

// ─── Customers view ───────────────────────────────────────────────────────────
export type CustomerStatus = 'ACTIVE' | 'BLOCKED'

export interface CustomerOrder {
  id:     string
  total:  number
  status: OrderStatus
  date:   string
}

export interface CustomerItem {
  id:          string
  name:        string
  email:       string
  phone:       string
  address:     string
  status:      CustomerStatus
  totalOrders: number
  totalSpent:  number
  joined:      string
  orders:      CustomerOrder[]
}

export type CustomerForm = Pick<CustomerItem, 'name' | 'email' | 'phone' | 'address' | 'status'>
