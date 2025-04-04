import express from 'express'
import { verify } from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { createProxyServer } from 'http-proxy'
const app = express()
const proxy = createProxyServer({})

const AUTH_SERVICE = 'https://auththen-service.onrender.com/api/auth'
const CHAT_SERVICE = 'https://chat-service.onrender.com/api/chat'

app.use(cookieParser()) // Để đọc cookies
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY || 'your-secret-key'

// Middleware xác thực token từ cookie
const authenticateToken = (req, res, next) => {
  const accessToken = req.cookies['access_token'] // Lấy access token từ cookie

  if (!accessToken) {
    return res.status(401).json({ message: 'Không tìm thấy access token' })
  }

  verify(accessToken, JWT_PUBLIC_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Access token không hợp lệ' })
    }
    req.user = user // Gắn thông tin user vào request
    next()
  })
}

// Proxy cho dịch vụ Identity
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE,
    changeOrigin: true,
  })
)

// Proxy cho dịch vụ Chat
app.use(
  '/api/chat',
  createProxyMiddleware({
    target: CHAT_SERVICE,
    changeOrigin: true,
  })
)

// Route ví dụ: Chuyển tiếp đến User Service
app.get('/users/:id', authenticateToken, (req, res) => {
  // Gửi thông tin user qua header
  req.headers['x-user-id'] = req.user.id
  req.headers['x-user-role'] = req.user.role

  proxy.web(req, res, {
    target: 'http://user-service:3001', // Địa chỉ User Service
  })
})

app.listen(process.env.PORT || 3000, () => {
  console.log('API Gateway chạy trên port', process.env.PORT || 3000)
})
