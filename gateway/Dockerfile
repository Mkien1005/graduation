# Sử dụng image Nginx chính thức
FROM nginx:latest

# Sao chép file cấu hình Nginx vào container
COPY nginx.conf /etc/nginx/nginx.conf

# Expose cổng 80
EXPOSE 80

# Chạy Nginx trong chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
