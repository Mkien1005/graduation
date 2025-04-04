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
console.log('ALLOWED_ORIGINS :>> ', ALLOWED_ORIGINS)
// Middleware CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, false) // Trả về false thay vì throw Error để tránh crash
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
    const user = verify(accessToken, JWT_PUBLIC_KEY || 'your-secret-key') // Fallback key cho dev
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
    onError: (err, req, res) => {
      console.error(`Proxy error for ${target}:`, err.message)
      res.status(500).json({ message: 'Lỗi kết nối đến dịch vụ' })
    },
    ...options,
  })

// Proxy cho Auth Service (không cần auth)
app.use('/api/auth', createProxy(AUTH_SERVICE))

// Proxy cho Chat Service (có auth, hỗ trợ streaming nếu cần)
app.use(
  '/api/chat',
  authenticateToken,
  createProxy(CHAT_SERVICE, {
    // Nếu CHAT_SERVICE hỗ trợ SSE
    selfHandleResponse: true, // Để tự xử lý response
    onProxyRes: (proxyRes, req, res) => {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      proxyRes.pipe(res) // Stream response trực tiếp
    },
  })
)

// Route ví dụ cho User Service
app.get('/users/:id', authenticateToken, (req, res) => {
  const proxy = createProxyMiddleware({
    target: 'http://user-service:3001',
    changeOrigin: true,
    headers: {
      'x-user-id': req.user.id,
      'x-user-role': req.user.role,
    },
  })
  proxy(req, res, (err) => {
    console.error('Proxy error for User Service:', err?.message)
    res.status(500).json({ message: 'Lỗi proxy đến User Service' })
  })
})

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack)
  res.status(500).json({ message: 'Lỗi server nội bộ' })
})

app.listen(PORT, () => {
  console.log(`API Gateway chạy trên port ${PORT}`)
})
