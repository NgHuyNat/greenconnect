export enum Role {
  BUYER = "BUYER",
  SELLER = "SELLER",
  BOTH = "BOTH",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum ProductStatus {
  AVAILABLE = "AVAILABLE",
  SOLD_OUT = "SOLD_OUT",
  DISCONTINUED = "DISCONTINUED",
}

// Define User interface based on schema
export interface User {
  id: string;
  email: string;
  phone?: string | null;
  username: string;
  password: string;
  fullName: string;
  avatar?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  organization?: string | null;
  role: Role;
  isActive: boolean;
  rating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  images: string[];
  location: string;
  harvestDate?: Date | null;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
  sellerId: string;
}

export interface Order {
  id: string;
  quantity: number;
  totalPrice: number;
  shippingAddress: string;
  phoneNumber: string;
  notes?: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  buyerId: string;
  sellerId: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  buyerId: string;
  productId: string;
  orderId: string;
}
