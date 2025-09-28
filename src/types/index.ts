/**
 * 通用类型定义文件
 * 集中管理项目中使用的所有类型定义
 */

/**
 * 操作结果类型
 */
export interface ActionResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * 购物车商品项类型
 */
export interface CartItem {
  productId: string;
  quantity: number;
}

/**
 * 购物车操作结果类型
 */
export interface CartActionResult extends ActionResult<CartItem[]> {}

/**
 * 完整的商品类型定义
 */
export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string | string[];
  category: string;
  tags?: string[];
  stock?: number;
  specifications?: Record<string, string>;
  rating?: number;
  reviews?: number;
  createdAt?: string;
  updatedAt?: string;
  featured?: boolean;
}

/**
 * 购物车中的商品类型（带产品信息）
 */
export interface CartItemWithProduct {
  productId: string;
  quantity: number;
  product: Product;
}

/**
 * 购物车状态类型
 */
export interface CartState {
  items: CartItemWithProduct[];
  totalAmount: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * 分类类型定义
 */
export interface Category {
  id: string;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  image?: string;
  parentId?: string;
  subCategories?: Category[];
}

/**
 * 用户类型定义
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

/**
 * 订单类型定义
 */
export interface Order {
  id: string;
  userId: string;
  items: CartItemWithProduct[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: Address;
  billingAddress?: Address;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 地址类型定义
 */
export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
}

/**
 * API响应类型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * 支持的区域设置类型
 */
export type Locale = 'en' | 'zh' | 'fr' | 'es' | 'de' | 'ja' | 'ko' | 'ru' | 'ar' | 'pt' | 'it';

/**
 * 通知类型
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * 自定义组件属性
 */
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

/**
 * 带国际化的组件属性
 */
export interface LocalizedComponentProps extends BaseComponentProps {
  locale: Locale;
}
