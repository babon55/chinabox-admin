import { client } from './client'

export interface StoreSettings {
  id:        string
  nameTk:    string
  nameRu:    string
  taglineTk: string
  taglineRu: string
  email:     string
  phone:     string
  addressTk: string
  addressRu: string
  currency:  string
  logo:      string
}

export const settingsApi = {
  getStore:    ()                              => client.get<StoreSettings>('/settings/store'),
  updateStore: (data: Partial<StoreSettings>) => client.patch<StoreSettings>('/settings/store', data),
}
