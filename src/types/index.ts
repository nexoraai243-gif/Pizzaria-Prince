export interface ProductSize {
  name: string;
  multiplier: number;
  price: number;
  default?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  price: number;
  sizes: ProductSize[];
  available: boolean;
  featured: boolean;
}

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  sizeName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  notes?: string;
  imageUrl?: string;
}

export type ServiceType = 'delivery' | 'takeaway' | 'dine_in';

export type OrderStatus =
  | 'Pendente'
  | 'Em Preparação'
  | 'Pronto'
  | 'Em Entrega'
  | 'Atendido'
  | 'Cancelado'
  | 'Arquivado';

export interface OrderItem {
  productId: string;
  name: string;
  sizeName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  serviceType: ServiceType;
  deliveryAddress?: string | null;
  locationReference?: string | null;
  customerNotes?: string | null;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  luandaDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  items: OrderItem[];
}

export interface RestaurantSettings {
  restaurantName: string;
  businessType: string;
  address: string;
  phone: string;
  whatsappPhone: string;
  googleRating: string;
  reviewCount: number;
  currency: string;
  deliveryFee: number;
  deliveryEnabled: boolean;
  takeawayEnabled: boolean;
  dineInEnabled: boolean;
  openingHours: {
    weekdays: string;
    weekends: string;
    closingTime: string;
    note: string;
  };
  disclaimer: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface OrderCounts {
  todayOrders: number;
  todayTotal: number;
  yesterdayOrders: number;
  yesterdayTotal: number;
  pendingOrders: number;
  attendedOrders: number;
  unattendedOrders: number;
  currentLuandaDate: string;
  yesterdayLuandaDate: string;
}

export interface AuditLog {
  id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}
