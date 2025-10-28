-- 插入测试数据到 Supabase

-- 1. 插入测试用户
-- song@demo.com 密码: song1234
-- admin@example.com 密码: admin123
INSERT INTO "User" (id, email, password, name, "createdAt", "updatedAt")
VALUES 
  ('demo-user-001', 'song@demo.com', '$2b$10$3DvCgIkpLSxXOP/kz2qQR.8kAoNRPvYcfHC.V1IuCX6l7L6StX3IK', '演示用户', NOW(), NOW()),
  ('admin-user-001', 'admin@example.com', '$2b$10$wchmeI89Yv9.jJq4f/XPhOBRFg.ecJDGHl1mnAoCYXSUp2do/7rea', '管理员', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. 插入分类
INSERT INTO "Category" (id, name, slug) VALUES
  ('rings', '戒指', 'rings'),
  ('earrings', '耳环', 'earrings'),
  ('necklaces', '项链', 'necklaces'),
  ('bracelets', '手链', 'bracelets')
ON CONFLICT (id) DO NOTHING;

-- 3. 插入商品（没有图片，需要后续在管理后台上传）
INSERT INTO "Product" (id, name, slug, price, "categoryId", "isHot", "isNew", "createdAt", "updatedAt") VALUES
  ('jade-ring-001', '翠青白玉戒指-吉祥如意', 'jade-ring-001', 125000, 'rings', true, false, NOW(), NOW()),
  ('jade-ring-002', '碧玉戒指-花开富贵', 'jade-ring-002', 158000, 'rings', false, true, NOW(), NOW()),
  ('jade-ring-003', '糖白玉戒指-龙凤呈祥', 'jade-ring-003', 225000, 'rings', false, false, NOW(), NOW()),
  
  ('jade-earring-001', '翠青白玉耳环-清新雅致', 'jade-earring-001', 85000, 'earrings', true, false, NOW(), NOW()),
  ('jade-earring-002', '碧玉耳环-古典韵味', 'jade-earring-002', 120000, 'earrings', false, true, NOW(), NOW()),
  
  ('jade-necklace-001', '（翠青）白玉挂件-交好运', 'jade-necklace-001', 185000, 'necklaces', true, true, NOW(), NOW()),
  ('jade-necklace-002', '碧玉牌-清荷饮露', 'jade-necklace-002', 195000, 'necklaces', false, false, NOW(), NOW()),
  ('jade-necklace-003', '糖白玉项链-福禄寿喜', 'jade-necklace-003', 285000, 'necklaces', false, false, NOW(), NOW()),
  
  ('jade-bracelet-001', '碧玉手链-珠圆玉润', 'jade-bracelet-001', 95000, 'bracelets', false, true, NOW(), NOW()),
  ('jade-bracelet-002', '翠青手镯-温润如玉', 'jade-bracelet-002', 168000, 'bracelets', true, false, NOW(), NOW()),
  ('jade-bracelet-003', '糖白玉手链-平安吉祥', 'jade-bracelet-003', 135000, 'bracelets', false, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 完成
SELECT 'Test data inserted successfully!' AS message;
SELECT COUNT(*) AS "分类数量" FROM "Category";
SELECT COUNT(*) AS "商品数量" FROM "Product";

