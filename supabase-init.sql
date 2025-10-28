-- 玉石网站数据库初始化脚本 (PostgreSQL)

-- 创建枚举类型
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'SHIPPED');

-- 用户表
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 分类表
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "image" TEXT
);

-- 商品表
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "sku" TEXT UNIQUE,
    "model" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL,
    "categoryId" TEXT,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 商品图片表
CREATE TABLE IF NOT EXISTS "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 购物车表
CREATE TABLE IF NOT EXISTS "Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 购物车项表
CREATE TABLE IF NOT EXISTS "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("cartId", "productId")
);

-- 地址表
CREATE TABLE IF NOT EXISTS "Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "postal" TEXT NOT NULL,
    CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 订单表
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" INTEGER NOT NULL,
    "paymentRef" TEXT,
    "addressId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 订单项表
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "idx_product_category" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_product_hot" ON "Product"("isHot");
CREATE INDEX IF NOT EXISTS "idx_product_new" ON "Product"("isNew");
CREATE INDEX IF NOT EXISTS "idx_product_featured" ON "Product"("isFeatured");
CREATE INDEX IF NOT EXISTS "idx_product_image_product" ON "ProductImage"("productId");
CREATE INDEX IF NOT EXISTS "idx_cart_user" ON "Cart"("userId");
CREATE INDEX IF NOT EXISTS "idx_order_user" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "idx_order_status" ON "Order"("status");

-- 完成
SELECT 'Database schema created successfully!' AS message;

