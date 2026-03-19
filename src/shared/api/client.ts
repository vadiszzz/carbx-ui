import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getPrivyAccessToken } from '@/shared/api/privy-access-token'

declare module 'axios' {
  interface InternalAxiosRequestConfig<D = any> {
    _privyRetry?: boolean
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  withCredentials: true,
})

apiClient.interceptors.request.use(async (config) => {
  const token = await getPrivyAccessToken()

  if (!token) {
    return config
  }

  config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig | undefined

    if (!config || config._privyRetry || error.response?.status !== 401) {
      throw error
    }

    config._privyRetry = true

    const token = await getPrivyAccessToken()
    if (!token) {
      throw error
    }

    config.headers.set('Authorization', `Bearer ${token}`)
    return apiClient.request(config)
  }
)
