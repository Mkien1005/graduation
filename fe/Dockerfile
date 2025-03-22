# Sử dụng image node phiên bản LTS (Long Term Support) làm base image
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json (hoặc yarn.lock) vào thư mục làm việc
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Build ứng dụng Next.js
RUN npm run build

# Expose port 3000 để ứng dụng có thể truy cập từ bên ngoài
EXPOSE 3000

# Chạy ứng dụng Next.js
CMD ["npm", "start"]