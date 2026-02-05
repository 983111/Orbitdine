export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  MANAGER = 'MANAGER',
  OWNER = 'OWNER'
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  DINING = 'DINING',
  NEW_ORDER = 'NEW_ORDER',
  BILL_REQUESTED = 'BILL_REQUESTED'
}

export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED'
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  isTopQuest?: boolean;
}

export interface CartItem extends MenuItem {
  cartId: string;
  quantity: number;
  modifiers?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  tableId: number;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  timestamp: Date;
}

export interface Table {
  id: number;
  status: TableStatus;
  capacity: number;
  currentOrderId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}