const express = require('express')
const { verify } = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { createProxyMiddleware } = require('http-proxy-middleware')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// Cấu hình từ biến môi trường
const AUTH_SERVICE = process.env.AUTH_SERVICE || 'https://auth-service.onrender.com/api/auth'
const CHAT_SERVICE = process.env.CHAT_SERVICE || 'https://chat-service.onrender.com/api/chat'
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n')
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, false)
      }
    },
    credentials: true,
  })
)

app.use(cookieParser())

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  const accessToken = req.cookies['access_token']
  if (!accessToken) {
    return res.status(401).json({ message: 'Không tìm thấy access token' })
  }

  try {
    const user = verify(accessToken, JWT_PUBLIC_KEY || 'your-secret-key')
    req.user = user
    next()
  } catch (err) {
    console.error('JWT verification failed:', err.message)
    return res.status(403).json({ message: 'Access token không hợp lệ' })
  }
}

// Proxy middleware với error handling
const createProxy = (target, options = {}) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      console.log('onProxyReq triggered')
      console.log('req.user in onProxyReq :>> ', req.user) // Log req.user ở đây

      // Truyền dữ liệu vào header nếu có user
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.id) // Gửi userId qua header
        proxyReq.setHeader('x-user-role', req.user.role) // Gửi user role
      } else {
        console.log('No user in req.user')
      }
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${target}:`, err.message)
      res.status(500).json({ message: 'Lỗi kết nối đến dịch vụ' })
    },
    ...options,
  })

// Proxy cho Auth Service (không cần auth)
app.use('/api/auth', createProxy(AUTH_SERVICE))

// Proxy cho Chat Service (có auth, dùng SSE)
app.use('/api/chat', createProxy(CHAT_SERVICE))

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack)
  res.status(500).json({ message: 'Lỗi server nội bộ' })
})

// Chạy server trên port
app.listen(PORT, () => {
  console.log(`API Gateway (with SSE) chạy trên port ${PORT}`)
})
