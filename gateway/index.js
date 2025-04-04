const express = require('express')
const { verify } = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { createProxyServer } = require('http-proxy')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()
const proxy = createProxyServer({})

const AUTH_SERVICE = process.env.AUTH_SERVICE || 'https://auth-service.onrender.com/api/auth'
const CHAT_SERVICE = process.env.CHAT_SERVICE || 'https://chat-service.onrender.com/api/chat'

app.use(cookieParser()) // Để đọc cookies
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n') || 'your-secret-key'

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
  authenticateToken,
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

  proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err)
    res.status(500).json({ message: 'Lỗi proxy' })
  })
})
const PORT = process.env.PORT || 5000 // Dùng 5000 thay vì 3000
app.listen(PORT, () => {
  console.log('API Gateway chạy trên port', PORT)
})
