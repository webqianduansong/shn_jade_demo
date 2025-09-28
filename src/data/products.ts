import { StaticImageData } from 'next/image';

export type Product = {
  id: string;
  name: string; // 中文名称
  nameEn: string; // 英文名称
  description: string; // 中文描述
  descriptionEn: string; // 英文描述
  image: StaticImageData;
  price: number; // USD cents simplified in UI
  // 动态翻译字段
  dynamicName?: string;
  dynamicDescription?: string;
};

import jadePendant from '@/images/1.jpg';

const products: Product[] = [
  // 戒指类产品
  {
    id: 'jade-ring-001',
    name: '翠青白玉戒指-吉祥如意',
    nameEn: 'Cuiqing White Jade Ring - Good Fortune',
    description: '精选翠青白玉，雕刻精美，寓意吉祥如意',
    descriptionEn: 'Selected Cuiqing white jade, exquisitely carved, symbolizing good fortune',
    image: jadePendant,
    price: 12500,
  },
  {
    id: 'jade-ring-002',
    name: '碧玉戒指-花开富贵',
    nameEn: 'Biyu Jade Ring - Blooming Wealth',
    description: '上等碧玉雕琢，花朵图案精美，寓意花开富贵',
    descriptionEn: 'Premium Biyu jade carved with exquisite floral patterns, symbolizing blooming wealth',
    image: jadePendant,
    price: 15800,
  },
  {
    id: 'jade-ring-003',
    name: '糖白玉戒指-龙凤呈祥',
    nameEn: 'Sugar White Jade Ring - Dragon and Phoenix',
    description: '糖白玉质地温润，龙凤图案寓意吉祥',
    descriptionEn: 'Warm sugar white jade with dragon and phoenix patterns symbolizing auspiciousness',
    image: jadePendant,
    price: 22500,
  },
  
  // 耳环类产品
  {
    id: 'jade-earring-001',
    name: '翠青白玉耳环-清新雅致',
    nameEn: 'Cuiqing White Jade Earrings - Fresh Elegance',
    description: '清新翠青白玉耳环，衬托女性优雅气质',
    descriptionEn: 'Fresh Cuiqing white jade earrings that complement feminine elegance',
    image: jadePendant,
    price: 8500,
  },
  {
    id: 'jade-earring-002',
    name: '碧玉耳环-古典韵味',
    nameEn: 'Biyu Jade Earrings - Classical Charm',
    description: '古典设计碧玉耳环，展现东方美学',
    descriptionEn: 'Classically designed Biyu jade earrings showcasing Eastern aesthetics',
    image: jadePendant,
    price: 12000,
  },
  
  // 项链类产品
  {
    id: 'jade-necklace-001',
    name: '（翠青）白玉挂件-交好运',
    nameEn: 'Cuiqing White Jade Pendant - Good Luck',
    description: '灵动翠青，寓意多交好运',
    descriptionEn: 'Lively green jade, symbolizing good luck',
    image: jadePendant,
    price: 18500,
  },
  {
    id: 'jade-necklace-002',
    name: '碧玉牌-清荷饮露',
    nameEn: 'Biyu Jade Plate - Clear Lotus Drinking Dew',
    description: '碧玉清润，荷叶承露意境佳',
    descriptionEn: 'Clear and moist Biyu jade, lotus leaves holding dew with excellent artistic conception',
    image: jadePendant,
    price: 19500,
  },
  {
    id: 'jade-necklace-003',
    name: '糖白玉项链-福禄寿喜',
    nameEn: 'Sugar White Jade Necklace - Fortune and Longevity',
    description: '糖白玉项链，寓意福禄寿喜四喜临门',
    descriptionEn: 'Sugar white jade necklace symbolizing fortune, prosperity, longevity and joy',
    image: jadePendant,
    price: 28500,
  },
  
  // 手链类产品
  {
    id: 'jade-bracelet-001',
    name: '碧玉手链-珠圆玉润',
    nameEn: 'Biyu Jade Bracelet - Perfect Roundness',
    description: '精选碧玉珠串，珠圆玉润，佩戴舒适',
    descriptionEn: 'Selected Biyu jade beads, perfectly round and smooth, comfortable to wear',
    image: jadePendant,
    price: 9500,
  },
  {
    id: 'jade-bracelet-002',
    name: '翠青手镯-温润如玉',
    nameEn: 'Cuiqing Jade Bangle - Warm as Jade',
    description: '翠青手镯，温润如玉，彰显品味',
    descriptionEn: 'Cuiqing jade bangle, warm as jade, showcasing taste',
    image: jadePendant,
    price: 16800,
  },
  {
    id: 'jade-bracelet-003',
    name: '糖白玉手链-平安吉祥',
    nameEn: 'Sugar White Jade Bracelet - Peace and Auspiciousness',
    description: '糖白玉手链，寓意平安吉祥，护身辟邪',
    descriptionEn: 'Sugar white jade bracelet symbolizing peace and auspiciousness, protecting from evil',
    image: jadePendant,
    price: 13500,
  },
];

export default products;


