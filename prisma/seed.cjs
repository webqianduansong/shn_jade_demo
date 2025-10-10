const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // 演示账号
  const demoEmail = 'demo@jade.test';
  const demoPasswordHash = await bcrypt.hash('demo1234', 10);
  await prisma.user.upsert({
    where: { email: demoEmail },
    create: { email: demoEmail, password: demoPasswordHash, name: '演示用户' },
    update: { name: '演示用户', password: demoPasswordHash },
  });
  const categories = [
    { id: 'rings', name: '戒指', slug: 'rings' },
    { id: 'earrings', name: '耳环', slug: 'earrings' },
    { id: 'necklaces', name: '项链', slug: 'necklaces' },
    { id: 'bracelets', name: '手链', slug: 'bracelets' },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      create: c,
      update: { name: c.name, slug: c.slug },
    });
  }

  const products = [
    { id: 'jade-ring-001', name: '翠青白玉戒指-吉祥如意', slug: 'jade-ring-001', price: 12500, categoryId: 'rings' },
    { id: 'jade-ring-002', name: '碧玉戒指-花开富贵', slug: 'jade-ring-002', price: 15800, categoryId: 'rings' },
    { id: 'jade-ring-003', name: '糖白玉戒指-龙凤呈祥', slug: 'jade-ring-003', price: 22500, categoryId: 'rings' },
    { id: 'jade-earring-001', name: '翠青白玉耳环-清新雅致', slug: 'jade-earring-001', price: 8500, categoryId: 'earrings' },
    { id: 'jade-earring-002', name: '碧玉耳环-古典韵味', slug: 'jade-earring-002', price: 12000, categoryId: 'earrings' },
    { id: 'jade-necklace-001', name: '（翠青）白玉挂件-交好运', slug: 'jade-necklace-001', price: 18500, categoryId: 'necklaces' },
    { id: 'jade-necklace-002', name: '碧玉牌-清荷饮露', slug: 'jade-necklace-002', price: 19500, categoryId: 'necklaces' },
    { id: 'jade-necklace-003', name: '糖白玉项链-福禄寿喜', slug: 'jade-necklace-003', price: 28500, categoryId: 'necklaces' },
    { id: 'jade-bracelet-001', name: '碧玉手链-珠圆玉润', slug: 'jade-bracelet-001', price: 9500, categoryId: 'bracelets' },
    { id: 'jade-bracelet-002', name: '翠青手镯-温润如玉', slug: 'jade-bracelet-002', price: 16800, categoryId: 'bracelets' },
    { id: 'jade-bracelet-003', name: '糖白玉手链-平安吉祥', slug: 'jade-bracelet-003', price: 13500, categoryId: 'bracelets' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: p,
      update: { name: p.name, slug: p.slug, price: p.price, categoryId: p.categoryId },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


