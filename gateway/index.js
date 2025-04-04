import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import cors from 'cors'
// Cấu hình các dịch vụ upstream
const AUTH_SERVICE = 'https://auththen-service.onrender.com/api/auth'
const REVIEW_SERVICE = 'https://review-services.onrender.com/api/reviews'
const BOOKING_SERVICE = 'https://booking-service-kkos.onrender.com/api/bookings'
const HOTEL_SERVICE = 'https://hotel-service-ac92.onrender.com/api/hotels'
const ROOM_SERVICE = 'https://room-service-q9pa.onrender.com/api/rooms'

const app = express()
app.use(cors())

// Proxy cho dịch vụ Identity
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE,
    changeOrigin: true,
  })
)

// // Proxy cho dịch vụ Reviews
// app.use(
//   '/api/reviews',
//   createProxyMiddleware({
//     target: REVIEW_SERVICE,
//     changeOrigin: true,
//   })
// )

// // Proxy cho dịch vụ Bookings
// app.use('/api/bookings',
//   createProxyMiddleware({
//     target: BOOKING_SERVICE,
//     changeOrigin: true,
//   })
// )

// // Proxy cho dịch vụ Hotels
// app.use(
//   '/api/hotels',
//   createProxyMiddleware({
//     target: HOTEL_SERVICE,
//     changeOrigin: true,
//   })
// )

// // Proxy cho dịch vụ Rooms
// app.use(
//   '/api/rooms',
//   createProxyMiddleware({
//     target: ROOM_SERVICE,
//     changeOrigin: true,
//   })
// )

// Khởi chạy server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`API Gateway đang chạy trên http://localhost:${PORT}`)
})
