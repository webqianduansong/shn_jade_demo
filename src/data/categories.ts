import { StaticImageData } from 'next/image';

export type Category = {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  image: StaticImageData;
  products: string[]; // product IDs
};
import type1 from '@/images/shop_type/type1.jpg';
import eh from '@/images/shop_type/eh.jpg';
import xl from '@/images/shop_type/xl.jpg';
import sl from '@/images/shop_type/sl.jpg';

export const categories: Category[] = [
  {
    id: 'rings',
    name: 'Rings',
    nameZh: '戒指',
    description: 'Elegant jade rings for every occasion',
    descriptionZh: '优雅玉石戒指，适合各种场合',
    image: type1,
    products: ['jade-pendant-001', 'jade-bracelet-002']
  },
  {
    id: 'earrings',
    name: 'Earrings',
    nameZh: '耳环',
    description: 'Beautiful jade earrings to complement your style',
    descriptionZh: '精美玉石耳环，衬托您的优雅',
    image: eh,
    products: ['jade-ring-003']
  },
  {
    id: 'necklaces',
    name: 'Necklaces',
    nameZh: '项链',
    description: 'Stunning jade necklaces and pendants',
    descriptionZh: '惊艳玉石项链与吊坠',
    image: xl,
    products: ['jade-pendant-001']
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    nameZh: '手链',
    description: 'Charming jade bracelets and bangles',
    descriptionZh: '迷人玉石手链与手镯',
    image: sl,
    products: ['jade-bracelet-002']
  }
];
