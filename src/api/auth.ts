import { client } from './client'

export interface LoginPayload { email: string; password: string }
export interface AuthUser { id: string; name: string; email: string; role: string; avatar: string }
export interface AuthResponse { accessToken: string; refreshToken: string; user: AuthUser }

export const authApi = {
  login:          (data: LoginPayload)                    => client.post<AuthResponse>('/auth/login', data),
  refresh:        (refreshToken: string)                  => client.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
  logout:         (refreshToken: string)                  => client.post('/auth/logout', { refreshToken }),
  me:             ()                                      => client.get<AuthUser>('/auth/me'),
  updateMe:       (data: Partial<AuthUser & { phone: string; timezone: string; langPref: string }>) => client.patch<AuthUser>('/auth/me', data),
  changePassword: (currentPassword: string, newPassword: string) => client.post('/auth/change-password', { currentPassword, newPassword }),
}
