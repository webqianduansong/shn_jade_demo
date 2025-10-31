"use client";
import { useTranslations } from "next-intl";
import HeroCarousel from "./HeroCarousel";
import FeaturesSection from "./FeaturesSection";
import CategoriesSection from "./CategoriesSection";
import ProductsSection from "./ProductsSection";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  products: Array<{
    images: Array<{ url: string }>;
  }>;
  _count: {
    products: number;
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  images?: { url: string }[];
  category?: { name: string; slug: string };
}

interface Banner {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
}

interface HomePageClientProps {
  locale: string;
  categories: Category[];
  hotProducts: Product[];
  newProducts: Product[];
  banners: Banner[];
}

export default function HomePageClient({ 
  locale, 
  categories, 
  hotProducts, 
  newProducts,
  banners
}: HomePageClientProps) {
  const t = useTranslations();

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel banners={banners} />

      {/* Selling points */}
      <FeaturesSection />

      {/* Categories */}
      <CategoriesSection locale={locale} categories={categories} />

      {/* Featured Products */}
      <ProductsSection 
        locale={locale} 
        hotProducts={hotProducts}
        newProducts={newProducts}
      />
    </>
  );
}
