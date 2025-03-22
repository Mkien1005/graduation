export enum VpsStatus {
  REQUEST = 'request',
  PAID = 'paid',
  INPROGRESS = 'inprogress',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  PROVIDER = 'provider',
}

export enum DeviceStatus {
  AVAILABLE = 'available',
  NOT_AVAILABLE = 'unavailable',
  RENTED = 'rented',
}
