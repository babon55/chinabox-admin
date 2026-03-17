import { client } from './client'

export interface Category { id: string; nameTk: string; nameRu: string }

export interface Product {
  id:         string
  nameTk:     string
  nameRu:     string
  categoryId: string
  category:   Category
  image:      string
  imageUrl?:  string | null
  price:      number
  weightG?:   number | null
  stock:      number
  sold:       number
  status:     'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  createdAt:  string
  updatedAt:  string
}

export interface ProductForm {
  nameTk:     string
  nameRu:     string
  categoryId: string
  image:      string
  imageUrl?:  string | null
  price:      number
  weightG?:   number | null
  stock:      number
  status:     'ACTIVE' | 'DRAFT' | 'ARCHIVED'
}

export interface ProductsResponse {
  items:  Product[]
  total:  number
  page:   number
  limit:  number
  pages:  number
}

export interface ProductQuery {
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  search?: string
  page?:   number
  limit?:  number
}

export const productsApi = {
  list:          (params?: ProductQuery)              => client.get<ProductsResponse>('/products', { params }),
  get:           (id: string)                         => client.get<Product>(`/products/${id}`),
  create:        (data: ProductForm)                  => client.post<Product>('/products', data),
  update:        (id: string, data: Partial<ProductForm>) => client.patch<Product>(`/products/${id}`, data),
  remove:        (id: string)                         => client.delete(`/products/${id}`),
  categories:    ()                                   => client.get<Category[]>('/products/categories/all'),
}

export const uploadApi = {
  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return client.post<{ url: string; publicId: string }>('/upload/product', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteImage: (publicId: string) => client.delete('/upload/product', { data: { publicId } }),
}
