export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
}

export interface AuthenticatedRequest {
  userId: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';

export interface ApiResponse<T = object> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}