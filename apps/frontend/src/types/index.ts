export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  fullName: string;
  avatar?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  organization?: string;
  role: Role;
  isActive: boolean;
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export enum Role {
  BUYER = "BUYER",
  SELLER = "SELLER",
  BOTH = "BOTH",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ProductStatus {
  AVAILABLE = "AVAILABLE",
  SOLD = "SOLD",
  RESERVED = "RESERVED",
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  price?: number;
  isFree: boolean;
  images: string[];
  address: string;
  latitude: number;
  longitude: number;
  status: ProductStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  seller: User;
  sellerId: string;
}

export interface Order {
  id: string;
  quantity: number;
  totalPrice?: number;
  message?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  product: Product;
  productId: string;
  buyer: User;
  buyerId: string;
  seller: User;
  sellerId: string;
}

export interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  conversationId: string;
  sender: User;
  senderId: string;
  receiver: User;
  receiverId: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: User[];
  messages: Message[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: User;
  reviewerId: string;
  reviewee: User;
  revieweeId: string;
  product: Product;
  productId: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: Role;
    avatar?: string;
  };
}

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  phone?: string;
  password: string;
  fullName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  organization?: string;
  role?: Role;
}
