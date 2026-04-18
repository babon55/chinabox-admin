import { client } from './client'

export interface CommentCustomer { id: string; name: string }
export interface CommentProduct  { id: string; nameTk: string; nameRu: string }

export interface AdminComment {
  id:        string
  rating:    number
  text:      string
  createdAt: string
  customer:  CommentCustomer
  product:   CommentProduct
}

export interface CommentsResponse {
  comments: AdminComment[]
  total:    number
  page:     number
  limit:    number
}

export interface CommentsQuery {
  productId?: string
  page?:      number
  limit?:     number
}

export const commentsApi = {
  listAll: (params?: CommentsQuery) =>
    client.get<CommentsResponse>('/products/comments/all', { params }),

  delete: (productId: string, commentId: string) =>
    client.delete(`/products/${productId}/comments/${commentId}`),
}