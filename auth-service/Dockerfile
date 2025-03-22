# Sử dụng Node.js Alpine
FROM node:20-alpine

# Cài các công cụ build cần thiết cho bcrypt
RUN apk add --no-cache make gcc g++ python3

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt thư viện
RUN npm install

# Copy mã nguồn
COPY . .

# Expose cổng
EXPOSE 3000

# Chạy server
CMD ["npm", "start"]
