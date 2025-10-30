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

interface HomePageClientProps {
  locale: string;
  categories: Category[];
  hotProducts: Product[];
  newProducts: Product[];
}

export default function HomePageClient({ 
  locale, 
  categories, 
  hotProducts, 
  newProducts 
}: HomePageClientProps) {
  const t = useTranslations();

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

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
