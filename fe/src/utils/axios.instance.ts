import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:80'

// Hàng đợi chờ refresh token
let isRefreshing = false
let failedQueue: any = []

const processQueue = (error: any, token = null) => {
  failedQueue.forEach((prom: any) => {
    if (token) {
      prom.resolve(token)
    } else {
      prom.reject(error)
    }
  })
  failedQueue = []
}

// Tạo instance Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Instance cho các request không yêu cầu token
const axiosPublic = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor request
axiosInstance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// Hàm làm mới token
const refreshToken = async () => {
  try {
    const response = await axiosInstance.post('/api/auth/refresh')
    return response.data.accessToken
  } catch (error) {
    throw error
  }
}

// Interceptor response
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Nếu bị lỗi 401 và chưa refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => axiosInstance(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      return new Promise((resolve, reject) => {
        refreshToken()
          .then((newAccessToken) => {
            processQueue(null, newAccessToken)
            resolve(axiosInstance(originalRequest))
          })
          .catch((err) => {
            processQueue(err, null)
            reject(err)
          })
          .finally(() => {
            isRefreshing = false
          })
      })
    }

    return Promise.reject(error)
  }
)

export { axiosInstance, axiosPublic }
